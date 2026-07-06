# Implementation plan

 

## Operating rule

Implement one vertical slice at a time. Architecture may support future growth, but code for future products remains behind explicit gates.

 

## Wave 0 — discovery, prototype and architecture

### Deliverables

- repository and documentation audit;

- finalized scope and non-goals;

- clickable homework and voice-input prototype;

- learner usability findings;

- context map and module ownership;

- domain model and tenant boundaries;

- ADR set including voice pipeline;

- threat model and PII inventory;

- curriculum seed specification;

- homework and voice contract schemas;

- event taxonomy;

- test, media and AI evaluation strategy;

- prioritized backlog;

- file ownership matrix.

 

### No production feature code

Only documentation, approved risk-reduction spikes, prototypes and synthetic fixtures.

 

### Exit gate

Independent review returns APPROVE or approved fixes are closed.

 

## Wave 1 — foundation

### Deliverables

- pnpm and Turborepo monorepo;

- Next.js web, NestJS API and Python math-AI shells;

- Docker Compose local environment;

- PostgreSQL, Prisma, Redis, BullMQ and object storage;

- migrations and seeds;

- adult registration and session model;

- family, child and consent;

- textbook seed catalog;

- role and tenant authorization;

- audit log;

- CI, observability and security baseline;

- onboarding E2E;

- deterministic OCR, Speech-to-Text and LLM mocks.

 

### Exit gate

Fresh clone starts from documented commands. Authorization and tenant tests pass.

 

## Wave 2 — homework helper and web voice input

### Vertical slice

Upload → sanitize → recognize → confirm task → type or record → confirm transcript → attempt → validate → hint → complete → transfer → evidence → delete temporary media.

 

### Deliverables

- controlled image, PDF and audio upload;

- mock and one approved recognition adapter;

- normalized problem schema;

- initial algebra whitelist;

- deterministic validation;

- answer-leak guard;

- hint policy;

- transfer task;

- voice session state machine;

- browser recording up to 60 seconds;

- Speech-to-Text adapter;

- mathematical speech normalizer;

- editable transcript confirmation;

- retention cleanup worker;

- homework state UI;

- quality, cost and safety instrumentation;

- image, math, voice and answer-leak gold suites.

 

### Exit gate

Accuracy, leakage, transcription correction, deletion compliance, latency, cost and UX thresholds are approved.

 

## Wave 3 — diagnostic and weekly plan

### Deliverables

- seed skill graph;

- original diagnostic;

- mastery model;

- school, restorative and target tracks;

- weekly plan and spaced review;

- parent report;

- analytics and experiments;

- first textbook mapping workflow.

 

### Exit gate

Learners complete repeated sessions; transfer and report comprehension show positive evidence.

 

## Wave 4 — native mobile application

### Deliverables

- React Native and Expo project;

- approved learner and parent journey parity;

- native camera and foreground microphone;

- resilient media upload and retry;

- secure token storage;

- push notifications;

- mobile accessibility, crash reporting and analytics;

- EAS build and release pipeline.

 

### Exit gate

Mobile E2E, store-readiness, permission, security and reliability tests pass.

 

## Wave 5 — paid beta

### Deliverables

- product plans and entitlements;

- payment-provider adapter and webhooks;

- usage limits;

- trial and cancellation;

- mentor escalation and support tools;

- content publication workflow;

- backups, restore and incident runbooks;

- cohort and unit-economics dashboards including AI, OCR and speech cost.

 

### Exit gate

Paid retention and cost path justify further acquisition.

 

## Wave 6 — full grades 7-9 and OGE

### Deliverables

- broader algebra and geometry coverage;

- priority textbook editions;

- OGE framework version;

- practice tests and blueprints;

- geometry and open-response rubrics;

- specialist review flows;

- performance and AI-cost optimization;

- content operations capacity.

 

### Exit gate

Product-market-fit evidence and sustainable content quality.

 

## Wave 7 — school beta

### Deliverables

- organization and class tenancy;

- roster import and invitations;

- teacher assignment builder;

- online assessment delivery;

- PDF variants, keys and answer sheets;

- OMR prototype;

- manual review queue;

- class analytics;

- school audit and license model.

 

### Exit gate

Design-partner renewal, teacher-time reduction and security approval.

 

## Wave 8 — controlled expansion ages 3-18

Expansion sequence:

 

1. mathematics grades 5-6 and 10-11;

2. EGE mathematics;

3. Russian language;

4. primary mathematics, Russian and reading;

5. informatics, physics, chemistry and biology;

6. English and additional languages with pronunciation and controlled voice;

7. preschool ages 3-6 with separate voice-first UX;

8. advanced, olympiad, career-guidance and regional products;

9. high-load service extraction only when scale criteria are met.

 

Every expansion requires a separate PRD, curriculum package, gold set, safety review, operations plan, unit-economics model and business gate.

 

## Cross-wave technical backlog

### Platform

- identity hardening;

- feature flags;

- audit search;

- data export and deletion;

- localization framework;

- billing abstraction;

- support administration.

 

### Learning

- mastery calibration;

- planner optimization;

- review scheduling;

- explanation personalization;

- teacher-confirmed evidence.

 

### AI, math and media

- more problem types;

- handwriting support;

- geometry diagrams;

- speech normalization expansion;

- provider routing;

- local models where justified;

- evaluation automation;

- retention and deletion verification.

 

### Operations

- cost attribution;

- SLOs;

- backup and disaster recovery;

- incident exercises;

- school deployment support;

- media and queue capacity planning.

 

## Task format for Codex

Every task should include:

 

- goal;

- active wave;

- in-scope and out-of-scope;

- files or modules owned;

- acceptance criteria;

- required tests;

- security, media and data considerations;

- expected artifacts;

- review checkpoint.