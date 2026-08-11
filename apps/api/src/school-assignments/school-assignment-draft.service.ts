import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { PrismaService } from "../database/prisma.service";
import type {
  CreateSyntheticSchoolAssignmentDraftInput,
  SyntheticSchoolAssignmentDraftSummary,
} from "./school-assignment-draft.types";

const safeCodePattern = /^[a-z0-9][a-z0-9-]{2,79}$/;
const syntheticSchoolCodePattern = /^synthetic-[a-z0-9][a-z0-9-]{2,79}$/;
const assignmentAttemptLimit = { maximum: 5, minimum: 1 };
const assignmentDurationMinutes = { maximum: 180, minimum: 5 };
const assignmentAvailabilityDays = { maximum: 60, minimum: 1 };

@Injectable()
export class SchoolAssignmentDraftService {
  constructor(private readonly prisma: PrismaService) {}

  async createSyntheticDraft(
    input: CreateSyntheticSchoolAssignmentDraftInput,
  ): Promise<SyntheticSchoolAssignmentDraftSummary> {
    validateDraftInput(input);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const school = await tx.school.findUnique({
          select: { code: true, id: true },
          where: { id: input.schoolId },
        });
        if (!school || !syntheticSchoolCodePattern.test(school.code)) {
          throw new NotFoundException({
            code: "SYNTHETIC_SCHOOL_NOT_FOUND",
            message: "Synthetic school assignment drafts require an approved synthetic school.",
          });
        }

        const academicYear = await tx.academicYear.findUnique({
          select: { id: true },
          where: { id_schoolId: { id: input.academicYearId, schoolId: input.schoolId } },
        });
        const schoolClass = await tx.schoolClass.findFirst({
          select: { id: true },
          where: {
            academicYearId: input.academicYearId,
            id: input.schoolClassId,
            schoolId: input.schoolId,
          },
        });
        const subjectGroup = await tx.schoolSubjectGroup.findUnique({
          select: { id: true },
          where: { id_schoolId: { id: input.subjectGroupId, schoolId: input.schoolId } },
        });
        const schoolTeacher = await tx.schoolTeacher.findUnique({
          select: { id: true },
          where: { id_schoolId: { id: input.schoolTeacherId, schoolId: input.schoolId } },
        });
        const teacherAssignment = await tx.teacherAssignment.findFirst({
          select: { id: true },
          where: {
            schoolClassId: input.schoolClassId,
            schoolId: input.schoolId,
            schoolTeacherId: input.schoolTeacherId,
            subjectGroupId: input.subjectGroupId,
          },
        });

        if (
          !academicYear ||
          !schoolClass ||
          !subjectGroup ||
          !schoolTeacher ||
          !teacherAssignment
        ) {
          throw new BadRequestException({
            code: "SCHOOL_ASSIGNMENT_SCOPE_MISMATCH",
            message: "Synthetic assignment draft references must belong to the same school.",
          });
        }

        const enrollments = await tx.studentEnrollment.findMany({
          orderBy: { schoolStudent: { demoCode: "asc" } },
          select: { schoolStudentId: true },
          where: {
            schoolClassId: input.schoolClassId,
            schoolId: input.schoolId,
            withdrawnAt: null,
          },
        });

        if (enrollments.length === 0) {
          throw new BadRequestException({
            code: "SCHOOL_ASSIGNMENT_EMPTY_TARGETS",
            message: "Synthetic assignment draft requires at least one enrolled synthetic student.",
          });
        }

        const assignment = await tx.schoolAssignment.create({
          data: {
            academicYear: {
              connect: { id_schoolId: { id: input.academicYearId, schoolId: input.schoolId } },
            },
            assignmentCode: input.assignmentCode,
            attemptLimit: input.attemptLimit,
            availabilityDays: input.availabilityDays,
            deliveryMode: input.deliveryMode,
            durationMinutes: input.durationMinutes,
            packageCode: input.packageCode,
            school: { connect: { id: input.schoolId } },
            schoolClass: {
              connect: { id_schoolId: { id: input.schoolClassId, schoolId: input.schoolId } },
            },
            schoolTeacher: {
              connect: { id_schoolId: { id: input.schoolTeacherId, schoolId: input.schoolId } },
            },
            status: "DRAFT",
            subjectGroup: {
              connect: { id_schoolId: { id: input.subjectGroupId, schoolId: input.schoolId } },
            },
            targets: {
              create: enrollments.map((enrollment) => ({
                school: { connect: { id: input.schoolId } },
                schoolStudent: {
                  connect: {
                    id_schoolId: {
                      id: enrollment.schoolStudentId,
                      schoolId: input.schoolId,
                    },
                  },
                },
                state: "INCLUDED",
              })),
            },
          },
          include: { targets: { select: { id: true } } },
        });

        return toDraftSummary(assignment);
      });
    } catch (error) {
      if (isUniqueConstraintFailure(error)) {
        throw new ConflictException({
          code: "SCHOOL_ASSIGNMENT_DRAFT_EXISTS",
          message: "Synthetic assignment draft code already exists for this school.",
        });
      }
      throw error;
    }
  }
}

function validateDraftInput(input: CreateSyntheticSchoolAssignmentDraftInput): void {
  for (const [fieldName, value] of [
    ["assignmentCode", input.assignmentCode],
    ["packageCode", input.packageCode],
  ] as const) {
    if (!safeCodePattern.test(value)) {
      throw new BadRequestException({
        code: "SCHOOL_ASSIGNMENT_UNSAFE_CODE",
        message: `${fieldName} must be a bounded synthetic code.`,
      });
    }
  }

  assertIntegerRange("attemptLimit", input.attemptLimit, assignmentAttemptLimit);
  assertIntegerRange("durationMinutes", input.durationMinutes, assignmentDurationMinutes);
  assertIntegerRange("availabilityDays", input.availabilityDays, assignmentAvailabilityDays);
}

function assertIntegerRange(
  fieldName: string,
  value: number,
  range: { maximum: number; minimum: number },
): void {
  if (!Number.isInteger(value) || value < range.minimum || value > range.maximum) {
    throw new BadRequestException({
      code: "SCHOOL_ASSIGNMENT_SETTING_OUT_OF_RANGE",
      message: `${fieldName} must stay inside the synthetic assignment draft range.`,
    });
  }
}

function toDraftSummary(assignment: {
  assignmentCode: string;
  attemptLimit: number;
  availabilityDays: number;
  deliveryMode: "ONLINE_REHEARSAL" | "PRINT_REHEARSAL";
  durationMinutes: number;
  packageCode: string;
  schoolId: string;
  status: "DRAFT" | "REHEARSAL_READY" | "ARCHIVED";
  targets: Array<{ id: string }>;
}): SyntheticSchoolAssignmentDraftSummary {
  return {
    assignmentCode: assignment.assignmentCode,
    boundary: {
      activation: "BLOCKED",
      familyLinkCount: 0,
      productionDataCount: 0,
      readiness: "NOT_READY",
      realSchoolCount: 0,
    },
    deliveryMode: assignment.deliveryMode,
    packageCode: assignment.packageCode,
    schoolId: assignment.schoolId,
    settings: {
      attemptLimit: assignment.attemptLimit,
      availabilityDays: assignment.availabilityDays,
      durationMinutes: assignment.durationMinutes,
    },
    status: assignment.status,
    targetCount: assignment.targets.length,
    writeScope: "SYNTHETIC_SCHOOL_ONLY",
  };
}

function isUniqueConstraintFailure(error: unknown): boolean {
  const maybePrismaError = error as Prisma.PrismaClientKnownRequestError;
  return maybePrismaError?.code === "P2002";
}
