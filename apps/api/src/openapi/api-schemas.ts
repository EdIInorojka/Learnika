import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ApiErrorDto {
  @ApiProperty()
  declare code: string;

  @ApiProperty()
  declare message: string;
}

export class HealthResponseDto {
  @ApiProperty({ enum: ["api"] })
  declare service: "api";

  @ApiProperty({ enum: ["ok"] })
  declare status: "ok";
}

export class SchoolDemoBoundaryDto {
  @ApiProperty({ enum: ["BLOCKED"] })
  declare activation: "BLOCKED";

  @ApiProperty({ enum: [0] })
  declare familyLinkCount: 0;

  @ApiProperty({ enum: [false] })
  declare mutationAllowed: false;

  @ApiProperty({ enum: [0] })
  declare productionDataCount: 0;

  @ApiProperty({ enum: ["NOT_READY"] })
  declare readiness: "NOT_READY";

  @ApiProperty({ enum: [0] })
  declare realSchoolCount: 0;

  @ApiProperty({ enum: ["INACTIVE"] })
  declare workflow: "INACTIVE";
}

export class SchoolDemoOrganizationDto {
  @ApiProperty({ enum: ["synthetic-demo-organization-ru-ru"] })
  declare code: "synthetic-demo-organization-ru-ru";

  @ApiProperty({ minimum: 0 })
  declare schoolCount: number;
}

export class SchoolDemoSchoolDto {
  @ApiProperty({ enum: ["synthetic-demo-school-ru-ru"] })
  declare code: "synthetic-demo-school-ru-ru";
}

export class SchoolDemoAcademicYearDto {
  @ApiProperty({ maxLength: 20 })
  declare code: string;

  @ApiProperty({ format: "date" })
  declare endsOn: string;

  @ApiProperty({ format: "date" })
  declare startsOn: string;
}

export class SchoolDemoClassDto {
  @ApiProperty({ maxLength: 40 })
  declare code: string;

  @ApiProperty({ maximum: 9, minimum: 7 })
  declare gradeLevel: number;

  @ApiProperty({ minimum: 0 })
  declare studentCount: number;

  @ApiProperty({ type: () => [String] })
  declare subjectGroupCodes: string[];

  @ApiProperty({ type: () => [String] })
  declare teacherDemoCodes: string[];
}

export class SchoolDemoSubjectGroupDto {
  @ApiProperty({ maxLength: 40 })
  declare code: string;

  @ApiProperty({ enum: ["math"] })
  declare subjectCode: "math";
}

export class SchoolDemoTeacherDto {
  @ApiProperty({ minimum: 0 })
  declare assignmentCount: number;

  @ApiProperty({ maxLength: 40 })
  declare demoCode: string;
}

export class SchoolDemoStudentDto {
  @ApiProperty({ maxLength: 40 })
  declare classCode: string;

  @ApiProperty({ maxLength: 40 })
  declare demoCode: string;

  @ApiProperty({ enum: ["ENROLLED", "WITHDRAWN"] })
  declare enrollmentState: "ENROLLED" | "WITHDRAWN";
}

export class SchoolDemoTeacherAssignmentDto {
  @ApiProperty({ maxLength: 40 })
  declare classCode: string;

  @ApiProperty({ maxLength: 40 })
  declare subjectGroupCode: string;

  @ApiProperty({ maxLength: 40 })
  declare teacherDemoCode: string;
}

export class SchoolDemoStudentEnrollmentDto {
  @ApiProperty({ maxLength: 40 })
  declare classCode: string;

  @ApiProperty({ enum: ["ENROLLED", "WITHDRAWN"] })
  declare state: "ENROLLED" | "WITHDRAWN";

  @ApiProperty({ maxLength: 40 })
  declare studentDemoCode: string;
}

export class SchoolDemoLicenseDto {
  @ApiProperty({ minimum: 0 })
  declare entitlementCount: number;

  @ApiProperty({ maxLength: 80 })
  declare licenseCode: string;

  @ApiProperty({ enum: ["PLANNED"] })
  declare status: "PLANNED";

