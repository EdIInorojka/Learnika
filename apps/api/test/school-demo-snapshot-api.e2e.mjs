import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { after, before, test } from "node:test";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { SYNTHETIC_DEMO_SCHOOL_SEED, seedSyntheticDemoSchool } from "../prisma/seed.mjs";

const apiPort = 3900 + Math.floor(Math.random() * 400);
const baseUrl = `http://127.0.0.1:${apiPort}`;
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://learnika_local:learnika_local_password@127.0.0.1:5432/learnika_local";

process.env.DATABASE_URL = databaseUrl;

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
  }),
});
const serverOutput = [];
let server;

async function waitForApi() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(
        `API server exited early with code ${server.exitCode}\n${serverOutput.join("")}`,
      );
    }

    try {
      const response = await fetch(`${baseUrl}/health/live`);

      if (response.ok) {
        return;
      }
    } catch {
      await delay(250);
    }
  }

  throw new Error(`API server did not become healthy.\n${serverOutput.join("")}`);
}

async function request(urlPath, init = {}) {
  const response = await fetch(`${baseUrl}${urlPath}`, {
    ...init,
    headers: {
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();

  return {
    body: text ? JSON.parse(text) : undefined,
    status: response.status,
    text,
  };
}

before(async () => {
  await seedSyntheticDemoSchool(prisma);

  server = spawn(process.execPath, ["dist/main.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      API_PORT: String(apiPort),
      DATABASE_URL: databaseUrl,
      NODE_ENV: "test",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (chunk) => serverOutput.push(String(chunk)));
  server.stderr.on("data", (chunk) => serverOutput.push(String(chunk)));

  await waitForApi();
});

after(async () => {
  await prisma.$disconnect();
  if (server && server.exitCode === null) {
    server.kill();
  }
});

test("synthetic school demo snapshot is public read-only and boundary-safe", async () => {
  const response = await request("/demo/school-snapshot");
  assert.equal(response.status, 200);

  const snapshot = response.body.data.snapshot;
  assert.equal(snapshot.marker, "SYNTHETIC_NON_PRODUCTION");
  assert.equal(snapshot.locale, "ru-RU");
  assert.deepEqual(snapshot.boundary, {
    activation: "BLOCKED",
    familyLinkCount: 0,
    mutationAllowed: false,
    productionDataCount: 0,
    readiness: "NOT_READY",
    realSchoolCount: 0,
    workflow: "INACTIVE",
  });
  assert.deepEqual(
    {
      academicYear: snapshot.academicYear.code,
      classes: snapshot.classes.map((item) => item.code),
      entitlements: snapshot.entitlements.map((item) => item.capabilityCode),
      license: snapshot.license.status,
      organization: snapshot.organization.code,
      school: snapshot.school.code,
    },
    {
      academicYear: SYNTHETIC_DEMO_SCHOOL_SEED.academicYear.code,
      classes: SYNTHETIC_DEMO_SCHOOL_SEED.classes.map((item) => item.code),
      entitlements: [...SYNTHETIC_DEMO_SCHOOL_SEED.entitlements]
        .map((item) => item.capabilityCode)
        .sort((left, right) => left.localeCompare(right)),
      license: SYNTHETIC_DEMO_SCHOOL_SEED.license.status,
      organization: SYNTHETIC_DEMO_SCHOOL_SEED.organization.code,
      school: SYNTHETIC_DEMO_SCHOOL_SEED.school.code,
    },
  );
  assert.equal(snapshot.classes.length, 3);
  assert.equal(snapshot.students.length, 6);
  assert.equal(snapshot.teacherAssignments.length, 3);
  assert.equal(snapshot.studentEnrollments.length, 6);
  assert.equal(snapshot.license.entitlementCount, 3);

  for (const schoolClass of snapshot.classes) {
    const classAssignments = snapshot.teacherAssignments.filter(
      (assignment) => assignment.classCode === schoolClass.code,
    );
    const classEnrollments = snapshot.studentEnrollments.filter(
      (enrollment) => enrollment.classCode === schoolClass.code,
    );
    assert.equal(classAssignments.length, 1, schoolClass.code);
    assert.equal(classEnrollments.length, 2, schoolClass.code);
    assert.equal(schoolClass.studentCount, classEnrollments.length);
    assert.equal(schoolClass.teacherDemoCodes.length, classAssignments.length);
    assert.equal(schoolClass.subjectGroupCodes.length, classAssignments.length);
  }
  for (const teacher of snapshot.teachers) {
    assert.equal(teacher.assignmentCount, 1, teacher.demoCode);
  }
  assert.equal(
    snapshot.students.every((student) => student.enrollmentState === "ENROLLED"),
    true,
  );
  assert.equal(
    snapshot.studentEnrollments.every((enrollment) => enrollment.state === "ENROLLED"),
    true,
  );

  const forbidden = JSON.stringify(snapshot).toLowerCase();
  for (const term of ["email", "phone", "address", "userid", "familyid", "childprofileid"]) {
    assert.equal(forbidden.includes(term), false, term);
  }

  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    assert.equal((await request("/demo/school-snapshot", { method })).status, 404, method);
  }
});
