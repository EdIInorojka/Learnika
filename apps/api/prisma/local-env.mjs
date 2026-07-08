import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(apiRoot, "..", "..");

function parseEnvContent(content) {
  const parsed = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

export function loadLocalEnv() {
  const env = { ...process.env };
  const envFiles = [path.join(repoRoot, ".env"), path.join(repoRoot, ".env.example")];

  for (const envFile of envFiles) {
    if (!fs.existsSync(envFile)) {
      continue;
    }

    const parsed = parseEnvContent(fs.readFileSync(envFile, "utf8"));

    for (const [key, value] of Object.entries(parsed)) {
      env[key] ??= value;
    }
  }

  return env;
}

export function getApiRoot() {
  return apiRoot;
}
