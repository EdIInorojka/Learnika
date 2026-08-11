export const SCHOOL_DEMO_SNAPSHOT_ROUTE = "/demo/school-snapshot";
export const SYNTHETIC_DEMO_ORGANIZATION_CODE = "synthetic-demo-organization-ru-ru";
export const SYNTHETIC_DEMO_SCHOOL_CODE = "synthetic-demo-school-ru-ru";
export const SCHOOL_DEMO_MARKER = "SYNTHETIC_NON_PRODUCTION";
export const SCHOOL_DEMO_LOCALE = "ru-RU";

export interface SchoolDemoBoundary {
  activation: "BLOCKED";
  familyLinkCount: 0;
  mutationAllowed: false;
  productionDataCount: 0;
  readiness: "NOT_READY";
  realSchoolCount: 0;
  workflow: "INACTIVE";
}

export interface SchoolDemoOrganizationSummary {
  code: string;
  schoolCount: number;
}

export interface SchoolDemoSchoolSummary {
  code: string;
}

export interface SchoolDemoAcademicYearSummary {
  code: string;
  endsOn: string;
  startsOn: string;
}

export interface SchoolDemoClassSummary {
  code: string;
  gradeLevel: number;
  studentCount: number;
  subjectGroupCodes: string[];
  teacherDemoCodes: string[];
}

export interface SchoolDemoSubjectGroupSummary {
  code: string;
  subjectCode: "math";
}

export interface SchoolDemoTeacherSummary {
  assignmentCount: number;
  demoCode: string;
}

export interface SchoolDemoStudentSummary {
  classCode: string;
  demoCode: string;
  enrollmentState: "ENROLLED" | "WITHDRAWN";
}

export interface SchoolDemoTeacherAssignmentSummary {
  classCode: string;
  subjectGroupCode: string;
  teacherDemoCode: string;
}

export interface SchoolDemoStudentEnrollmentSummary {
  classCode: string;
  state: "ENROLLED" | "WITHDRAWN";
  studentDemoCode: string;
}

export interface SchoolDemoAssignmentDraftSummary {
  assignmentCode: string;
  classCode: string;
  deliveryMode: "ONLINE_REHEARSAL" | "PRINT_REHEARSAL";
  packageCode: string;
  settings: {
    attemptLimit: number;
    availabilityDays: number;
    durationMinutes: number;
  };
  status: "DRAFT" | "REHEARSAL_READY" | "ARCHIVED";
  subjectGroupCode: string;
  targetCount: number;
  targetStudentDemoCodes: string[];
  teacherDemoCode: string;
}

export interface SchoolDemoLicenseSummary {
  entitlementCount: number;
  licenseCode: string;
  status: "PLANNED";
  validFrom: string | null;
  validUntil: string | null;
}

export interface SchoolDemoEntitlementSummary {
  capabilityCode: string;
}

export interface SchoolDemoSnapshot {
  academicYear: SchoolDemoAcademicYearSummary;
  assignmentDrafts: SchoolDemoAssignmentDraftSummary[];
  boundary: SchoolDemoBoundary;
  classes: SchoolDemoClassSummary[];
  entitlements: SchoolDemoEntitlementSummary[];
  license: SchoolDemoLicenseSummary;
  locale: typeof SCHOOL_DEMO_LOCALE;
  marker: typeof SCHOOL_DEMO_MARKER;
  organization: SchoolDemoOrganizationSummary;
  school: SchoolDemoSchoolSummary;
  studentEnrollments: SchoolDemoStudentEnrollmentSummary[];
  students: SchoolDemoStudentSummary[];
  subjectGroups: SchoolDemoSubjectGroupSummary[];
  teacherAssignments: SchoolDemoTeacherAssignmentSummary[];
  teachers: SchoolDemoTeacherSummary[];
}

export interface SchoolDemoSnapshotResponse {
  data: {
    snapshot: SchoolDemoSnapshot;
  };
}