  @ApiProperty({ format: "date", nullable: true, type: String })
  declare validFrom: string | null;

  @ApiProperty({ format: "date", nullable: true, type: String })
  declare validUntil: string | null;
}

export class SchoolDemoEntitlementDto {
  @ApiProperty({ maxLength: 80 })
  declare capabilityCode: string;
}

export class SchoolDemoAssignmentDraftSettingsDto {
  @ApiProperty({ minimum: 1 })
  declare attemptLimit: number;

  @ApiProperty({ minimum: 1 })
  declare availabilityDays: number;

  @ApiProperty({ minimum: 1 })
  declare durationMinutes: number;
}

export class SchoolDemoAssignmentDraftDto {
  @ApiProperty({ maxLength: 80 })
  declare assignmentCode: string;

  @ApiProperty({ maxLength: 40 })
  declare classCode: string;

  @ApiProperty({ enum: ["ONLINE_REHEARSAL", "PRINT_REHEARSAL"] })
  declare deliveryMode: "ONLINE_REHEARSAL" | "PRINT_REHEARSAL";

  @ApiProperty({ maxLength: 80 })
  declare packageCode: string;

  @ApiProperty({ type: () => SchoolDemoAssignmentDraftSettingsDto })
  declare settings: SchoolDemoAssignmentDraftSettingsDto;

  @ApiProperty({ enum: ["ARCHIVED", "DRAFT", "REHEARSAL_READY"] })
  declare status: "ARCHIVED" | "DRAFT" | "REHEARSAL_READY";

  @ApiProperty({ maxLength: 40 })
  declare subjectGroupCode: string;

  @ApiProperty({ minimum: 0 })
  declare targetCount: number;

  @ApiProperty({ type: () => [String] })
  declare targetStudentDemoCodes: string[];

  @ApiProperty({ maxLength: 40 })
  declare teacherDemoCode: string;
}

export class SchoolDemoSnapshotDto {
  @ApiProperty({ type: () => SchoolDemoAcademicYearDto })
  declare academicYear: SchoolDemoAcademicYearDto;

  @ApiProperty({ type: () => [SchoolDemoAssignmentDraftDto] })
  declare assignmentDrafts: SchoolDemoAssignmentDraftDto[];

  @ApiProperty({ type: () => SchoolDemoBoundaryDto })
  declare boundary: SchoolDemoBoundaryDto;

  @ApiProperty({ type: () => [SchoolDemoClassDto] })
  declare classes: SchoolDemoClassDto[];

  @ApiProperty({ type: () => [SchoolDemoEntitlementDto] })
  declare entitlements: SchoolDemoEntitlementDto[];

  @ApiProperty({ type: () => SchoolDemoLicenseDto })
  declare license: SchoolDemoLicenseDto;

  @ApiProperty({ enum: ["ru-RU"] })
  declare locale: "ru-RU";

  @ApiProperty({ enum: ["SYNTHETIC_NON_PRODUCTION"] })
  declare marker: "SYNTHETIC_NON_PRODUCTION";

  @ApiProperty({ type: () => SchoolDemoOrganizationDto })
  declare organization: SchoolDemoOrganizationDto;

  @ApiProperty({ type: () => SchoolDemoSchoolDto })
  declare school: SchoolDemoSchoolDto;

  @ApiProperty({ type: () => [SchoolDemoStudentEnrollmentDto] })
  declare studentEnrollments: SchoolDemoStudentEnrollmentDto[];

  @ApiProperty({ type: () => [SchoolDemoStudentDto] })
  declare students: SchoolDemoStudentDto[];

  @ApiProperty({ type: () => [SchoolDemoSubjectGroupDto] })
  declare subjectGroups: SchoolDemoSubjectGroupDto[];

  @ApiProperty({ type: () => [SchoolDemoTeacherAssignmentDto] })
  declare teacherAssignments: SchoolDemoTeacherAssignmentDto[];

  @ApiProperty({ type: () => [SchoolDemoTeacherDto] })
  declare teachers: SchoolDemoTeacherDto[];
}

