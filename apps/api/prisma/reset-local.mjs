import path from "node:path";
import { spawnSync } from "node:child_process";
import { URL, fileURLToPath } from "node:url";

import { loadLocalEnv } from "./local-env.mjs";

const accepted = process.argv.slice(2).includes("--yes");
const env = loadLocalEnv();
const databaseUrl = env.DATABASE_URL;

function isLocalDatabase(urlValue) {
  try {
    const url = new URL(urlValue);
    return (
      url.protocol === "postgresql:" &&
      ["127.0.0.1", "localhost"].includes(url.hostname) &&
      url.pathname === "/learnika_local"
    );
  } catch {
    return false;
  }
}

if (!accepted) {
  console.error(
    "Refusing to reset the database without --yes. This command deletes and recreates the local learnika_local PostgreSQL schema.",
  );
  process.exit(1);
}

if (!databaseUrl || !isLocalDatabase(databaseUrl)) {
  console.error(
    "Refusing to reset because DATABASE_URL is not the documented local PostgreSQL database.",
  );
  process.exit(1);
}

const scriptPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "run-prisma.mjs");
const result = spawnSync(process.execPath, [scriptPath, "migrate", "reset", "--force"], {
  env,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
