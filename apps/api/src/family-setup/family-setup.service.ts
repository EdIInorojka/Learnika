import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  ChildProfile,
  ConsentRecord,
  Family,
  FamilyMember,
  TextbookSelection,
} from "@prisma/client";

import type { AuthenticatedUser } from "../auth/auth.types";
import { PrismaService } from "../database/prisma.service";
import type {
  ChildProfileInput,
  ConsentInput,
  FamilyInput,
  LearningContextInput,
} from "./family-setup.validation";
import type {
  ChildProfileResponse,
  ChildProfileSummary,
  ChildProfilesResponse,
  ConsentResponse,
  ConsentStatusResponse,
  ConsentSummary,
  CurrentFamilyResponse,
  FamilySummary,
  LearningContextResponse,
  LearningContextSummary,
  SetupStatusResponse,
} from "./family-setup.types";

type MembershipWithFamily = FamilyMember & { family: Family };

@Injectable()
export class FamilySetupService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentFamily(user: AuthenticatedUser): Promise<CurrentFamilyResponse> {
    const membership = await this.findParentMembership(user.id);

    return {
      data: {
        family: membership ? this.toFamilySummary(membership.family) : null,
      },
    };
  }

  async createOrGetCurrentFamily(
    user: AuthenticatedUser,
    input: FamilyInput,
  ): Promise<CurrentFamilyResponse> {
    const existing = await this.findParentMembership(user.id);

    if (existing) {
      return { data: { family: this.toFamilySummary(existing.family) } };
    }

    const family = await this.prisma.family.create({
      data: {
        displayName: input.displayName ?? null,
        members: {
          create: {
            role: "OWNER",
            userId: user.id,
          },
        },
      },
    });
    await this.recordFamilyEvent(
      user.id,
      family.id,
      "family_setup.family.create",
      "Family",
      family.id,
    );

    return { data: { family: this.toFamilySummary(family) } };
  }

  async listChildProfiles(user: AuthenticatedUser): Promise<ChildProfilesResponse> {
    const familyId = await this.requireFamilyId(user.id);
    const children = await this.prisma.childProfile.findMany({
      orderBy: { createdAt: "asc" },
      where: { familyId },
    });

    return {
      data: {
        children: children.map((child) => this.toChildSummary(child)),
      },
    };
  }

  async createChildProfile(
    user: AuthenticatedUser,
    input: ChildProfileInput,
  ): Promise<ChildProfileResponse> {
    const familyId = await this.requireFamilyId(user.id);
    const existingChildren = await this.prisma.childProfile.findMany({
      select: { nickname: true },
      where: { familyId, archivedAt: null },
    });
    const duplicateNickname = existingChildren.some(
      (child) => child.nickname?.toLocaleLowerCase("ru") === input.nickname.toLocaleLowerCase("ru"),
    );

    if (duplicateNickname) {
      throw new ConflictException({
        code: "FAMILY_SETUP_CHILD_DUPLICATE",
        message: "A child profile already exists for this family.",
      });
    }

    const child = await this.prisma.childProfile.create({
      data: {
        familyId,
        gradeLevel: input.gradeLevel,
        locale: input.locale,
        nickname: input.nickname,
      },
    });
    await this.recordFamilyEvent(
      user.id,
      familyId,
      "family_setup.child.create",
      "ChildProfile",
      child.id,
    );

    return {
      data: {
        child: this.toChildSummary(child),
      },
    };
  }

  async createConsent(user: AuthenticatedUser, input: ConsentInput): Promise<ConsentResponse> {
    const familyId = await this.requireFamilyId(user.id);

    if (input.childProfileId) {
      await this.requireChildInFamily(familyId, input.childProfileId);
    }

    const consent = await this.prisma.consentRecord.create({
      data: {
        childProfileId: input.childProfileId ?? null,
        documentVersion: input.documentVersion,
        familyId,
        grantedByUserId: user.id,
        policyVersion: input.policyVersion,
        purpose: input.purpose,
        subjectType: input.subjectType,
      },
    });
    await this.recordFamilyEvent(
      user.id,
      familyId,
      "family_setup.consent.create",
      "ConsentRecord",
      consent.id,
    );

    return {
      data: {
        consent: this.toConsentSummary(consent),
      },
    };
  }

  async getConsentStatus(user: AuthenticatedUser): Promise<ConsentStatusResponse> {
    const familyId = await this.requireFamilyId(user.id);
    const consents = await this.prisma.consentRecord.findMany({
      orderBy: { grantedAt: "desc" },
      where: { familyId, revokedAt: null },
    });
    const familyConsentGranted = consents.some((consent) => consent.subjectType === "FAMILY");

    return {
      data: {
        consents: consents.map((consent) => this.toConsentSummary(consent)),
        familyConsentGranted,
      },
    };
  }

  async upsertLearningContext(
    user: AuthenticatedUser,
    childProfileId: string,
    input: LearningContextInput,
  ): Promise<LearningContextResponse> {
    const familyId = await this.requireFamilyId(user.id);
    await this.requireChildInFamily(familyId, childProfileId);

    const existing = await this.prisma.textbookSelection.findFirst({
      orderBy: { selectedAt: "desc" },
      where: { childProfileId, familyId, subject: input.subject },
    });
    const learningContext = existing
      ? await this.prisma.textbookSelection.update({
          data: {
            gradeLevel: input.gradeLevel,
            selectedAt: new Date(),
            textbookCode: input.textbookCode,
          },
          where: { id: existing.id },
        })
      : await this.prisma.textbookSelection.create({
          data: {
            childProfileId,
            familyId,
            gradeLevel: input.gradeLevel,
            subject: input.subject,
            textbookCode: input.textbookCode,
          },
        });
    await this.recordFamilyEvent(
      user.id,
      familyId,
      "family_setup.learning_context.upsert",
      "TextbookSelection",
      learningContext.id,
    );

    return {
      data: {
        learningContext: this.toLearningContextSummary(learningContext),
      },
    };
  }

  async getSetupStatus(user: AuthenticatedUser): Promise<SetupStatusResponse> {
    const membership = await this.findParentMembership(user.id);

    if (!membership) {
      return {
        data: {
          childProfileCount: 0,
          family: null,
          familyConsentGranted: false,
          hasLearningContext: false,
          setupComplete: false,
        },
      };
    }

    const [childProfileCount, familyConsentCount, learningContextCount] = await Promise.all([
      this.prisma.childProfile.count({
        where: { familyId: membership.familyId, archivedAt: null },
      }),
      this.prisma.consentRecord.count({
        where: { familyId: membership.familyId, revokedAt: null, subjectType: "FAMILY" },
      }),
      this.prisma.textbookSelection.count({
        where: { familyId: membership.familyId },
      }),
    ]);
    const familyConsentGranted = familyConsentCount > 0;
    const hasLearningContext = learningContextCount > 0;

    return {
      data: {
        childProfileCount,
        family: this.toFamilySummary(membership.family),
        familyConsentGranted,
        hasLearningContext,
        setupComplete: childProfileCount > 0 && familyConsentGranted && hasLearningContext,
      },
    };
  }

  private async findParentMembership(userId: string): Promise<MembershipWithFamily | null> {
    return this.prisma.familyMember.findFirst({
      include: { family: true },
      where: {
        role: { in: ["OWNER", "CAREGIVER"] },
        userId,
      },
    });
  }

  private async requireFamilyId(userId: string): Promise<string> {
    const membership = await this.findParentMembership(userId);

    if (!membership) {
      throw new NotFoundException({
        code: "FAMILY_SETUP_NOT_FOUND",
        message: "Family setup has not been created.",
      });
    }

    return membership.familyId;
  }

  private async requireChildInFamily(familyId: string, childProfileId: string): Promise<void> {
    const child = await this.prisma.childProfile.findFirst({
      select: { id: true },
      where: { familyId, id: childProfileId },
    });

    if (!child) {
      throw new NotFoundException({
        code: "FAMILY_SETUP_CHILD_NOT_FOUND",
        message: "Child profile was not found.",
      });
    }
  }

  private async recordFamilyEvent(
    userId: string,
    familyId: string,
    action: string,
    targetType: string,
    targetId: string,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          actorType: "USER",
          actorUserId: userId,
          familyId,
          outcome: "SUCCESS",
          targetId,
          targetType,
        },
      });
    } catch {
      // Setup writes should not fail because local audit storage is unavailable.
    }
  }

  private toFamilySummary(family: Family): FamilySummary {
    return {
      createdAt: family.createdAt.toISOString(),
      displayName: family.displayName,
      id: family.id,
    };
  }

  private toChildSummary(child: ChildProfile): ChildProfileSummary {
    return {
      archivedAt: child.archivedAt?.toISOString() ?? null,
      createdAt: child.createdAt.toISOString(),
      gradeLevel: child.gradeLevel,
      id: child.id,
      locale: child.locale,
      nickname: child.nickname ?? "Learner",
    };
  }

  private toConsentSummary(consent: ConsentRecord): ConsentSummary {
    return {
      childProfileId: consent.childProfileId,
      documentVersion: consent.documentVersion,
      familyId: consent.familyId,
      grantedAt: consent.grantedAt.toISOString(),
      id: consent.id,
      policyVersion: consent.policyVersion,
      purpose: consent.purpose,
      revokedAt: consent.revokedAt?.toISOString() ?? null,
      subjectType: consent.subjectType,
    };
  }

  private toLearningContextSummary(selection: TextbookSelection): LearningContextSummary {
    return {
      childProfileId: selection.childProfileId,
      gradeLevel: selection.gradeLevel,
      id: selection.id,
      selectedAt: selection.selectedAt.toISOString(),
      subject: selection.subject,
      textbookCode: selection.textbookCode,
    };
  }
}