export class SchoolDemoSnapshotResponseDataDto {
  @ApiProperty({ type: () => SchoolDemoSnapshotDto })
  declare snapshot: SchoolDemoSnapshotDto;
}

export class SchoolDemoSnapshotResponseDto {
  @ApiProperty({ type: () => SchoolDemoSnapshotResponseDataDto })
  declare data: SchoolDemoSnapshotResponseDataDto;
}

export class CredentialsRequestDto {
  @ApiProperty({ format: "email", maxLength: 320 })
  declare email: string;

  @ApiProperty({ maxLength: 128, minLength: 12, writeOnly: true })
  declare password: string;

  @ApiPropertyOptional({ default: "ru", maxLength: 16 })
  declare locale?: string;
}

export class RefreshTokenRequestDto {
  @ApiProperty({ maxLength: 512, minLength: 32 })
  declare refreshToken: string;
}

export class AuthenticatedUserDto {
  @ApiProperty({ format: "uuid" })
  declare id: string;

  @ApiProperty({ format: "email" })
  declare email: string;

  @ApiProperty({ enum: ["PARENT"] })
  declare accountRole: "PARENT";

  @ApiProperty()
  declare locale: string;
}

export class TokenPairDto {
  @ApiProperty({ enum: ["Bearer"] })
  declare tokenType: "Bearer";

  @ApiProperty()
  declare accessToken: string;

  @ApiProperty({ format: "date-time" })
  declare accessTokenExpiresAt: string;

  @ApiProperty()
  declare refreshToken: string;

  @ApiProperty({ format: "date-time" })
  declare refreshTokenExpiresAt: string;
}

export class AuthResponseDataDto {
  @ApiProperty({ type: () => AuthenticatedUserDto })
  declare user: AuthenticatedUserDto;

  @ApiProperty({ type: () => TokenPairDto })
  declare tokens: TokenPairDto;
}

export class AuthResponseDto {
  @ApiProperty({ type: () => AuthResponseDataDto })
  declare data: AuthResponseDataDto;
}

export class MeResponseDataDto {
  @ApiProperty({ type: () => AuthenticatedUserDto })
  declare user: AuthenticatedUserDto;
}

export class MeResponseDto {
  @ApiProperty({ type: () => MeResponseDataDto })
  declare data: MeResponseDataDto;
}

export class LogoutResponseDataDto {
  @ApiProperty({ enum: [true] })
  declare ok: true;
}

export class LogoutResponseDto {
  @ApiProperty({ type: () => LogoutResponseDataDto })
  declare data: LogoutResponseDataDto;
}

export class FamilyRequestDto {
  @ApiPropertyOptional({ maxLength: 120 })
  declare displayName?: string;
}

export class FamilySummaryDto {
  @ApiProperty({ format: "uuid" })
  declare id: string;

  @ApiProperty({ maxLength: 120, nullable: true, type: String })
  declare displayName: string | null;

  @ApiProperty({ format: "date-time" })
  declare createdAt: string;
}

export class CurrentFamilyDataDto {
  @ApiProperty({ nullable: true, type: () => FamilySummaryDto })
  declare family: FamilySummaryDto | null;
}

export class CurrentFamilyResponseDto {
  @ApiProperty({ type: () => CurrentFamilyDataDto })
  declare data: CurrentFamilyDataDto;
}

export class ChildProfileRequestDto {
  @ApiProperty({ maximum: 9, minimum: 7 })
  declare gradeLevel: number;

  @ApiPropertyOptional({ default: "ru", maxLength: 16 })
  declare locale?: string;

  @ApiProperty({ maxLength: 120 })
  declare nickname: string;
}

export class ChildProfileSummaryDto {
  @ApiProperty({ format: "uuid" })
  declare id: string;

  @ApiProperty({ maxLength: 120 })
  declare nickname: string;

  @ApiProperty({ maximum: 9, minimum: 7, nullable: true, type: Number })
  declare gradeLevel: number | null;

  @ApiProperty()
  declare locale: string;

  @ApiProperty({ format: "date-time" })
  declare createdAt: string;

