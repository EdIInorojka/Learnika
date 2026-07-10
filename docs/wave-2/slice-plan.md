# Wave 2 slice plan

## Planning rule

This document plans future Wave 2 implementation. It does not approve or perform
implementation. Each coding slice needs explicit approval before work starts,
must keep the worktree clean at entry, and must stop if its approval criteria or
block conditions fail.

The plan is incremental: each slice leaves the product in a safe, testable state
without requiring the later slices to be present.

## Slice 0 - implementation readiness gate

Objective:

Confirm that Wave 2 coding can start from a clean Wave 1 foundation with no
hidden dependency, contract or validation failure.

Allowed changes:

- planning documentation updates;
- issue or checklist creation outside product code;
- command evidence collection.

Forbidden changes:

- product code;
- endpoints;
- migrations;
- generated contracts;
- provider configuration;
- media or voice implementation.

Required tests:

- no new tests unless a documentation validation helper already exists;
- existing foundation validation must be green.

Validation commands:

- `git status --short`
- `pnpm.cmd run format:check`
- `pnpm.cmd run lint`
- `pnpm.cmd run typecheck`
- `pnpm.cmd run test`
- `pnpm.cmd run build:web`
- `pnpm.cmd run build:api`
- `pnpm.cmd run validate`
- `pnpm.cmd run contracts:check`
- `pnpm.cmd run contracts:validate`
- `pnpm.cmd run db:validate`
- `git diff --check`

Approval criteria:

- Wave 2 planning gate is approved;
- Wave 1 closure evidence remains green;
- local dependency graph validates, including Prisma;
- first coding slice has owner, acceptance criteria and rollback plan.

Rollback or block conditions:

- dirty worktree at slice start;
- failing foundation validation without documented pre-existing cause;
- unclear scope or missing approval;
- unresolved security objection to the first coding slice.

## Slice 1 - homework and media domain model design

Objective:

Define the minimal database and domain contracts for homework sessions, assets,
recognition candidates, attempts, hint events, transfer placeholders and voice
sessions without exposing any user-facing homework flow.

Allowed changes:

- ADR or design note for Wave 2 entity ownership and state machines;
- Prisma schema draft and migration only after approval;
- tenant, retention and audit metadata fields;
- repository/service interfaces with no external behavior;
- tests for schema invariants and tenant ownership.

Forbidden changes:

- public homework or voice endpoints;
- signed upload URLs;
- provider adapters;
- math validation or hint generation;
- web UI.

Required tests:

- migration applies and rolls forward cleanly in local PostgreSQL;
- model invariant tests for family ownership;
- negative tenant tests for cross-family access at repository/service level;
- retention metadata tests for asset and voice-session records.

Validation commands:

- `pnpm.cmd run db:validate`
- `pnpm.cmd run typecheck`
- `pnpm.cmd --filter @learnika/api test`
- `pnpm.cmd run validate`
- `git diff --check`

Approval criteria:

- entities declare owner module, tenant scope, PII class, retention fields,
  deletion status and audit needs;
- no externally callable homework, media or voice behavior exists;
- migration has documented forward-fix or rollback approach.

Rollback or block conditions:

- tenant boundaries cannot be tested cleanly;
- retention fields are missing for temporary media;
- migration introduces irreversible unsafe changes;
- schema implies school, billing or mobile scope.

## Slice 2 - secure asset upload foundation with local-only storage

Objective:

Add controlled asset creation and completion foundations for private local
object storage, still without recognition or homework solving.

Allowed changes:

- API module for asset intent creation after approval;
- private object-key generation;
- MIME, extension, size, checksum and page or duration metadata validation;
- short-lived signed upload target generation for local MinIO;
- audit records for sensitive asset lifecycle actions;
- tests with synthetic files only.

Forbidden changes:

- OCR, STT or LLM calls;
- real provider configuration;
- public bucket access;
- student-facing solving or hints;
- long-term media retention.

Required tests:

