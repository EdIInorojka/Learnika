import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import http from "node:http";

const requiredEnv = [
  "COMPOSE_PROJECT_NAME",
  "POSTGRES_HOST",
  "POSTGRES_PORT",
  "POSTGRES_DB",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
  "DATABASE_URL",
  "REDIS_HOST",
  "REDIS_PORT",
  "REDIS_PASSWORD",
  "REDIS_URL",
  "MINIO_API_PORT",
  "MINIO_CONSOLE_PORT",
  "MINIO_ROOT_USER",
  "MINIO_ROOT_PASSWORD",
  "S3_ENDPOINT",
  "S3_BUCKET",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
  "S3_FORCE_PATH_STYLE",
];

const command = process.argv[2] ?? "help";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  const env = {};
  const content = readFileSync(filePath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    const value = line.slice(equalsIndex + 1).trim();
    env[key] = value;
  }

  return env;
}

function localEnv() {
  return {
    ...loadEnvFile(".env.example"),
    ...loadEnvFile(".env"),
  };
}

function run(commandName, args, options = {}) {
  const result = spawnSync(commandName, args, {
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(
      `${commandName} ${args.join(" ")} failed with exit code ${result.status}${
        details ? `\n${details}` : ""
      }`,
    );
  }

  return result.stdout?.trim() ?? "";
}

function checkEnv() {
  const example = loadEnvFile(".env.example");
  const missing = requiredEnv.filter((name) => !Object.hasOwn(example, name));

  if (missing.length > 0) {
    throw new Error(`.env.example is missing required variables: ${missing.join(", ")}`);
  }

  console.log("[infra] .env.example documents all required local variables.");
}

function checkComposeConfig() {
  run("docker", ["compose", "config"], { capture: true });
  console.log("[infra] Docker Compose config is valid.");
}

function startServices() {
  console.log("[infra] Starting local Docker Compose services...");
  run("docker", ["compose", "up", "-d"]);
}

async function waitFor(name, check, timeoutMs = 120_000) {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      await check();
      console.log(`[infra] ${name} is reachable.`);
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => {
        setTimeout(resolve, 2_000);
      });
    }
  }

  throw new Error(`${name} did not become reachable. Last error: ${lastError?.message}`);
}

async function checkPostgres() {
  const env = localEnv();
  await waitFor("PostgreSQL", () => {
    run("docker", [
      "compose",
      "exec",
      "-T",
      "postgres",
      "pg_isready",
      "-U",
      env.POSTGRES_USER,
      "-d",
      env.POSTGRES_DB,
    ]);
  });
}

async function checkRedis() {
  const env = localEnv();
  await waitFor("Redis", () => {
    const output = run(
      "docker",
      ["compose", "exec", "-T", "redis", "redis-cli", "-a", env.REDIS_PASSWORD, "ping"],
      { capture: true },
    );

    if (!output.includes("PONG")) {
      throw new Error(`Unexpected Redis ping output: ${output}`);
    }
  });
}

function requestMinioHealth(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      response.resume();
      if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
        resolve();
        return;
      }

      reject(new Error(`HTTP ${response.statusCode}`));
    });

    request.on("error", reject);
    request.setTimeout(5_000, () => {
      request.destroy(new Error("request timed out"));
    });
  });
}

async function checkMinio() {
  const env = localEnv();
  const url = `http://127.0.0.1:${env.MINIO_API_PORT}/minio/health/live`;
  await waitFor("MinIO health endpoint", () => requestMinioHealth(url));
}

async function validate() {
  checkEnv();
  checkComposeConfig();
  startServices();
  await checkPostgres();
  await checkRedis();
  await checkMinio();
  console.log("[infra] Local infrastructure validation passed.");
}

try {
  if (command === "env") {
    checkEnv();
  } else if (command === "config") {
    checkComposeConfig();
  } else if (command === "up") {
    startServices();
  } else if (command === "postgres") {
    await checkPostgres();
  } else if (command === "redis") {
    await checkRedis();
  } else if (command === "minio") {
    await checkMinio();
  } else if (command === "validate") {
    await validate();
  } else {
    console.log("Usage: node infra/docker/check.mjs <env|config|up|postgres|redis|minio|validate>");
  }
} catch (error) {
  console.error(`[infra] ${error.message}`);
  process.exit(1);
}
