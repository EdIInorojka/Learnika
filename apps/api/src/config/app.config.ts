export type LogLevel = "debug" | "error" | "log" | "verbose" | "warn";

export interface AppConfig {
  environment: string;
  host: string;
  logLevel: LogLevel;
  port: number;
  serviceName: string;
}

function parsePort(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseLogLevel(value: string | undefined): LogLevel {
  const allowed = new Set<LogLevel>(["debug", "error", "log", "verbose", "warn"]);
  return allowed.has(value as LogLevel) ? (value as LogLevel) : "log";
}

export function getAppConfig(): AppConfig {
  return {
    environment: process.env.NODE_ENV ?? "development",
    host: process.env.API_HOST ?? "127.0.0.1",
    logLevel: parseLogLevel(process.env.LOG_LEVEL),
    port: parsePort(process.env.API_PORT, 3001),
    serviceName: "api",
  };
}
