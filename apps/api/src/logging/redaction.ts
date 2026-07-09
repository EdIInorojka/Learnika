const sensitiveFieldPattern =
  /authorization|cookie|set-cookie|password|passwordhash|token|tokenhash|secret|api.?key|credential|session|email|nickname|displayname|school/i;
const sensitiveTextPattern =
  /authorization|cookie|password|passwordhash|token|tokenhash|secret|bearer\s+[a-z0-9._~+/=-]+|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

const redactedValue = "[redacted]";
const redactedField = "redactedField";

export function containsSensitiveText(value: string): boolean {
  return sensitiveTextPattern.test(value);
}

export function isSensitiveFieldName(value: string): boolean {
  return sensitiveFieldPattern.test(value);
}

export function redactLogValue(value: unknown): unknown {
  return redactLogValueInner(value, new WeakSet<object>());
}

export function redactLogText(value: string): string {
  return containsSensitiveText(value) ? redactedValue : value;
}

function redactLogValueInner(value: unknown, seen: WeakSet<object>): unknown {
  if (value instanceof Error) {
    return {
      message: redactLogText(value.message),
      type: value.name,
    };
  }

  if (typeof value === "string") {
    return redactLogText(value);
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  if (seen.has(value)) {
    return "[circular]";
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactLogValueInner(item, seen));
  }

  const safeValue: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (isSensitiveFieldName(key)) {
      safeValue[redactedField] = redactedValue;
      continue;
    }

    safeValue[key] = redactLogValueInner(item, seen);
  }

  return safeValue;
}
