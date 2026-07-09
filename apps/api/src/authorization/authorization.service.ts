import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { FamilyMember, FamilyMemberRole } from "@prisma/client";

import { AuthService } from "../auth/auth.service";
import { parseBearerToken } from "../auth/auth.validation";
import { PrismaService } from "../database/prisma.service";
import type {
  AuthorizedChildContext,
  AuthorizedFamilyContext,
  AuthorizedParentContext,
  ParentFamilyMembership,
} from "./authorization.types";

const allowedParentFamilyRoles: FamilyMemberRole[] = ["OWNER", "CAREGIVER"];
const policyVersion = "slice-7-family-tenant-v1";

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  async authorizeParent(authorization: string | undefined): Promise<AuthorizedParentContext> {
    return {
      user: await this.authService.authenticateParent(parseBearerToken(authorization)),
    };
  }

  async findParentFamily(
    context: AuthorizedParentContext,
  ): Promise<AuthorizedFamilyContext | null> {
    const membership = await this.prisma.familyMember.findFirst({
      include: { family: true },
      where: {
        role: { in: allowedParentFamilyRoles },
        userId: context.user.id,
      },
    });

    if (!membership) {
      return null;
    }

    return this.toFamilyContext(context, membership as ParentFamilyMembership);
  }

  async requireParentFamily(
    context: AuthorizedParentContext,
    action = "authorization.family.require",
  ): Promise<AuthorizedFamilyContext> {
    const membership = await this.findParentFamily(context);

    if (membership) {
      return membership;
    }

    const anyMembership = await this.findAnyFamilyMembership(context.user.id);

    if (anyMembership) {
      await this.recordDeniedAccess({
        action,
        familyId: anyMembership.familyId,
        targetId: anyMembership.familyId,
        targetType: "Family",
        userId: context.user.id,
      });
      throw this.forbidden();
    }

    throw new NotFoundException({
      code: "AUTHZ_FAMILY_NOT_FOUND",
      message: "Family setup was not found.",
    });
  }

  async assertNoFamilyMembershipForCreation(
    context: AuthorizedParentContext,
    action = "authorization.family.create",
  ): Promise<void> {
    const anyMembership = await this.findAnyFamilyMembership(context.user.id);

    if (!anyMembership) {
      return;
    }

    await this.recordDeniedAccess({
      action,
      familyId: anyMembership.familyId,
      targetId: anyMembership.familyId,
      targetType: "Family",
      userId: context.user.id,
    });
    throw this.forbidden();
  }

  async requireFamilyAccess(
    context: AuthorizedParentContext,
    familyId: string,
    action = "authorization.family.access",
  ): Promise<AuthorizedFamilyContext> {
    const membership = await this.prisma.familyMember.findFirst({
      include: { family: true },
      where: {
        familyId,
        role: { in: allowedParentFamilyRoles },
        userId: context.user.id,
      },
    });

    if (!membership) {
      await this.recordDeniedAccess({
        action,
        targetId: familyId,
        targetType: "Family",
        userId: context.user.id,
      });
      throw this.resourceNotFound();
    }

    return this.toFamilyContext(context, membership as ParentFamilyMembership);
  }

  async requireChildAccess(
    context: AuthorizedParentContext,
    childProfileId: string,
    action = "authorization.child.access",
  ): Promise<AuthorizedChildContext> {
    const familyContext = await this.requireParentFamily(context, action);
    const child = await this.prisma.childProfile.findFirst({
      where: {
        familyId: familyContext.familyId,
        id: childProfileId,
      },
    });

    if (!child) {
      await this.recordDeniedAccess({
        action,
        familyId: familyContext.familyId,
        targetId: childProfileId,
        targetType: "ChildProfile",
        userId: context.user.id,
      });
      throw this.resourceNotFound();
    }

    return {
      ...familyContext,
      child,
    };
  }

  async recordDeniedAccess(input: {
    action: string;
    familyId?: string;
    targetId?: string;
    targetType?: string;
    userId: string;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: input.action,
          actorType: "USER",
          actorUserId: input.userId,
          familyId: input.familyId ?? null,
          outcome: "DENIED",
          policyVersion,
          targetId: input.targetId ?? null,
          targetType: input.targetType ?? null,
        },
      });
    } catch {
      // Authorization decisions must not expose audit-storage failures to callers.
    }
  }

  private async findAnyFamilyMembership(userId: string): Promise<FamilyMember | null> {
    return this.prisma.familyMember.findFirst({
      where: { userId },
    });
  }

  private forbidden(): ForbiddenException {
    return new ForbiddenException({
      code: "AUTHZ_FORBIDDEN",
      message: "Access is not allowed.",
    });
  }

  private resourceNotFound(): NotFoundException {
    return new NotFoundException({
      code: "AUTHZ_RESOURCE_NOT_FOUND",
      message: "Resource was not found.",
    });
  }

  private toFamilyContext(
    context: AuthorizedParentContext,
    membership: ParentFamilyMembership,
  ): AuthorizedFamilyContext {
    return {
      family: membership.family,
      familyId: membership.familyId,
      membership,
      user: context.user,
    };
  }
}
