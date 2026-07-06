# Privacy and data policy

 

This document defines product and engineering rules. Final legal texts require qualified legal review for the target jurisdiction and operating model.

 

## Principles

- collect the minimum necessary;

- separate adult, child, family and school contexts;

- obtain and version required consent;

- use purpose limitation;

- keep raw media temporary where possible;

- make access, export and deletion auditable;

- do not use child data for unrelated profiling or model training by default;

- design for localization and approved data residency.

 

## Data classes

### Class 0 — public

Published marketing and public help content.

 

### Class 1 — internal non-personal

Technical metrics, reviewed content IDs and aggregated statistics without re-identification risk.

 

### Class 2 — account personal data

Adult contact, authentication, billing references and support relationship.

 

### Class 3 — child learning data

Child profile, grade, textbook, goals, attempts, confirmed transcripts, mastery, plans, reports and teacher feedback.

 

### Class 4 — temporary child media

Homework images, PDFs, handwriting crops and raw audio awaiting processing or review.

 

### Class 5 — sensitive operational data

Consent evidence, audit records, support cases, provider request identifiers and school rosters.

 

### Class 6 — secrets

Credentials, signing keys, database secrets and provider tokens.

 

## Collection rules

### Adult

Collect verified contact and legal or payment data only as required.

 

### Child

Use an internal identifier and minimum profile. Avoid unnecessary exact birth date, school name, address or public profile.

 

### Homework

Strip metadata, crop unrelated regions where possible, use private storage and define retention.

 

### Voice

- record only after explicit action;

- show visible recording state;

- store raw audio temporarily;

- create a retention deadline at session creation;

- use short-lived signed URLs;

- send the minimum required audio to the approved Speech-to-Text provider;

- store confirmed text as learning data only when required;

- exclude raw audio and transcript bodies from analytics and ordinary logs;

- prohibit biometrics, emotion inference and advertising profiles.

 

## Logging

Logs may contain:

 

- internal IDs;

- event type;

- provider and policy version;

- status and error category;

- duration and size buckets;

- latency and cost category;

- trace identifiers.

 

Logs must not contain:

 

- names, contacts or school identifiers;

- complete homework statements;

- raw chat or confirmed transcript bodies;

- raw images or audio;

- payment details;

- signed URLs;

- secrets.

 

## Analytics

- use pseudonymous IDs;

- no raw text, transcript, image, audio or contact information;

- properties are allowlisted;

- small cohorts are suppressed in reporting where needed;

- event schemas receive privacy review.

 

## AI and media providers

Before activation document:

 

- purpose;

- data fields sent;

- residency;

- retention;

- training setting;

- subprocessors;

- security controls;

- deletion mechanism;

- fallback and exit plan;

- cost limit.

 

Provider adapters enforce minimization. Production providers must not silently train on submitted child data.

 

## Access

- least privilege;

- relationship and tenant checks;

- privileged MFA;

- time-bound support access;

- reason for sensitive access;

- audit events;

- periodic access review.

 

## Retention framework

Exact durations are approved before production and configured by category.

 

- active account data: while required for service and legal basis;

- learning history: while account is active and for an approved post-closure period;

- raw homework media: short operational period unless a reviewed educational reason exists;

- raw voice audio: shortest operational period required for transcription and troubleshooting, then automatic deletion;

- confirmed transcript: only as long as the associated learning record requires;

- audit and payment records: according to legal and security obligations;

- backups: bounded retention with deletion propagation policy.

 

Every media record stores `retentionUntil` and `deletedAt`. Cleanup failures are retried and alerted.

 

## User rights workflows

- access request;

- correction;

- export;

- account closure;

- consent withdrawal where applicable;

- deletion or restriction;

- school relationship termination;

- provider deletion request when required.

 

Identity is verified before sensitive export or deletion.

 

## Development and testing

- synthetic accounts and media by default;

- no production database copies on developer machines;

- scrubbed fixtures;

- secret manager for production;

- preview environments use synthetic data;

- microphone and provider tests use reviewed non-identifying recordings;

- debug mode never disables authorization or retention controls.