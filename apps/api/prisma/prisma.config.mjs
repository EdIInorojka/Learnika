import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, env } from "prisma/config";

const prismaDir = path.dirname(fileURLToPath(import.meta.url));

function toPrismaPath(filePath) {
  return filePath.split(path.sep).join(path.posix.sep);
}

export default defineConfig({
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: toPrismaPath(path.join(prismaDir, "migrations")),
  },
  schema: toPrismaPath(path.join(prismaDir, "schema.prisma")),
});
