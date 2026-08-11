export type SchoolAssignmentDraftDeliveryMode = "ONLINE_REHEARSAL" | "PRINT_REHEARSAL";

export interface CreateSyntheticSchoolAssignmentDraftInput {
  academicYearId: string;
  assignmentCode: string;
  availabilityDays: number;
  deliveryMode: SchoolAssignmentDraftDeliveryMode;
  durationMinutes: number;
  packageCode: string;
  schoolClassId: string;
  schoolId: string;
  schoolTeacherId: string;
  subjectGroupId: string;
  attemptLimit: number;
}

export interface SyntheticSchoolAssignmentDraftSummary {
  assignmentCode: string;
  boundary: {
    activation: "BLOCKED";
    familyLinkCount: 0;
    productionDataCount: 0;
    readiness: "NOT_READY";
    realSchoolCount: 0;
  };
  deliveryMode: SchoolAssignmentDraftDeliveryMode;
  packageCode: string;
  schoolId: string;
  settings: {
    attemptLimit: number;
    availabilityDays: number;
    durationMinutes: number;
  };
  status: "DRAFT" | "REHEARSAL_READY" | "ARCHIVED";
  targetCount: number;
  writeScope: "SYNTHETIC_SCHOOL_ONLY";
}
