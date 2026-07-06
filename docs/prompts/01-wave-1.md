# Codex prompt — Wave 1

 

Read `AGENTS.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/architecture/technology-stack.md` and approved Wave 0 artifacts.

 

Implement only Wave 1: technical and account foundation.

 

Required outcomes:

 

- initialize pnpm and Turborepo monorepo;

- create Next.js web, NestJS API and Python math-AI service shells;

- configure PostgreSQL, Prisma, Redis, BullMQ and S3-compatible local storage;

- provide Docker Compose and one-command bootstrap;

- implement adult development registration and sessions;

- implement family, child profile and consent records;

- implement grade, textbook seed and learning-context selection;

- enforce role and tenant authorization;

- add audit logging for sensitive actions;

- add OpenAPI and shared contracts;

- configure formatting, lint, typecheck, unit, integration and E2E;

- configure structured PII-safe logs, Sentry hooks and basic OpenTelemetry;

- add deterministic OCR, Speech-to-Text and LLM mocks;

- add generic media asset and retention foundations without learner voice UI;

- update runbooks and README.

 

Do not implement homework recognition, voice recording, diagnostics, billing, mobile or school features.

 

Acceptance criteria:

 

- fresh clone starts with documented commands;

- onboarding E2E passes;

- parent A cannot access child B;

- child cannot access adult functions;

- migrations can be recreated from zero;

- object storage is private and signed upload can be tested with synthetic media;

- no production secret is needed for local tests;

- independent reviewer approves.

 

Show exact commands and real test output. Do not claim success without evidence.