  @ApiProperty({ format: "date-time", nullable: true, type: String })
  declare archivedAt: string | null;
}

export class ChildProfileResponseDataDto {
  @ApiProperty({ type: () => ChildProfileSummaryDto })
  declare child: ChildProfileSummaryDto;
}

export class ChildProfileResponseDto {
  @ApiProperty({ type: () => ChildProfileResponseDataDto })
  declare data: ChildProfileResponseDataDto;
}

export class ChildProfilesResponseDataDto {
  @ApiProperty({ type: () => [ChildProfileSummaryDto] })
  declare children: ChildProfileSummaryDto[];
}

export class ChildProfilesResponseDto {
  @ApiProperty({ type: () => ChildProfilesResponseDataDto })
  declare data: ChildProfilesResponseDataDto;
}

export class ConsentRequestDto {
  @ApiPropertyOptional({ format: "uuid" })
  declare childProfileId?: string;

  @ApiProperty({ enum: ["FAMILY", "CHILD"] })
  declare subjectType: "FAMILY" | "CHILD";

  @ApiProperty({ maxLength: 80 })
  declare purpose: string;

  @ApiProperty({ maxLength: 80 })
  declare documentVersion: string;

  @ApiProperty({ maxLength: 80 })
  declare policyVersion: string;
}

export class ConsentSummaryDto {
  @ApiProperty({ format: "uuid" })
  declare id: string;

  @ApiProperty({ format: "uuid" })
  declare familyId: string;

  @ApiProperty({ format: "uuid", nullable: true, type: String })
  declare childProfileId: string | null;

  @ApiProperty({ enum: ["FAMILY", "CHILD"] })
  declare subjectType: "FAMILY" | "CHILD";

  @ApiProperty()
  declare purpose: string;

  @ApiProperty()
  declare documentVersion: string;

  @ApiProperty()
  declare policyVersion: string;

  @ApiProperty({ format: "date-time" })
  declare grantedAt: string;

  @ApiProperty({ format: "date-time", nullable: true, type: String })
  declare revokedAt: string | null;
}

export class ConsentResponseDataDto {
  @ApiProperty({ type: () => ConsentSummaryDto })
  declare consent: ConsentSummaryDto;
}

export class ConsentResponseDto {
  @ApiProperty({ type: () => ConsentResponseDataDto })
  declare data: ConsentResponseDataDto;
}

export class ConsentStatusResponseDataDto {
  @ApiProperty()
  declare familyConsentGranted: boolean;

  @ApiProperty({ type: () => [ConsentSummaryDto] })
  declare consents: ConsentSummaryDto[];
}

export class ConsentStatusResponseDto {
  @ApiProperty({ type: () => ConsentStatusResponseDataDto })
  declare data: ConsentStatusResponseDataDto;
}

export class LearningContextRequestDto {
  @ApiProperty({ maximum: 9, minimum: 7 })
  declare gradeLevel: number;

  @ApiProperty({ enum: ["math"] })
  declare subject: "math";

  @ApiProperty({ maxLength: 120, pattern: "^[a-zA-Z0-9._:-]+$" })
  declare textbookCode: string;
}

export class LearningContextSummaryDto {
  @ApiProperty({ format: "uuid" })
  declare id: string;

  @ApiProperty({ format: "uuid" })
  declare childProfileId: string;

  @ApiProperty({ maximum: 9, minimum: 7, nullable: true, type: Number })
  declare gradeLevel: number | null;

  @ApiProperty({ enum: ["math"] })
  declare subject: "math";

  @ApiProperty()
  declare textbookCode: string;

  @ApiProperty({ format: "date-time" })
  declare selectedAt: string;
}

export class LearningContextResponseDataDto {
  @ApiProperty({ type: () => LearningContextSummaryDto })
  declare learningContext: LearningContextSummaryDto;
}

export class LearningContextResponseDto {
  @ApiProperty({ type: () => LearningContextResponseDataDto })
  declare data: LearningContextResponseDataDto;
}

export class SetupStatusResponseDataDto {
  @ApiProperty({ nullable: true, type: () => FamilySummaryDto })
  declare family: FamilySummaryDto | null;

