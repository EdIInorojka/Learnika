import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const serviceRoot = path.resolve(import.meta.dirname, "..");
const candidates = [
  process.env.LEARNIKA_PYTHON,
  path.join(serviceRoot, ".venv", "Scripts", "python.exe"),
  path.join(serviceRoot, ".venv", "bin", "python"),
  "python",
].filter(Boolean);

const args = process.argv.slice(2);

for (const candidate of candidates) {
  if (candidate !== "python" && !existsSync(candidate)) {
    continue;
  }

  const result = spawnSync(candidate, args, {
    cwd: serviceRoot,
    encoding: "utf8",
    shell: false,
    stdio: "inherit",
  });

  if (result.error && result.error.code === "ENOENT") {
    continue;
  }

  process.exit(result.status ?? 1);
}

console.error("No Python executable found. Set LEARNIKA_PYTHON or create services/math-ai/.venv.");
process.exit(1);