- unauthorized users cannot create or complete assets for another family;
- spoofed MIME and oversize files are rejected;
- signed URLs are short-lived and never logged;
- request/response logs omit object keys where sensitive and signed URLs always;
- asset records store retention deadline and deletion state.

Validation commands:

- `pnpm.cmd run infra:validate`
- `pnpm.cmd run db:validate`
- `pnpm.cmd --filter @learnika/api test`
- `pnpm.cmd run contracts:check`
- `pnpm.cmd run contracts:validate`
- `pnpm.cmd run validate`
- `git diff --check`

Approval criteria:

- local storage remains private;
- OpenAPI documents only approved asset endpoints;
- contract validation explicitly rejects future-scope endpoints not implemented;
- synthetic upload tests pass.

Rollback or block conditions:

- signed URLs or raw media identifiers appear in ordinary logs;
- private bucket policy cannot be verified;
- asset completion is not idempotent;
- media retention cannot be represented.

## Slice 3 - homework session and attempt state machine

Objective:

Create the minimal homework workflow shell from session creation through
attempt-required states without recognition, solving or hints.

Allowed changes:

- homework session API under the approved child/family boundary;
- state transitions for created, uploading, processing placeholder,
  task-confirmation placeholder, attempt-required, unsupported, escalated and
  failed;
- attempt submission schema for typed or confirmed-text input;
- idempotency keys for retryable creation and submission;
- audit for authorization denials and sensitive state changes.

Forbidden changes:

- final answer fields;
- generated hints;
- math solving;
- voice recording or transcription;
- provider calls;
- mastery updates.

Required tests:

- parent A cannot access child B homework;
- child role restrictions are honored when child auth exists;
- attempt is required before any hint-eligible state;
- unsupported state returns safe child-facing copy;
- OpenAPI contains no source answer or full solution fields.

Validation commands:

- `pnpm.cmd --filter @learnika/api test`
- `pnpm.cmd run contracts:check`
- `pnpm.cmd run contracts:validate`
- `pnpm.cmd run typecheck`
- `pnpm.cmd run validate`
- `git diff --check`

Approval criteria:

- homework sessions are tenant-scoped and auditable;
- no answer-bearing schema fields are exposed;
- state machine prevents hint progression without attempts.

Rollback or block conditions:

- any response leaks answer, solution or raw provider text placeholders;
- state transitions allow bypassing task confirmation or attempt requirements;
- authorization coverage is incomplete.

## Slice 4 - OCR boundary and deterministic mock recognition

Objective:

Introduce the OCR recognition boundary and a deterministic local mock that
produces candidates, confidence and uncertainty from synthetic fixtures.

Allowed changes:

- provider-neutral OCR interface in the API or math-AI boundary;
- synthetic fixture-based mock implementation;
- schema-validated recognition candidate responses;
- low-confidence and unsupported recognition states;
- prompt-injection fixture tests for image text.

Forbidden changes:

- real OCR provider calls;
- provider secrets;
- assuming recognition output is truth;
- copying textbook content into fixtures without documented rights.

Required tests:

- clear synthetic image fixture returns expected candidate;
- low-confidence fixture requires confirmation;
- prompt-injection text in an image is treated as untrusted content;
- malformed provider response is rejected by schema validation;
- provider/model/mock version and confidence are stored.

Validation commands:

- `pnpm.cmd --filter @learnika/api test`
- `pnpm.cmd --filter @learnika/math-ai test`
- `pnpm.cmd run contracts:check`
- `pnpm.cmd run contracts:validate`
- `pnpm.cmd run validate`
- `git diff --check`

Approval criteria:

- OCR result is a candidate requiring learner confirmation;
- mock behavior is deterministic and uses synthetic or rights-cleared fixtures;
- no external network call is possible in default local configuration.

Rollback or block conditions:

- recognition output can enter homework as confirmed without learner action;
- fixture rights are unclear;
- mock is nondeterministic;
- default configuration can call an external OCR service.

