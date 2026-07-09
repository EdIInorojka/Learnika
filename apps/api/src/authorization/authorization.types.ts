import type { ChildProfile, Family, FamilyMember } from "@prisma/client";

import type { AuthenticatedUser } from "../auth/auth.types";

export type ParentFamilyRole = "OWNER" | "CAREGIVER";

export type ParentFamilyMembership = FamilyMember & {
  family: Family;
  role: ParentFamilyRole;
};

export interface AuthorizedParentContext {
  user: AuthenticatedUser;
}

export interface AuthorizedFamilyContext extends AuthorizedParentContext {
  family: Family;
  familyId: string;
  membership: ParentFamilyMembership;
}

export interface AuthorizedChildContext extends AuthorizedFamilyContext {
  child: ChildProfile;
}
