# Wave 2 Slice 4 implementation note

## Status

Wave 2 Slice 4 adds an internal homework attempt state foundation only. It does
not add public homework endpoints, upload/download/signing endpoints, generated
route contracts, web UI, OCR, Speech-to-Text, LLM, voice recording, hint
generation, answer checking, solution generation, billing, school,
teacher/admin, mobile, analytics or deployment behavior.

## Internal foundation

Added internal API homework state helpers under `apps/api/src/homework-state/`:

- `HomeworkStateService`
- `HomeworkStateModule`
- homework state type definitions

The module is not imported into `AppModule` and has no controller. It is ready
for later internal use by approved Wave 2 homework slices.

## State machine boundaries

The foundation uses the existing Slice 2 Prisma statuses without schema changes:

- homework session statuses: `CREATED`, `WAITING_FOR_ATTEMPT`, `PAUSED`,
  `CANCELLED`, `CLOSED`;
- homework attempt statuses: `CREATED`, `SUBMITTED`, `CANCELLED`.

Allowed session transitions:

- `CREATED` to `WAITING_FOR_ATTEMPT`, `PAUSED` or `CANCELLED`;
- `WAITING_FOR_ATTEMPT` to `PAUSED`, `CANCELLED` or `CLOSED`;
- `PAUSED` to `WAITING_FOR_ATTEMPT` or `CANCELLED`.

Allowed attempt transitions:

- `CREATED` to `SUBMITTED`;
- `CREATED` to `CANCELLED`.

`CANCELLED` and `CLOSED` sessions are terminal. `SUBMITTED` and `CANCELLED`
attempts are terminal.

## Attempt-gating foundation

Slice 4 introduces internal primitives for later no-answer, attempt-gated
assistance:

- monotonic attempt numbering per homework session;
- metadata-only attempt ownership helpers for family, child and session IDs;
- placeholder meaningful-attempt evaluation based only on submitted state and a
  boolean learner-work signal;
- assistance gating that denies progression until a submitted meaningful attempt
  exists.

The meaningful-attempt policy is deliberately a placeholder. It does not inspect
or store learner free text, evaluate correctness, generate hints or reveal
answers.

## Explicit exclusions

This slice does not:

- create public API routes;
- create upload/download/signing URLs;
- update OpenAPI for new routes;
- add Prisma models or migrations;
- store learner answer text or free-text attempts;
- generate hints;
- evaluate correctness;
- create solutions or answer checking;
- store answers, solutions, transcripts, OCR/STT/LLM outputs, provider payloads
  or raw media content.

## Safety behavior

State outputs contain only statuses, internal IDs, attempt numbers, policy
versions and safe reason codes. Diagnostic redaction removes answer-like,
solution-like, hint-like, transcript, OCR/STT/LLM, provider, raw media, auth,
token, secret, email and child nickname values before they can be logged or
returned as structured failure details.

## Validation coverage

`apps/api/test/homework-state.test.mjs` covers:

- valid homework session transitions;
- invalid homework session transition rejection;
- valid homework attempt transitions;
- invalid homework attempt transition rejection;
- monotonic attempt numbering;
- metadata-only attempt behavior;
- assistance denial before any attempt exists;
- assistance denial for cancelled or unsubmitted attempts;
- placeholder meaningful-attempt behavior without answer leakage;
- redaction of sensitive diagnostic values;
- absence of public homework/media/voice routes and controllers.
