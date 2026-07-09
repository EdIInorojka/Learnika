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
