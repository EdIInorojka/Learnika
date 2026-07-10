# Wave 2 scope and non-goals

## Status

This is the Wave 2 planning gate. It does not implement Wave 2 product code,
homework endpoints, media upload endpoints, OCR, Speech-to-Text, LLM adapters,
voice recording, storage flows, hint generation, billing, school, mobile,
analytics or deployment features.

Wave 2 implementation may start only after this plan is reviewed and explicitly
approved.

## Wave 2 theme

Wave 2 prepares the first controlled homework, media, AI and optional web voice
foundation for Learnika. The implementation must preserve the Wave 1 foundation:

- parent and family tenancy remain the active access boundary;
- student-facing help must not reveal the original homework answer or full
  solution;
- every next hint requires a meaningful learner attempt;
- deterministic math validation is used whenever the problem type is supported;
- uncertain recognition, transcription or validation produces confirmation,
  retry, unsupported or escalation states;
- child media is private, minimized, temporary and deleted by policy;
- voice input is optional, foreground-only and has a typed fallback;
- only learner-confirmed text may enter a homework or learning flow;
- provider integrations remain behind explicit boundaries and mocks until an
  approved implementation slice enables a real provider.

## Included in Wave 2 planning

Wave 2 planning covers:

- homework workflow entities, state machines and authorization boundaries;
- media and asset handling requirements for images, screenshots, PDFs and short
  audio;
- planned signed upload, sanitization, metadata stripping and retention
  behavior;
- OCR, Speech-to-Text and LLM provider interfaces with deterministic mock
  strategy;
- no-answer-leakage and attempt-gated hint contracts;
- deterministic math validation boundaries for the initial approved problem
  whitelist;
- optional web voice input with visible recording state, manual stop/cancel,
  60-second maximum and editable transcript confirmation;
- temporary media deletion, audit and failure handling requirements;
- evaluation, safety, privacy, contract and tenant-isolation test gates;
- an incremental implementation sequence that can stop safely after each slice.

## Explicit non-goals for this planning gate

This planning gate does not:

- create or change API endpoints;
- update generated OpenAPI contracts;
- add Prisma migrations or database models;
- add asset upload or storage code;
- add homework, attempt, hint or transfer code;
- add OCR, Speech-to-Text or LLM provider adapters;
- add real provider calls, credentials or secrets;
- add voice recording, transcription, normalization or cleanup code;
- add math hint generation or LLM prompts;
- add billing, subscription, entitlement or payment features;
- add school, teacher, mentor or administrator product features;
- add native mobile functionality;
- add production analytics or deployment features;
- copy textbook exercises, images or protected content.

## Homework support boundaries

Wave 2 implementation should start with a narrow, approved mathematics scope.
The Wave 0 safe starting point is one-variable linear equations and required
arithmetic prerequisites, with every supported and excluded form documented
before coding.

Homework support must:

- use a homework session state machine with safe terminal states such as
  unsupported, escalated and failed;
- create learner-visible confirmation before recognized task text becomes the
  active problem statement;
- require a meaningful learner attempt before validation and before each higher
  hint level;
- keep assisted homework completion separate from transfer evidence;
- avoid mastery updates from a single answer;
- decline or escalate unsupported, ambiguous or low-confidence content;
- keep source final answers and complete source solutions out of student-mode
  response schemas.

Homework support must not:

- solve arbitrary mathematics;
- grade unsupported open responses as certain;
- expose raw provider output to the learner;
- reveal the original answer through hints, validation messages, debug fields or
  transfer content;
- treat voice input as a shortcut around attempt or hint rules.

## Media and upload boundaries

Media support is limited to controlled private handling for:

- homework images;
- screenshots;
- PDFs within approved page and size limits;
- short foreground web audio recordings for voice input.

Implementation slices must define and test:

- server-generated object keys;
- private buckets only;
- short-lived signed upload and read access where required;
- MIME, extension, file signature, size, page count and duration validation;
- image metadata stripping;
- PDF validation and isolation before processing;
- checksum and idempotency behavior;
- retention class, retention deadline and deletion status per object;
- deletion retry and audit behavior.

Media support must not:

- make buckets or media URLs public;
- log raw media, signed URLs or transcript bodies;
- allow browser clients to receive storage credentials;
- retain raw audio or homework media indefinitely;
- process real child media with unapproved providers.

## OCR, STT and LLM boundaries

Wave 2 should introduce provider-neutral contracts before any real provider
activation:

- OCR returns recognition candidates and confidence, not truth;
- STT returns transcript candidates, confidence and uncertain fragments, not
  learner-confirmed input;
- LLM use, if approved in a later implementation slice, returns strict schemas
  or hint intents, not unrestricted prose;
- every AI result records provider, model or mock version, schema version,
  policy version and confidence where available;
- invalid schema, timeout, low confidence or unsupported content produces a safe
  fallback.

Real external calls are forbidden until an explicit implementation slice has
approved provider evidence, environment configuration, tests, kill switch and
privacy review.

## Voice input boundaries

Voice input remains an optional input method. The typed path must always be
available.

Voice implementation must preserve:

- explicit learner action before microphone permission and recording;
- visible recording state and duration;
- manual stop and cancel;
- maximum 60-second recording;
- foreground web recording only;
- no continuous or background listening;
- no real-time dialogue;
- no speech synthesis;
- no voice biometrics, emotion recognition, speaker profiling or advertising
  profiling;
- asynchronous transcription through a provider boundary;
- mathematical normalization as a proposal only;
- highlighted low-confidence fragments;
- editable transcript review;
- explicit learner confirmation before submission;
- temporary raw-audio deletion.

Raw audio must never be sent to the tutoring LLM. Only confirmed text can enter
homework support.

## Safety and privacy boundaries

Wave 2 must keep:

- child PII minimization by default;
- raw homework images, PDFs, handwriting crops and audio as temporary sensitive
  data;
- ordinary logs free of names, contacts, school identifiers, raw task text,
  transcripts, images, audio, signed URLs and secrets;
- analytics and quality events limited to allowlisted buckets and internal IDs;
- audit records for authorization decisions, sensitive media actions, deletion
  failures and support access;
- provider request data minimized to the specific task;
- provider training disabled for child data by default;
- support access reasoned, time-bound, least-privilege and audited.

## Deferred to later waves or gates

Deferred work includes:

- real provider activation until provider policy evidence is approved;
- production legal consent wording until legal review is complete;
- beta processing of real child media until retention and deletion evidence is
  approved;
- broad mathematics, geometry proofs, arbitrary handwriting and unsupported
  problem families;
- complete textbook copying or protected exercise reproduction without rights;
- diagnostics, mastery calibration and weekly plan expansion in Wave 3;
- native mobile recording and camera flows in Wave 4;
- billing, entitlements and paid beta flows in Wave 5;
- full teacher, school, organization and assessment workflows in later school
  gates;
- production analytics, deployment, incident response and monitoring beyond the
  implementation slice explicitly approved for them.
