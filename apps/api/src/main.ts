import "reflect-metadata";

import fastifyMultipart from "@fastify/multipart";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";

import { AppModule } from "./app.module";
import { getAppConfig } from "./config/app.config";
import { configureSafeRequestLogging } from "./logging/request-logging";
import { SafeLogger } from "./logging/safe-logger.service";
import { getMediaStorageConfig } from "./media-storage/media-storage.service";

async function bootstrap() {
  const config = getAppConfig();
  const logger = new SafeLogger(config.logLevel);
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
    }),
    {
      logger,
    },
  );
  const mediaStorageConfig = getMediaStorageConfig();
  await app.register(fastifyMultipart, {
    limits: {
      fieldNameSize: 64,
      fields: 0,
      fileSize: mediaStorageConfig.maxFileSizeBytes,
      files: 1,
      headerPairs: 32,
      parts: 1,
    },
    throwFileSizeLimit: true,
  });
  configureSafeRequestLogging(app, logger);

  await app.listen(config.port, config.host);
  logger.log(`Listening on http://${config.host}:${config.port}`, "Bootstrap");
}

bootstrap().catch((error: unknown) => {
  const logger = new SafeLogger("error");
  logger.error(error, undefined, "Bootstrap");
  process.exit(1);
});
