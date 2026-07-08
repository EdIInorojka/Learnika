import { spawnSync } from "node:child_process";
import path from "node:path";

const serviceRoot = path.resolve(import.meta.dirname, "..");
const candidates = [
  process.env.LEARNIKA_PYTHON,
  path.join(serviceRoot, ".venv", "Scripts", "python.exe"),
  path.join(serviceRoot, ".venv", "bin", "python"),
  "python",
].filter(Boolean);

const checkCode = `
import ast
import pathlib

for path in pathlib.Path("src").rglob("*.py"):
    ast.parse(path.read_text(encoding="utf-8"), filename=str(path))

print("Python syntax check passed for @learnika/math-ai.")
`;

for (const candidate of candidates) {
  const result = spawnSync(candidate, ["-c", checkCode], {
    cwd: serviceRoot,
    encoding: "utf8",
    shell: false,
    stdio: "pipe",
  });

  if (result.error && result.error.code === "ENOENT") {
    continue;
  }

  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}

console.error("No Python executable found. Set LEARNIKA_PYTHON or create services/math-ai/.venv.");
process.exit(1);
