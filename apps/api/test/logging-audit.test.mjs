import assert from "node:assert/strict";
import { test } from "node:test";

import { AuditService } from "../dist/audit/audit.service.js";
import { SafeLogger } from "../dist/logging/safe-logger.service.js";

test("SafeLogger redacts sensitive fields and values", () => {
  const lines = [];
  const originalLog = console.log;
  console.log = (line) => lines.push(String(line));

  try {
    const logger = new SafeLogger("debug");
    logger.log(
      {
        authorization: "Bearer raw-access-token",
        childNickname: "LearnerA-Synthetic",
        cookie: "session=raw-cookie",
        email: "parent@example.test",
        nested: {
          accessTokenHash: "raw-access-token-hash",
          passwordHash: "raw-password-hash",
          refreshToken: "raw-refresh-token",
        },
        requestId: "slice9-request-id",
        safe: "http.request",
        secret: "raw-secret",
      },
      "Slice9Test",
    );
    logger.warn("authorization Bearer raw-warning-token", "Slice9Test");
  } finally {
    console.log = originalLog;
  }

  const output = lines.join("\n");
  assert.equal(output.includes("raw-access-token"), false);
  assert.equal(output.includes("raw-access-token-hash"), false);
  assert.equal(output.includes("raw-password-hash"), false);
  assert.equal(output.includes("raw-refresh-token"), false);
  assert.equal(output.includes("raw-cookie"), false);
  assert.equal(output.includes("raw-secret"), false);
  assert.equal(output.includes("parent@example.test"), false);
  assert.equal(output.includes("LearnerA-Synthetic"), false);
  assert.equal(output.includes("passwordHash"), false);
  assert.equal(output.includes("accessTokenHash"), false);
  assert.equal(output.includes("authorization"), false);
  assert.equal(output.includes("cookie"), false);
  assert.equal(output.includes("slice9-request-id"), true);
});

test("AuditService records only safe Slice 9 audit fields", async () => {
  const writes = [];
  const prisma = {
    auditLog: {
      create: async (input) => {
        writes.push(input);
        return input.data;
      },
    },
  };
  const service = new AuditService(prisma);

  await service.record({
    action: "auth.login",
    actorUserId: "user-id",
    familyId: "family-id",
    outcome: "SUCCESS",
    targetId: "Bearer raw-target-token",
    targetType: "passwordHash",
  });
  await service.record({
    action: "homework.future",
    actorUserId: "user-id",
    outcome: "SUCCESS",
  });

  assert.equal(writes.length, 1);
  const serialized = JSON.stringify(writes[0]);
  assert.equal(serialized.includes("raw-target-token"), false);
  assert.equal(serialized.includes("passwordHash"), false);
  assert.equal(writes[0].data.action, "auth.login");
  assert.equal(writes[0].data.actorUserId, "user-id");
  assert.equal(writes[0].data.familyId, "family-id");
  assert.equal(writes[0].data.policyVersion, "slice-9-safe-audit-v1");
  assert.equal(writes[0].data.targetId, null);
  assert.equal(writes[0].data.targetType, null);
});
