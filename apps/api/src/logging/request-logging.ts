import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";

import type { SafeLogger } from "./safe-logger.service";

type HookDone = (error?: Error) => void;

interface FastifyLike {
  addHook(
    name: "onRequest",
    hook: (request: RequestLike, reply: ReplyLike, done: HookDone) => void,
  ): void;
  addHook(
    name: "onResponse",
    hook: (request: RequestLike, reply: ReplyLike, done: HookDone) => void,
  ): void;
}

interface ReplyLike {
  header(name: string, value: string): void;
  statusCode: number;
}

interface RequestLike {
  headers: Record<string, string | string[] | undefined>;
  method: string;
  safeCorrelationId?: string;
  safeRequestId?: string;
  safeStartTime?: bigint;
  url: string;
}

const headerIdPattern = /^[A-Za-z0-9._:-]{1,128}$/;

export function configureSafeRequestLogging(app: NestFastifyApplication, logger: SafeLogger): void {
  const fastify = app.getHttpAdapter().getInstance() as FastifyLike;

  fastify.addHook("onRequest", (request, reply, done) => {
    const requestId = normalizeHeaderId(firstHeaderValue(request.headers["x-request-id"]));
    const correlationId = normalizeHeaderId(firstHeaderValue(request.headers["x-correlation-id"]));

    request.safeRequestId = requestId ?? randomUUID();
    request.safeCorrelationId = correlationId ?? request.safeRequestId;
    request.safeStartTime = process.hrtime.bigint();

    reply.header("x-request-id", request.safeRequestId);
    reply.header("x-correlation-id", request.safeCorrelationId);
    done();
  });

  fastify.addHook("onResponse", (request, reply, done) => {
    const durationMs = request.safeStartTime
      ? Number(process.hrtime.bigint() - request.safeStartTime) / 1_000_000
      : undefined;

    logger.log(
      {
        correlationId: request.safeCorrelationId,
        durationMs: durationMs === undefined ? undefined : Math.round(durationMs),
        event: "http.request",
        method: request.method,
        path: safePathname(request.url),
        requestId: request.safeRequestId,
        statusCode: reply.statusCode,
      },
      "HttpRequest",
    );
    done();
  });
}

function firstHeaderValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeHeaderId(value: string | undefined): string | undefined {
  return value && headerIdPattern.test(value) ? value : undefined;
}

function safePathname(url: string): string {
  const queryIndex = url.indexOf("?");
  return queryIndex >= 0 ? url.slice(0, queryIndex) : url;
}
