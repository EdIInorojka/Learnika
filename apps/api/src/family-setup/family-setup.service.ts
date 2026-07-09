import { ConflictException, Injectable } from "@nestjs/common";
import type { ChildProfile, ConsentRecord, Family, TextbookSelection } from "@prisma/client";

import { AuthorizationService } from "../authorization/authorization.service";
import type { AuthorizedParentContext } from "../authorization/authorization.types";
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

@Injectable()
export class FamilySetupService {
  constructor(
    private readonly authorization: AuthorizationService,
    private readonly prisma: PrismaService,
  ) {}

  async getCurrentFamily(context: AuthorizedParentContext): Promise<CurrentFamilyResponse> {
    const membership = await this.authorization.findParentFamily(context);

    return {
      data: {
        family: membership ? this.toFamilySummary(membership.family) : null,
      },
    };
  }

  async createOrGetCurrentFamily(
    context: AuthorizedParentContext,
    input: FamilyInput,
  ): Promise<CurrentFamilyResponse> {
    const existing = await this.authorization.findParentFamily(context);

    if (existing) {
      return { data: { family: this.toFamilySummary(existing.family) } };
    }

    await this.authorization.assertNoFamilyMembershipForCreation(
      context,
      "family_setup.family.create",
    );
    const family = await this.prisma.family.create({
      data: {
        displayName: input.displayName ?? null,
        members: {
          create: {
            role: "OWNER",
            userId: context.user.id,
          },
        },
      },
    });
    await this.recordFamilyEvent(
      context.user.id,
      family.id,
      "family_setup.family.create",
      "Family",
      family.id,
    );

    return { data: { family: this.toFamilySummary(family) } };
  }

  async listChildProfiles(context: AuthorizedParentContext): Promise<ChildProfilesResponse> {
    const { familyId } = await this.authorization.requireParentFamily(
      context,
      "family_setup.children.list",
    );
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
    context: AuthorizedParentContext,
    input: ChildProfileInput,
  ): Promise<ChildProfileResponse> {
    const { familyId } = await this.authorization.requireParentFamily(
      context,
      "family_setup.child.create",
    );
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
      context.user.id,
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

  async createConsent(
    context: AuthorizedParentContext,
    input: ConsentInput,
  ): Promise<ConsentResponse> {
    const familyContext = input.childProfileId
      ? await this.authorization.requireChildAccess(
          context,
          input.childProfileId,
          "family_setup.consent.child.access",
        )
      : await this.authorization.requireParentFamily(context, "family_setup.consent.create");

    const consent = await this.prisma.consentRecord.create({
      data: {
        childProfileId: input.childProfileId ?? null,
        documentVersion: input.documentVersion,
        familyId: familyContext.familyId,
        grantedByUserId: context.user.id,
        policyVersion: input.policyVersion,
        purpose: input.purpose,
        subjectType: input.subjectType,
      },
    });
    await this.recordFamilyEvent(
      context.user.id,
      familyContext.familyId,
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

  async getConsentStatus(context: AuthorizedParentContext): Promise<ConsentStatusResponse> {
    const { familyId } = await this.authorization.requireParentFamily(
      context,
      "family_setup.consent_status.read",
    );
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
    context: AuthorizedParentContext,
    childProfileId: string,
    input: LearningContextInput,
  ): Promise<LearningContextResponse> {
    const { familyId } = await this.authorization.requireChildAccess(
      context,
      childProfileId,
      "family_setup.learning_context.child.access",
    );

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
      context.user.id,
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

  async getSetupStatus(context: AuthorizedParentContext): Promise<SetupStatusResponse> {
    const membership = await this.authorization.findParentFamily(context);

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
