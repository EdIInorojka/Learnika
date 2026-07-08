import { spawnSync } from "node:child_process";

const command = process.platform === "win32" ? "next.cmd" : "next";
const result = spawnSync(command, process.argv.slice(2), {
  encoding: "utf8",
  env: {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: "1",
  },
  shell: process.platform === "win32",
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
}

process.exit(result.status ?? 1);
