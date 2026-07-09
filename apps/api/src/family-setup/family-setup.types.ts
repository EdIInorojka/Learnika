export interface CurrentFamilyResponse {
  data: {
    family: FamilySummary | null;
  };
}

export interface FamilySummary {
  createdAt: string;
  displayName: string | null;
  id: string;
}

export interface ChildProfileSummary {
  archivedAt: string | null;
  createdAt: string;
  gradeLevel: number | null;
  id: string;
  locale: string;
  nickname: string;
}

export interface ChildProfilesResponse {
  data: {
    children: ChildProfileSummary[];
  };
}

export interface ChildProfileResponse {
  data: {
    child: ChildProfileSummary;
  };
}

export interface ConsentSummary {
  childProfileId: string | null;
  documentVersion: string;
  familyId: string;
  grantedAt: string;
  id: string;
  policyVersion: string;
  purpose: string;
  revokedAt: string | null;
  subjectType: "CHILD" | "FAMILY";
}

export interface ConsentResponse {
  data: {
    consent: ConsentSummary;
  };
}

export interface ConsentStatusResponse {
  data: {
    consents: ConsentSummary[];
    familyConsentGranted: boolean;
  };
}

export interface LearningContextSummary {
  childProfileId: string;
  gradeLevel: number | null;
  id: string;
  selectedAt: string;
  subject: string;
  textbookCode: string;
}

export interface LearningContextResponse {
  data: {
    learningContext: LearningContextSummary;
  };
}

export interface SetupStatusResponse {
  data: {
    childProfileCount: number;
    family: FamilySummary | null;
    familyConsentGranted: boolean;
    hasLearningContext: boolean;
    setupComplete: boolean;
  };
}