  @ApiProperty()
  declare childProfileCount: number;

  @ApiProperty()
  declare familyConsentGranted: boolean;

  @ApiProperty()
  declare hasLearningContext: boolean;

  @ApiProperty()
  declare setupComplete: boolean;
}

export class SetupStatusResponseDto {
  @ApiProperty({ type: () => SetupStatusResponseDataDto })
  declare data: SetupStatusResponseDataDto;
}

export class CreateHomeworkSessionRequestDto {
  @ApiProperty({ format: "uuid" })
  declare childProfileId: string;

  @ApiPropertyOptional({ maximum: 9, minimum: 7 })
  declare gradeLevel?: number;

  @ApiPropertyOptional({
    default: "UNKNOWN",
    enum: ["IMAGE", "MANUAL", "PDF", "SCREENSHOT", "UNKNOWN"],
  })
  declare sourceType?: "IMAGE" | "MANUAL" | "PDF" | "SCREENSHOT" | "UNKNOWN";

  @ApiPropertyOptional({ default: "math", enum: ["math"] })
  declare subject?: "math";
}

export class CreateHomeworkAttemptRequestDto {
  @ApiPropertyOptional({ default: "CREATED", enum: ["CREATED"] })
  declare status?: "CREATED";
}

export class HomeworkSessionSummaryDto {
  @ApiProperty({ format: "uuid" })
  declare id: string;

  @ApiProperty({ format: "uuid" })
  declare familyId: string;

  @ApiProperty({ format: "uuid" })
  declare childProfileId: string;

  @ApiProperty({ format: "uuid", nullable: true, type: String })
  declare createdByUserId: string | null;

  @ApiProperty({ enum: ["math"] })
  declare subject: "math";

  @ApiProperty({ maximum: 9, minimum: 7, nullable: true, type: Number })
  declare gradeLevel: number | null;

  @ApiProperty({ enum: ["IMAGE", "MANUAL", "PDF", "SCREENSHOT", "UNKNOWN"] })
  declare sourceType: "IMAGE" | "MANUAL" | "PDF" | "SCREENSHOT" | "UNKNOWN";

  @ApiProperty({ enum: ["CANCELLED", "CLOSED", "CREATED", "PAUSED", "WAITING_FOR_ATTEMPT"] })
  declare status: "CANCELLED" | "CLOSED" | "CREATED" | "PAUSED" | "WAITING_FOR_ATTEMPT";

  @ApiProperty({ format: "date-time", nullable: true, type: String })
  declare archivedAt: string | null;

  @ApiProperty({ format: "date-time" })
  declare createdAt: string;

  @ApiProperty({ format: "date-time" })
  declare updatedAt: string;
}

export class HomeworkSessionResponseDataDto {
  @ApiProperty({ type: () => HomeworkSessionSummaryDto })
  declare session: HomeworkSessionSummaryDto;
}

export class HomeworkSessionResponseDto {
  @ApiProperty({ type: () => HomeworkSessionResponseDataDto })
  declare data: HomeworkSessionResponseDataDto;
}

export class HomeworkSessionsResponseDataDto {
  @ApiProperty({ type: () => [HomeworkSessionSummaryDto] })
  declare sessions: HomeworkSessionSummaryDto[];
}

export class HomeworkSessionsResponseDto {
  @ApiProperty({ type: () => HomeworkSessionsResponseDataDto })
  declare data: HomeworkSessionsResponseDataDto;
}

export class HomeworkAttemptSummaryDto {
  @ApiProperty({ format: "uuid" })
  declare id: string;

  @ApiProperty({ format: "uuid" })
  declare familyId: string;

  @ApiProperty({ format: "uuid" })
  declare homeworkSessionId: string;

  @ApiProperty({ format: "uuid" })
  declare childProfileId: string;

  @ApiProperty({ format: "uuid", nullable: true, type: String })
  declare createdByUserId: string | null;

  @ApiProperty({ minimum: 1 })
  declare attemptNumber: number;

