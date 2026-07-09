import { Injectable } from "@nestjs/common";
import type { AuditActorType, AuditOutcome } from "@prisma/client";

import { containsSensitiveText, isSensitiveFieldName } from "../logging/redaction";
import { PrismaService } from "../database/prisma.service";

const allowedAuditActionPattern = /^(auth|family_setup|authorization)\./;
const defaultPolicyVersion = "slice-9-safe-audit-v1";

export interface AuditRecordInput {
  action: string;
  actorType?: AuditActorType;
  actorUserId?: string | null;
  familyId?: string | null;
  outcome: AuditOutcome;
  policyVersion?: string | null;
  targetId?: string | null;
  targetType?: string | null;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: AuditRecordInput): Promise<void> {
    if (!allowedAuditActionPattern.test(input.action)) {
      return;
    }

    try {
      await this.prisma.auditLog.create({
        data: {
          action: input.action,
          actorType: input.actorType ?? "USER",
          actorUserId: safeIdentifier(input.actorUserId),
          familyId: safeIdentifier(input.familyId),
          outcome: input.outcome,
          policyVersion: safeShortText(input.policyVersion) ?? defaultPolicyVersion,
          targetId: safeIdentifier(input.targetId),
          targetType: safeShortText(input.targetType),
        },
      });
    } catch {
      // Audit storage must not leak details or break local foundation request handling.
    }
  }
}

function safeIdentifier(value: string | null | undefined): string | null {
  if (!value || containsSensitiveText(value)) {
    return null;
  }

  return value;
}

function safeShortText(value: string | null | undefined): string | null {
  if (!value || isSensitiveFieldName(value) || containsSensitiveText(value)) {
    return null;
  }

  return value;
}
