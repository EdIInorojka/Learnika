export interface SchoolDemoBoundary {
  activation: "BLOCKED";
  familyLinkCount: 0;
  mutationAllowed: false;
  productionDataCount: 0;
  readiness: "NOT_READY";
  realSchoolCount: 0;
  workflow: "INACTIVE";
}

export interface SchoolDemoSnapshot {
  academicYear: {
    code: string;
    endsOn: string;
    startsOn: string;
  };
  assignmentDrafts: Array<{
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
  }>;
  boundary: SchoolDemoBoundary;
  classes: Array<{
    code: string;
    gradeLevel: number;
    studentCount: number;
    subjectGroupCodes: string[];
    teacherDemoCodes: string[];
  }>;
  entitlements: Array<{
    capabilityCode: string;
  }>;
  license: {
    entitlementCount: number;
    licenseCode: string;
    status: "PLANNED";
    validFrom: string | null;
    validUntil: string | null;
  };
  locale: "ru-RU";
  marker: "SYNTHETIC_NON_PRODUCTION";
  organization: {
    code: string;
    schoolCount: number;
  };
  school: {
    code: string;
  };
  studentEnrollments: Array<{
    classCode: string;
    state: "ENROLLED" | "WITHDRAWN";
    studentDemoCode: string;
  }>;
  students: Array<{
    classCode: string;
    demoCode: string;
    enrollmentState: "ENROLLED" | "WITHDRAWN";
  }>;
  subjectGroups: Array<{
    code: string;
    subjectCode: "math";
  }>;
  teacherAssignments: Array<{
    classCode: string;
    subjectGroupCode: string;
    teacherDemoCode: string;
  }>;
  teachers: Array<{
    assignmentCount: number;
    demoCode: string;
  }>;
}

export interface SchoolDemoSnapshotResponse {
  data: {
    snapshot: SchoolDemoSnapshot;
  };
}

function rejectUnsafeValue(value: string): void {
  if (/(?:https?|s3|minio|file):\/\//i.test(value)) {
    throw new Error("School demo snapshot contains a URL.");
  }
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(value)) {
    throw new Error("School demo snapshot contains contact data.");
  }
  if (
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{3,4}-[0-9a-f]{3,4}-[0-9a-f]{12}\b/i.test(value) ||
    /\b[0-9a-f]{32,}\b/i.test(value)
  ) {
    throw new Error("School demo snapshot contains an identity or hash value.");
  }
}

function scanForUnsafeData(value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      scanForUnsafeData(item);
    }
    return;
  }
  if (!value || typeof value !== "object") {
    if (typeof value === "string") rejectUnsafeValue(value);
    return;
  }
  for (const [key, nested] of Object.entries(value)) {
    if (
      /(?:\b|_)(?:id|email|phone|address|userId|familyId|childProfileId|token|secret|storageKey)\b/i.test(
        key,
      )
    ) {
      throw new Error(`School demo snapshot contains unsafe field ${key}.`);
    }
    scanForUnsafeData(nested);
  }
}

export function parseSchoolDemoSnapshotResponse(response: unknown): SchoolDemoSnapshot {
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    throw new Error("School demo snapshot response is unavailable.");
  }
  const typedResponse = response as Partial<SchoolDemoSnapshotResponse>;
  const snapshot = typedResponse.data?.snapshot;
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    throw new Error("School demo snapshot response is unavailable.");
  }
  scanForUnsafeData(snapshot);
  return snapshot as SchoolDemoSnapshot;
}
