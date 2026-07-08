import { spawnSync } from "node:child_process";

if (!process.argv.includes("--yes")) {
  console.error("[infra] Refusing to clean local infrastructure without explicit confirmation.");
  console.error("[infra] This deletes local Docker containers and named volumes for Learnika.");
  console.error("[infra] Run: pnpm.cmd run infra:clean -- --yes");
  process.exit(1);
}

const result = spawnSync("docker", ["compose", "down", "--volumes", "--remove-orphans"], {
  encoding: "utf8",
  stdio: "inherit",
  shell: false,
});

process.exit(result.status ?? 1);
