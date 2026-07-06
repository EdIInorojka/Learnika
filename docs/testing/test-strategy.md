# Test and evaluation strategy

 

## Quality layers

### 1. Static checks

- formatting;

- lint;

- TypeScript strict typecheck;

- Python type and lint checks;

- dependency and secret scanning;

- architecture dependency rules.

 

### 2. Unit tests

- domain policies;

- authorization decisions;

- mastery calculations;

- planner constraints;

- mathematical normalization;

- mathematical speech normalization;

- voice session state machine;

- hint-policy selection;

- entitlement limits;

- retention scheduling.

 

### 3. Integration tests

- PostgreSQL repositories and migrations;

- Redis queues and idempotency;

- object-storage adapter;

- API to math-AI contracts;

- Speech-to-Text provider adapter;

- media transcoding worker;

- audio cleanup worker;

- payment webhook verification;

- audit logging;

- report generation.

 

### 4. Contract tests

- OpenAPI compatibility;

- generated client freshness;

- event schema compatibility;

- math-AI strict JSON schemas;

- Speech-to-Text adapter fixtures;

- provider error and timeout fixtures.

 

### 5. E2E tests

Critical flows:

 

- parent registration and child creation;

- consent and textbook selection;

- supported homework upload;

- typed attempt, invalid step, hint and completion;

- voice permission, recording, transcription, edit and confirmation;

- voice fallback to text;

- transfer problem;

- parent report;

- authorization denial across families;

- paid entitlement and limit behavior;

- mentor escalation.

 

### 6. AI and educational evaluations

Maintain reviewed gold sets for:

 

- recognition;

- Russian mathematical speech transcription;

- mathematical speech normalization;

- problem classification;

- normalized math;

- valid and invalid steps;

- alternative strategies;

- hint usefulness;

- answer leakage;

- transfer equivalence;

- age-appropriate language;

- prompt injection and abuse.

 

Report by problem type, audio condition and confidence bucket.

 

### 7. Voice and media tests

- permission granted, denied and permanently denied;

- no microphone and unsupported browser;

- start, stop, cancel and duration limit;

- silence, noise, quiet speech and fast child speech;

- fractions, negative signs, roots, powers and brackets;

- mixed Russian speech and Latin variables;

- unsupported, corrupt and oversized files;

- interrupted and repeated upload;

- provider timeout and rate limit;

- low-confidence review;

- transcript edit and confirmation;

- expired signed URL;

- unauthorized session access;

- deletion and deletion retry;

- no raw transcript in analytics or logs.

 

### 8. Security tests

- tenant isolation;

- role escalation;

- session revocation;

- signed URL expiry;

- file validation;

- microphone and audio authorization;

- webhook forgery;

- rate and cost limits;

- log and analytics PII checks.

 

### 9. Performance tests

- upload initiation and completion;

- transcription queue latency and backlog;

- homework state polling or subscription;

- step validation latency;

- parent-report generation;

- cleanup job throughput;

- school batch flows when activated.

 

## Test data

- synthetic only by default;

- reviewed images and voice recordings with no real child identity;

- fixed deterministic clocks and IDs where useful;

- factories by tenant;

- explicit negative authorization fixtures;

- versioned gold datasets.

 

## Release gates

A release is blocked when:

 

- critical tests fail;

- severe math regression occurs;

- answer-leak threshold is exceeded;

- tenant-isolation test fails;

- voice confirmation can be bypassed;

- temporary audio deletion is not proven;

- migration recovery is undocumented;

- required monitoring is missing;

- independent reviewer returns BLOCK.

 

## Evidence in Codex output

Every implementation task reports:

 

- commands executed;

- pass and fail counts;

- skipped tests and reason;

- coverage or evaluation deltas where relevant;

- remaining known defects;

- reviewer verdict.