import type { LoggerService } from "@nestjs/common";

import type { LogLevel } from "../config/app.config";

const levelRank: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  log: 2,
  debug: 3,
  verbose: 4,
};

export class SafeLogger implements LoggerService {
  constructor(private readonly level: LogLevel = "log") {}

  log(message: unknown, context?: string): void {
    this.write("log", message, context);
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.write("error", message, context, trace);
  }

  warn(message: unknown, context?: string): void {
    this.write("warn", message, context);
  }

  debug(message: unknown, context?: string): void {
    this.write("debug", message, context);
  }

  verbose(message: unknown, context?: string): void {
    this.write("verbose", message, context);
  }

  private write(level: LogLevel, message: unknown, context?: string, trace?: string): void {
    if (levelRank[level] > levelRank[this.level]) {
      return;
    }

    const event = {
      context,
      level,
      message: String(message),
      service: "api",
      timestamp: new Date().toISOString(),
      trace,
    };

    const line = JSON.stringify(event);
    if (level === "error") {
      console.error(line);
      return;
    }

    console.log(line);
  }
}
