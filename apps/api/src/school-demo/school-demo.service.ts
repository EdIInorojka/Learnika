import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../database/prisma.service";
import {
  SCHOOL_DEMO_LOCALE,
  SCHOOL_DEMO_MARKER,
  SYNTHETIC_DEMO_ORGANIZATION_CODE,
  SYNTHETIC_DEMO_SCHOOL_CODE,
  type SchoolDemoAcademicYearSummary,
  type SchoolDemoClassSummary,
  type SchoolDemoEntitlementSummary,
  type SchoolDemoLicenseSummary,
  type SchoolDemoSnapshotResponse,
  type SchoolDemoStudentEnrollmentSummary,
  type SchoolDemoStudentSummary,
  type SchoolDemoSubjectGroupSummary,
  type SchoolDemoTeacherAssignmentSummary,
  type SchoolDemoTeacherSummary,
} from "./school-demo.types";

@Injectable()
export class SchoolDemoService {
  constructor(private readonly prisma: PrismaService) {}

  async getSyntheticSchoolSnapshot(): Promise<SchoolDemoSnapshotResponse> {
    const school = await this.prisma.school.findFirst({
      include: {
        academicYears: true,
        assignments: {
          include: {
            schoolClass: true,
            schoolTeacher: true,
            subjectGroup: true,
          },
        },
        classes: true,
        entitlements: true,
        enrollments: {
          include: {
            schoolClass: true,
            schoolStudent: true,
          },
        },
        licenses: {
          include: {
            entitlements: true,
          },
        },
        organization: {
          include: {
            schools: {
              select: { code: true },
            },
          },
        },
        students: true,
        subjectGroups: true,
        teachers: true,
      },
      where: {
        code: SYNTHETIC_DEMO_SCHOOL_CODE,
        organization: {
          code: SYNTHETIC_DEMO_ORGANIZATION_CODE,
        },
      },
    });

    if (!school) {
      throw new NotFoundException({
        code: "SCHOOL_DEMO_SEED_NOT_FOUND",
        message: "Synthetic school demo seed data is not available.",
      });
    }

    const academicYear = [...school.academicYears].sort((left, right) =>
      left.code.localeCompare(right.code),
    )[0];
    const license = [...school.licenses].sort((left, right) =>
      left.licenseCode.localeCompare(right.licenseCode),
    )[0];

    if (!academicYear || !license) {
      throw new NotFoundException({
        code: "SCHOOL_DEMO_SEED_INCOMPLETE",
        message: "Synthetic school demo seed data is incomplete.",
      });
    }

    const classes = [...school.classes].sort(compareClassRecords);
    const subjectGroups = [...school.subjectGroups].sort((left, right) =>
      left.code.localeCompare(right.code),
    );
    const teachers = [...school.teachers].sort((left, right) =>
      left.demoCode.localeCompare(right.demoCode),
    );
    const students = [...school.students].sort((left, right) =>
      left.demoCode.localeCompare(right.demoCode),
    );
    const assignments = [...school.assignments].sort((left, right) =>
      `${left.schoolClass.gradeLevel}:${left.schoolClass.code}:${left.subjectGroup.code}`.localeCompare(
        `${right.schoolClass.gradeLevel}:${right.schoolClass.code}:${right.subjectGroup.code}`,
      ),
    );
    const enrollments = [...school.enrollments].sort((left, right) =>
      `${left.schoolClass.gradeLevel}:${left.schoolClass.code}:${left.schoolStudent.demoCode}`.localeCompare(
        `${right.schoolClass.gradeLevel}:${right.schoolClass.code}:${right.schoolStudent.demoCode}`,
      ),
    );
    const entitlements = [...school.entitlements].sort((left, right) =>
      left.capabilityCode.localeCompare(right.capabilityCode),
    );

    return {
      data: {
        snapshot: {
          academicYear: toAcademicYearSummary(academicYear),
          boundary: {
            activation: "BLOCKED",
            familyLinkCount: 0,
            mutationAllowed: false,
            productionDataCount: 0,
            readiness: "NOT_READY",
            realSchoolCount: 0,
            workflow: "INACTIVE",
          },
          classes: classes.map((schoolClass): SchoolDemoClassSummary => {
            const classAssignments = assignments.filter(
              (assignment) => assignment.schoolClassId === schoolClass.id,
            );
            const classEnrollments = enrollments.filter(
              (enrollment) => enrollment.schoolClassId === schoolClass.id,
            );
            return {
              code: schoolClass.code,
              gradeLevel: schoolClass.gradeLevel,
              studentCount: classEnrollments.length,
              subjectGroupCodes: uniqueSorted(
                classAssignments.map((assignment) => assignment.subjectGroup.code),
              ),
              teacherDemoCodes: uniqueSorted(
                classAssignments.map((assignment) => assignment.schoolTeacher.demoCode),
              ),
            };
          }),
          entitlements: entitlements.map(toEntitlementSummary),
          license: toLicenseSummary(license),
          locale: SCHOOL_DEMO_LOCALE,
          marker: SCHOOL_DEMO_MARKER,
          organization: {
            code: school.organization.code,
            schoolCount: school.organization.schools.length,
          },
          school: { code: school.code },
          studentEnrollments: enrollments.map(toStudentEnrollmentSummary),
          students: students.map((student): SchoolDemoStudentSummary => {
            const enrollment = enrollments.find(
              (candidate) => candidate.schoolStudentId === student.id,
            );
            if (!enrollment) {
              return {
                classCode: "UNASSIGNED_SYNTHETIC_DEMO",
                demoCode: student.demoCode,
                enrollmentState: "WITHDRAWN",
              };
            }
            return {
              classCode: enrollment.schoolClass.code,
              demoCode: student.demoCode,
              enrollmentState: enrollment.withdrawnAt ? "WITHDRAWN" : "ENROLLED",
            };
          }),
          subjectGroups: subjectGroups.map(toSubjectGroupSummary),
          teacherAssignments: assignments.map(toTeacherAssignmentSummary),
          teachers: teachers.map((teacher): SchoolDemoTeacherSummary => ({
            assignmentCount: assignments.filter(
              (assignment) => assignment.schoolTeacherId === teacher.id,
            ).length,
            demoCode: teacher.demoCode,
          })),
        },
      },
    };
  }
}