  @ApiProperty({ enum: ["CANCELLED", "CREATED", "SUBMITTED"] })
  declare status: "CANCELLED" | "CREATED" | "SUBMITTED";

  @ApiProperty({ format: "date-time" })
  declare createdAt: string;

  @ApiProperty({ format: "date-time" })
  declare updatedAt: string;
}

export class HomeworkAttemptResponseDataDto {
  @ApiProperty({ type: () => HomeworkAttemptSummaryDto })
  declare attempt: HomeworkAttemptSummaryDto;
}

export class HomeworkAttemptResponseDto {
  @ApiProperty({ type: () => HomeworkAttemptResponseDataDto })
  declare data: HomeworkAttemptResponseDataDto;
}

export class HomeworkAttemptsResponseDataDto {
  @ApiProperty({ type: () => [HomeworkAttemptSummaryDto] })
  declare attempts: HomeworkAttemptSummaryDto[];
}

export class HomeworkAttemptsResponseDto {
  @ApiProperty({ type: () => HomeworkAttemptsResponseDataDto })
  declare data: HomeworkAttemptsResponseDataDto;
}

export class CreateMediaAssetRequestDto {
  @ApiProperty({ enum: ["HOMEWORK_IMAGE", "HOMEWORK_PDF", "HOMEWORK_SCREENSHOT"] })
  declare assetKind: "HOMEWORK_IMAGE" | "HOMEWORK_PDF" | "HOMEWORK_SCREENSHOT";

  @ApiProperty({
    enum: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
    maxLength: 120,
  })
  declare mimeType: string;

  @ApiProperty({ maximum: 10485760, minimum: 0 })
  declare sizeBytes: number;

  @ApiPropertyOptional({ maxLength: 64, minLength: 64, pattern: "^[0-9a-fA-F]{64}$" })
  declare checksumSha256?: string;
}

export class UpdateMediaAssetRetentionRequestDto {
  @ApiProperty({ enum: ["DELETION_REQUESTED"] })
  declare retentionStatus: "DELETION_REQUESTED";
}

export class MediaAssetUploadRequestDto {
  @ApiProperty({
    description: "One local-development homework file.",
    format: "binary",
    type: "string",
  })
  declare file: string;
}

export class MediaAssetSummaryDto {
  @ApiProperty({ format: "uuid" })
  declare id: string;

  @ApiProperty({ format: "uuid" })
  declare familyId: string;

  @ApiProperty({ format: "uuid", nullable: true, type: String })
  declare childProfileId: string | null;

  @ApiProperty({ format: "uuid", nullable: true, type: String })
  declare homeworkSessionId: string | null;

  @ApiProperty({ format: "uuid", nullable: true, type: String })
  declare createdByUserId: string | null;

  @ApiProperty({ enum: ["HOMEWORK_IMAGE", "HOMEWORK_PDF", "HOMEWORK_SCREENSHOT"] })
  declare assetKind: "HOMEWORK_IMAGE" | "HOMEWORK_PDF" | "HOMEWORK_SCREENSHOT";

  @ApiProperty({ maxLength: 120 })
  declare mimeType: string;

  @ApiProperty({ minimum: 0 })
  declare sizeBytes: number;

  @ApiProperty({ maxLength: 64, nullable: true, type: String })
  declare checksumSha256: string | null;

  @ApiProperty({ maxLength: 512, nullable: true, type: String })
  declare storageKey: string | null;

  @ApiProperty({
    enum: ["DELETED", "DELETION_REQUESTED", "RETENTION_EXPIRED", "TEMPORARY"],
  })
  declare retentionStatus: "DELETED" | "DELETION_REQUESTED" | "RETENTION_EXPIRED" | "TEMPORARY";

  @ApiProperty({ format: "date-time" })
  declare retentionUntil: string;

  @ApiProperty({ format: "date-time", nullable: true, type: String })
  declare deletionRequestedAt: string | null;

  @ApiProperty({ format: "date-time", nullable: true, type: String })
  declare deletedAt: string | null;

  @ApiProperty({ format: "date-time" })
  declare createdAt: string;

