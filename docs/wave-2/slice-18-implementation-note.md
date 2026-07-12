# Wave 2 Slice 18 Implementation Note

## Scope

Slice 18 adds a minimal authenticated parent web interface for existing homework metadata routes. It
does not change API behavior, OpenAPI, Prisma, migrations or infrastructure and adds no dependency.

The web interface supports:

- creating a homework session from an authorized child profile, grade and source-type metadata;
- listing homework sessions owned by the authenticated family;
- viewing one homework session's display-safe metadata;
- listing existing attempt number, status and timestamp metadata for that session.

## Authentication And Tenant Boundary

The protected `/homework` layout verifies the parent session through the Slice 17 server-side auth
foundation before any route loading state or data can render. Anonymous, expired and unavailable auth
states are redirected to fixed authentication states and never receive homework data. Existing API
tenant authorization remains authoritative for create, list, detail and attempt lookups.

Bearer tokens remain in `HttpOnly`, `SameSite=Strict` cookies. Server components and server actions
use `authenticatedApiRequest`; no token enters React state, browser storage, a URL or application log.
API failures are represented with fixed local messages and raw response bodies are never rendered or
logged.

## Metadata Projection

The create action accepts only `childProfileId`, grade 7-9 and an approved source type. Subject is
fixed server-side to `math`. Unexpected form fields are rejected before the API request.

Runtime response parsers reject answer, solution, generated hint, OCR, STT, LLM, provider, raw media,
transcript and textbook-bearing fields. Session views retain only session identifier, subject, grade,
source type, status and timestamps. Attempt views retain only attempt number, status and timestamps.
Family, child and creator identifiers are not rendered. Child profile nicknames are discarded; the
selector uses neutral ordinal labels and omits archived profiles.

## Deferred Work

This slice does not add media metadata or upload UI, OCR candidate UI, voice UI, attempt submission,
answer checking, deterministic validation, hints, solutions, provider calls, billing, school, mobile,
analytics or deployment behavior. No child-facing generated help is present.

## Tests And Rollback

Dependency-free Node tests cover safe response projection, forbidden-field rejection, strict create
metadata, nickname omission, authenticated access policy, approved route use, absence of forbidden
routes and fields, and continued absence of browser token storage or logging.

Rollback removes the homework pages, action, labels, service, contract, tests and this note, restores
the previous web test script, removes the authenticated shell link and reverts the Slice 18 style
additions. No API, contract, database or dependency rollback is required.
