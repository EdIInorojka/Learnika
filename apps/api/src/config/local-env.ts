import fs from "node:fs";
import path from "node:path";

function parseEnvContent(content: string): Record<string, string> {
  const parsed: Record<string, string> = {};

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

function findRepoRoot(): string {
  const candidates = [process.cwd(), path.resolve(process.cwd(), "..", "..")];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, ".env.example"))) {
      return candidate;
    }
  }

  return process.cwd();
}

export function loadLocalEnvironment(): void {
  const repoRoot = findRepoRoot();
  const envFiles = [path.join(repoRoot, ".env")];

  if (process.env.NODE_ENV !== "production") {
    envFiles.push(path.join(repoRoot, ".env.example"));
  }

  for (const envFile of envFiles) {
    if (!fs.existsSync(envFile)) {
      continue;
    }

    const parsed = parseEnvContent(fs.readFileSync(envFile, "utf8"));

    for (const [key, value] of Object.entries(parsed)) {
      process.env[key] ??= value;
    }
  }
}
