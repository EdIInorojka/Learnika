import path from "node:path";
import { spawnSync } from "node:child_process";

import { getApiRoot, loadLocalEnv } from "./local-env.mjs";

const apiRoot = getApiRoot();
const prismaExecutable = path.join(apiRoot, "node_modules", "prisma", "build", "index.js");
const args = process.argv.slice(2).filter((arg) => arg !== "--");

if (!args.includes("--config")) {
  args.push("--config", "prisma/prisma.config.mjs");
}

const result = spawnSync(process.execPath, [prismaExecutable, ...args], {
  cwd: apiRoot,
  env: loadLocalEnv(),
  stdio: "inherit",
});

if (result.error) {
  console.error(`[db] Failed to run Prisma CLI: ${result.error.message}`);
}

process.exit(result.status ?? 1);
