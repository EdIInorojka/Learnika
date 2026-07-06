# Threat model

 

## Assets

- adult and child accounts;

- consent records;

- learning history and mastery;

- homework images and documents;

- raw audio and confirmed voice transcripts;

- textbook mappings and original content;

- payment and entitlement references;

- school rosters and grades when activated;

- provider credentials;

- audit records;

- model and policy configuration.

 

## Trust boundaries

- child browser or mobile client;

- adult browser or mobile client;

- web application;

- core API;

- background workers;

- Python math and media service;

- PostgreSQL;

- Redis and BullMQ;

- object storage;

- OCR, Speech-to-Text and LLM providers;

- payment and notification providers;

- school organization boundary;

- support and administration tools.

 

## Primary threats

### Account and authorization

- credential stuffing;

- weak child-account recovery;

- parent or teacher privilege escalation;

- cross-family access;

- cross-school tenant access;

- stale specialist assignment;

- session theft.

 

### Files and media

- malicious file upload;

- spoofed MIME type;

- oversized image, PDF or audio;

- metadata leakage;

- public object exposure;

- signed URL replay;

- object-key enumeration;

- orphaned raw media;

- failure to delete expired audio.

 

### Voice input

- accidental recording;

- hidden or background microphone use;

- permission confusion;

- replayed audio;

- spoken prompt injection;

- inaccurate mathematical transcription accepted without review;

- provider retaining child audio;

- unauthorized support access;

- voice biometrics or emotional profiling;

- analytics leakage of transcripts.

 

### AI and mathematics

- prompt injection;

- answer leakage;

- incorrect validation;

- overconfident unsupported classification;

- model or prompt regression;

- poisoned content or gold set;

- provider outage or rate-limit abuse.

 

### School tenancy

- roster leakage;

- teacher access after reassignment;

- family-school context confusion;

- unauthorized grade export;

- cross-class assessment access;

- OMR or scanned-sheet misassociation.

 

### Business and abuse

- upload or transcription cost exhaustion;

- automated account creation;

- subscription or webhook fraud;

- content scraping;

- teacher or mentor misuse;

- denial of service;

- gamification manipulation.

 

## Baseline controls

- role and relationship-based authorization;

- tenant-scoped repositories and tests;

- secure session rotation and revocation;

- MFA for privileged roles;

- private object storage;

- signed short-lived URLs;

- server-generated object keys;

- file signature, type, size, page and duration validation;

- metadata stripping;

- explicit microphone state;

- transcription confirmation;

- retention and cleanup jobs;

- provider allowlist and contracts;

- rate, concurrency and cost limits;

- strict schemas and idempotency;

- audit logs for sensitive actions;

- secret scanning and dependency scanning;

- backup and restore exercises;

- feature flags and provider kill switches.

 

## Authorization tests

At minimum:

 

- parent A cannot access child B;

- child cannot access parent billing or consent;

- mentor cannot access unassigned learner;

- teacher cannot access another organization or class;

- school admin cannot access unrelated family data;

- learner cannot access another voice session or audio object;

- expired signed URL fails;

- deleted audio is inaccessible;

- support access requires reason and audit.

 

## Risk review cadence

- every wave gate;

- before enabling a new external provider;

- before introducing native microphone or camera behavior;

- before school pilot;

- before new age band or subject;

- after a security, AI or retention incident.

 

## Open risks for Wave 0

- exact provider residency and retention terms;

- legal basis and wording for child media processing;

- approved raw-audio retention duration;

- specialist access model;

- active assessment detection policy;

- support for handwritten geometry;

- cost-abuse thresholds;

- mobile permission UX.