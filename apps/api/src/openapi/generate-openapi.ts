import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { format, resolveConfig } from "prettier";

import { AppModule } from "../app.module";

const outputPath = path.resolve(process.cwd(), "../../packages/contracts/openapi.json");

async function stringifyOpenApi(document: unknown): Promise<string> {
  const prettierConfig = await resolveConfig(outputPath);
  return format(JSON.stringify(document), { ...prettierConfig, parser: "json" });
}

async function createOpenApiJson(): Promise<string> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { logger: false },
  );
  const config = new DocumentBuilder()
    .setTitle("Learnika API")
    .setDescription("OpenAPI contract for currently implemented Learnika routes.")
    .setVersion("0.0.0")
    .addBearerAuth(
      {
        bearerFormat: "opaque",
        scheme: "bearer",
        type: "http",
      },
      "bearerAuth",
    )
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (_controllerKey, methodKey) => methodKey,
  });

  await app.close();

  return stringifyOpenApi(document);
}

async function main() {
  const nextOpenApi = await createOpenApiJson();

  if (process.argv.includes("--check")) {
    const currentOpenApi = await readFile(outputPath, "utf8");

    if (currentOpenApi !== nextOpenApi) {
      console.error("[contracts] packages/contracts/openapi.json is stale.");
      process.exitCode = 1;
      return;
    }

    console.log("[contracts] OpenAPI artifact is current.");
    return;
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, nextOpenApi, "utf8");
  console.log(`[contracts] Wrote ${path.relative(process.cwd(), outputPath)}.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