function compareClassRecords(
  left: { code: string; gradeLevel: number },
  right: { code: string; gradeLevel: number },
): number {
  return left.gradeLevel - right.gradeLevel || left.code.localeCompare(right.code);
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function toAcademicYearSummary(academicYear: {
  code: string;
  endsOn: Date;
  startsOn: Date;
}): SchoolDemoAcademicYearSummary {
  return {
    code: academicYear.code,
    endsOn: academicYear.endsOn.toISOString().slice(0, 10),
    startsOn: academicYear.startsOn.toISOString().slice(0, 10),
  };
}

function toSubjectGroupSummary(subjectGroup: {
  code: string;
  subjectCode: string;
}): SchoolDemoSubjectGroupSummary {
  return {
    code: subjectGroup.code,
    subjectCode: "math",
  };
}

function toTeacherAssignmentSummary(assignment: {
  schoolClass: { code: string };
  schoolTeacher: { demoCode: string };
  subjectGroup: { code: string };
}): SchoolDemoTeacherAssignmentSummary {
  return {
    classCode: assignment.schoolClass.code,
    subjectGroupCode: assignment.subjectGroup.code,
    teacherDemoCode: assignment.schoolTeacher.demoCode,
  };
}

function toStudentEnrollmentSummary(enrollment: {
  schoolClass: { code: string };
  schoolStudent: { demoCode: string };
  withdrawnAt: Date | null;
}): SchoolDemoStudentEnrollmentSummary {
  return {
    classCode: enrollment.schoolClass.code,
    state: enrollment.withdrawnAt ? "WITHDRAWN" : "ENROLLED",
    studentDemoCode: enrollment.schoolStudent.demoCode,
  };
}

function toLicenseSummary(license: {
  entitlements: unknown[];
  licenseCode: string;
  status: string;
  validFrom: Date | null;
  validUntil: Date | null;
}): SchoolDemoLicenseSummary {
  return {
    entitlementCount: license.entitlements.length,
    licenseCode: license.licenseCode,
    status: "PLANNED",
    validFrom: license.validFrom?.toISOString().slice(0, 10) ?? null,
    validUntil: license.validUntil?.toISOString().slice(0, 10) ?? null,
  };
}

function toEntitlementSummary(entitlement: {
  capabilityCode: string;
}): SchoolDemoEntitlementSummary {
  return {
    capabilityCode: entitlement.capabilityCode,
  };
}