## Slice 5 - deterministic math validation for the initial whitelist

Objective:

Validate a narrow approved set of one-variable linear-equation steps
deterministically through the math-AI service and strict schemas.

Allowed changes:

- math-AI validation endpoint or internal interface after approval;
- SymPy-backed validator for the approved whitelist;
- validation result enum and confidence;
- tests for equivalent transformations, arithmetic errors, sign errors,
  ambiguous parses and unsupported operations.

Forbidden changes:

- arbitrary mathematics;
- geometry proofs;
- mastery updates;
- final-answer display in student mode;
- LLM-based grading as authority.

Required tests:

- supported correct steps validate deterministically;
- common wrong steps return structured error categories;
- unsupported cases return unsupported or ambiguous, not guessed results;
- alternate valid forms are accepted when within scope;
- severe math regression fixtures fail the build.

Validation commands:

- `pnpm.cmd --filter @learnika/math-ai test`
- `pnpm.cmd --filter @learnika/api test`
- `pnpm.cmd run typecheck`
- `pnpm.cmd run validate`
- `git diff --check`

Approval criteria:

- whitelist and exclusions are documented;
- validator version is recorded;
- API treats unsupported or ambiguous as safe outcomes.

Rollback or block conditions:

- validator overclaims unsupported math;
- final answer is exposed in validation response;
- math fixtures include copyrighted textbook content without rights;
- deterministic tests are flaky.

## Slice 6 - no-answer hint contract and attempt gate

Objective:

Add the structured hint policy contract with reviewed or mock hint intents while
enforcing attempt-before-next-hint.

Allowed changes:

- hint-level state machine;
- structured hint intent schema;
- reviewed local templates or deterministic mock hints for the approved
  whitelist;
- answer-leak checks against response schemas and fixtures;
- escalation after repeated failure or unsupported states.

Forbidden changes:

- unrestricted LLM prose directly to children;
- source final answer or full source solution fields;
- hints that reveal the original answer;
- hint progression without a new meaningful attempt.

Required tests:

- first hint requires an attempt;
- each next hint requires another meaningful attempt;
- direct answer requests are refused or redirected safely;
- hint levels stay within the approved ladder;
- response schemas cannot include answer or full-solution fields.

Validation commands:

- `pnpm.cmd --filter @learnika/api test`
- `pnpm.cmd --filter @learnika/math-ai test`
- `pnpm.cmd run contracts:check`
- `pnpm.cmd run contracts:validate`
- `pnpm.cmd run validate`
- `git diff --check`

Approval criteria:

- hint policy version is stored;
- answer-leak tests pass;
- repeated failure leads to prerequisite practice or escalation, not answer
  disclosure.

Rollback or block conditions:

- any fixture produces the source answer;
- hint state can be advanced by voice or text without a meaningful attempt;
- raw mock/provider output reaches the student response.

## Slice 7 - STT boundary and voice session backend mock

Objective:

Create backend voice-session and Speech-to-Text boundaries with deterministic
mock transcription, transcript review state and deletion metadata.

Allowed changes:

- voice session state machine;
- create, upload-complete, status, confirm and cancel endpoints after approval;
- deterministic STT mock;
- uncertain-fragment representation;
- confirmed-text storage and raw-audio retention metadata;
- cleanup scheduling hooks without real provider calls.

Forbidden changes:

- browser microphone recording UI;
- real STT provider calls;
- raw audio to LLM;
- automatic submission of transcripts;
- voice biometrics, emotion recognition or speaker profiling.

Required tests:

- unauthorized actor cannot access another voice session;
- low-confidence transcript cannot be confirmed automatically;
- only confirmed text can attach to homework;
- cancellation schedules or performs raw-audio deletion;
- raw transcript and audio are excluded from ordinary logs and analytics.

Validation commands:

- `pnpm.cmd --filter @learnika/api test`
- `pnpm.cmd run contracts:check`
- `pnpm.cmd run contracts:validate`
- `pnpm.cmd run validate`
- `git diff --check`