  @ApiProperty({ format: "date-time" })
  declare updatedAt: string;
}

export class MediaAssetResponseDataDto {
  @ApiProperty({ type: () => MediaAssetSummaryDto })
  declare mediaAsset: MediaAssetSummaryDto;
}

export class MediaAssetResponseDto {
  @ApiProperty({ type: () => MediaAssetResponseDataDto })
  declare data: MediaAssetResponseDataDto;
}

export class MediaAssetsResponseDataDto {
  @ApiProperty({ type: () => [MediaAssetSummaryDto] })
  declare mediaAssets: MediaAssetSummaryDto[];
}

export class MediaAssetsResponseDto {
  @ApiProperty({ type: () => MediaAssetsResponseDataDto })
  declare data: MediaAssetsResponseDataDto;
}

export class MockOcrCandidateRequestDto {
  @ApiPropertyOptional({
    default: "clear-linear-equation",
    enum: ["clear-linear-equation", "low-confidence-equation", "provider-failure"],
  })
  declare mockFixtureId?: "clear-linear-equation" | "low-confidence-equation" | "provider-failure";
}

export class MockOcrCandidateTextDto {
  @ApiProperty({ maxLength: 120 })
  declare candidateId: string;

  @ApiProperty({ enum: ["HIGH", "LOW", "MEDIUM", "UNKNOWN"] })
  declare confidence: "HIGH" | "LOW" | "MEDIUM" | "UNKNOWN";

  @ApiProperty({ enum: ["MOCK_FIXTURE"] })
  declare source: "MOCK_FIXTURE";

  @ApiProperty({ maxLength: 4096 })
  declare text: string;

  @ApiProperty({ enum: ["UNTRUSTED_OCR_CANDIDATE"] })
  declare trust: "UNTRUSTED_OCR_CANDIDATE";
}

export class MockOcrCandidateSummaryDto {
  @ApiProperty({ maxLength: 120 })
  declare boundaryPolicyVersion: string;

  @ApiPropertyOptional({ type: () => [MockOcrCandidateTextDto] })
  declare candidates?: MockOcrCandidateTextDto[];

  @ApiProperty({ enum: ["HIGH", "LOW", "MEDIUM", "UNKNOWN"] })
  declare confidence: "HIGH" | "LOW" | "MEDIUM" | "UNKNOWN";

  @ApiProperty({ enum: [false] })
  declare downstreamUseAllowed: false;

  @ApiProperty({ enum: [true] })
  declare learnerConfirmationRequired: true;

  @ApiProperty({ format: "uuid" })
  declare mediaAssetId: string;

  @ApiProperty({ enum: [true] })
  declare metadataOnly: true;

  @ApiProperty({ maxLength: 120 })
  declare modelVersion: string;

  @ApiProperty({ enum: ["UNKNOWN_NOT_VERIFIED"] })
  declare objectExistence: "UNKNOWN_NOT_VERIFIED";

  @ApiProperty({ maxLength: 120 })
  declare orchestrationPolicyVersion: string;

  @ApiPropertyOptional({ enum: ["BOUNDARY_REJECTED", "LOW_CONFIDENCE", "PROVIDER_FAILURE"] })
  declare reason?: "BOUNDARY_REJECTED" | "LOW_CONFIDENCE" | "PROVIDER_FAILURE";

  @ApiProperty({ maxLength: 120 })
  declare schemaVersion: string;

  @ApiProperty({
    enum: ["CANDIDATE_REQUIRES_CONFIRMATION", "FAILED", "NEEDS_REVIEW"],
  })
  declare status: "CANDIDATE_REQUIRES_CONFIRMATION" | "FAILED" | "NEEDS_REVIEW";
}

export class MockOcrCandidateResponseDataDto {
  @ApiProperty({ type: () => MockOcrCandidateSummaryDto })
  declare candidate: MockOcrCandidateSummaryDto;
}

export class MockOcrCandidateResponseDto {
  @ApiProperty({ type: () => MockOcrCandidateResponseDataDto })
  declare data: MockOcrCandidateResponseDataDto;
}
