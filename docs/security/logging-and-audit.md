# Logging and audit foundation

Slice 9 establishes local-safe structured logging and audit rules for the
current auth, family setup and tenant authorization foundation.

## Ordinary logs

- Use structured JSON logs.
- Include service name, level, timestamp, context and request/correlation IDs
  where available.
- Do not log request or response bodies by default.
- Do not log passwords, password hashes, access or refresh tokens, token
  hashes, authorization headers, cookies, secrets, signed URLs, emails, child
  nicknames, names or school identifiers.
- Do not log raw homework text, transcripts, images or audio.
- Redact suspicious sensitive keys and strings before writing to stdout/stderr.

## Audit records

- Use the existing `AuditLog` table.
- Current allowed audit categories are authentication, family setup and
  authorization decisions.
- Store internal IDs, action, outcome, target type/id and policy version only
  when the value is non-sensitive.
- Do not place raw passwords, tokens, cookies, auth headers, secrets or personal
  data in audit fields.

## Telemetry

No external telemetry, analytics, Sentry or OpenTelemetry exporter is enabled in
Slice 9. Web local commands keep Next telemetry disabled through
`apps/web/scripts/next.mjs`.