Approval criteria:

- voice session invariants match `docs/product/voice-input.md`;
- mock STT is deterministic;
- default configuration cannot call external STT.

Rollback or block conditions:

- unconfirmed transcript enters homework;
- raw audio is retained without deadline;
- voice routes bypass tenant authorization;
- logs contain transcript bodies or signed URLs.

## Slice 8 - foreground web voice input and transcript confirmation UI

Objective:

Add the minimal web UI for optional foreground voice input after the backend
mock is approved.

Allowed changes:

- microphone button on an approved homework input surface;
- explicit permission request only after user action;
- visible recording state and duration;
- stop, cancel and 60-second limit;
- upload to signed private target;
- editable transcript review with uncertain fragments;
- explicit confirmation before submission;
- typed fallback always visible.

Forbidden changes:

- background or continuous listening;
- real-time voice tutor;
- speech synthesis;
- native mobile recording;
- submission of low-confidence transcript without review;
- voice-only homework flow.

Required tests:

- component tests for start, stop, cancel and timeout states;
- accessibility tests for keyboard, labels, status and errors;
- E2E or mocked browser tests for typed fallback and transcript confirmation;
- mobile viewport check at 360 px;
- microphone-denied flow preserves typed input.

Validation commands:

- `pnpm.cmd --filter @learnika/web test`
- `pnpm.cmd run build:web`
- `pnpm.cmd run typecheck`
- `pnpm.cmd run validate`
- `git diff --check`

Approval criteria:

- no recording starts on page load;
- recording status is visible while active;
- confirmed transcript is the only voice-derived text submitted;
- typed path remains available for every voice error.

Rollback or block conditions:

- recording can start without explicit action;
- transcript confirmation can be skipped;
- UI blocks learning when microphone permission is denied;
- mobile viewport is unusable.

## Slice 9 - minimal homework UI for typed and confirmed-input flow

Objective:

Expose the smallest student homework flow needed to create a session, confirm a
recognized candidate, submit an attempt, receive validation and request safe
hints.

Allowed changes:

- mobile-first web screen for the approved homework flow;
- typed input and confirmed voice transcript integration;
- task candidate confirmation UI;
- attempt and hint progression UI;
- unsupported, low-confidence and escalation states;
- no-answer copy aligned with product voice.

Forbidden changes:

- marketing landing page in place of the actual flow;
- final answer display;
- unrestricted chat;
- billing, school, teacher/admin or mobile app UI;
- broad content browsing.

Required tests:

- critical flow works at 360 px viewport;
- direct answer request does not reveal answer;
- hint button is disabled until a meaningful attempt exists;
- low-confidence recognition requires learner confirmation;
- accessibility checks for forms, errors and focus.

Validation commands:

- `pnpm.cmd --filter @learnika/web test`
- `pnpm.cmd run build:web`
- `pnpm.cmd run typecheck`
- `pnpm.cmd run validate`
- `git diff --check`

Approval criteria:

- the first screen is the usable homework experience, not a marketing page;
- UI states map to approved backend state machine;
- no hidden or visible answer leakage exists in student mode.

Rollback or block conditions:

- answer or full solution appears in UI, network response or fixture;
- hint progression bypasses attempt state;
- UI introduces billing, school or unsupported roadmap surfaces.

## Slice 10 - LLM provider boundary with local mock only

Objective:

Prepare the LLM boundary for structured safety tasks while keeping real LLM
calls disabled by default and out of the learner response path.

Allowed changes:

- provider-neutral LLM interface;
- deterministic local mock for structured hint intent or refusal classification;
- strict request and response schemas;
- provider metadata fields;
- kill-switch and disabled-by-default configuration.

Forbidden changes:

- real LLM provider calls;
- real secrets;
- raw audio input;
- raw provider output shown to learners;
- LLM authority over deterministic math validation.

Required tests:

- invalid model output fails schema validation;
- mock returns safe refusal for answer-extraction attempts;
- prompt-injection fixtures do not override policy;
- provider disabled configuration is the local default;
- policy, schema, model and mock versions are stored.

Validation commands:

- `pnpm.cmd --filter @learnika/api test`
- `pnpm.cmd --filter @learnika/math-ai test`
- `pnpm.cmd run contracts:check`
- `pnpm.cmd run contracts:validate`
- `pnpm.cmd run validate`
- `git diff --check`

Approval criteria:

- no real LLM call is possible without a later explicit slice;
- LLM output is schema-validated and post-validated;
- deterministic validation remains authoritative for supported math.

Rollback or block conditions:

- default local environment requires or accepts real provider secrets;
- model output can bypass answer-leak policy;
- raw child data is sent outside the local mock boundary.

## Slice 11 - temporary media cleanup and deletion evidence

Objective:

Implement and test retention cleanup for temporary homework media and raw audio
created by earlier approved slices.

Allowed changes:

- cleanup worker or job;
- idempotent deletion service;
- deletion audit events;
- retry and failure states;
- local dry-run command for operational review;
- tests for expired and deleted media access denial.

Forbidden changes:

- public access to diagnose storage;
- indefinite raw audio or homework media archive;
- deletion of unrelated family data;
- real provider deletion calls unless separately approved.

Required tests:

- expired raw audio is deleted and inaccessible;
- expired homework media follows approved retention policy;
- cleanup retry is idempotent;
- deletion failure creates safe audit and alertable status;
- deleted object cannot be retrieved by signed URL.

Validation commands:

- `pnpm.cmd run infra:validate`
- `pnpm.cmd --filter @learnika/api test`
- `pnpm.cmd run db:validate`
- `pnpm.cmd run validate`
- `git diff --check`

Approval criteria:

- every temporary media record has `retentionUntil` and `deletedAt` behavior;
- deletion compliance can be demonstrated locally with synthetic media;
- cleanup failure does not expose media or require public bucket access.

Rollback or block conditions:

- cleanup can delete non-expired or cross-family objects;
- deleted media remains accessible;
- failure states are invisible to audit or operations.

## Slice 12 - Wave 2 safety, evaluation and closure gate

Objective:

Close the Wave 2 implementation wave with evidence, thresholds, safety review
and a release decision for the implemented slice scope.

Allowed changes:

- gold-set fixtures that are synthetic, original or rights-cleared;
- answer-leak, prompt-injection, math-validation, transcription and retention
  evaluation tests;
- closure-gate documentation;
- runbook updates for the implemented behavior;
- approved README or index links.

Forbidden changes:

- new product features;
- provider activation without separate evidence;
- beta launch claims;
- school, billing, mobile or deployment expansion.

Required tests:

- full foundation validation;
- tenant and authorization negative tests;
- answer-leak suite;
- deterministic math validation suite;
- voice confirmation and low-confidence suite;
- temporary media deletion suite;
- PII-safe logging and analytics checks.

Validation commands:

- `pnpm.cmd run format:check`
- `pnpm.cmd run lint`
- `pnpm.cmd run typecheck`
- `pnpm.cmd run test`
- `pnpm.cmd run build:web`
- `pnpm.cmd run build:api`
- `pnpm.cmd run validate`
- `pnpm.cmd run contracts:check`
- `pnpm.cmd run contracts:validate`
- `pnpm.cmd run db:validate`
- `git diff --check`

Approval criteria:

- implemented scope matches the approved slices only;
- all required tests are green;
- answer-leak, severe math-error, unsupported-overconfidence, voice correction,
  latency and deletion-compliance thresholds have explicit verdicts;
- security, privacy, curriculum, QA and independent review return approve or
  approved fixes are closed.

Rollback or block conditions:

- answer leakage above threshold;
- severe math regression above threshold;
- transcript confirmation bypass;
- temporary media deletion not proven;
- raw media or transcript bodies in logs or analytics;
- missing provider, retention, legal or evaluation evidence for any enabled
  external behavior.
