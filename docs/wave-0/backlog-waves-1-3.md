# Prioritized backlog for Waves 1-3

## Scope rule

This backlog is planning only. It does not approve starting Wave 1.

## Wave 1 foundation backlog

Priority 0:

- Create pnpm/Turborepo monorepo only after explicit Wave 1 approval.
- Create web, API, and math-AI shells.
- Create Docker Compose local environment.
- Add PostgreSQL, Redis, BullMQ, and private object storage for local development.
- Add deterministic OCR, STT, and LLM mocks.
- Implement adult registration, family, child, consent, role, tenant authorization, and audit baseline.
- Add tenant isolation tests.
- Create `.env.example` with safe defaults.
- Make target runbook commands real.

Priority 1:

- Seed textbook catalog metadata.
- Add OpenAPI and generated-contract workflow.
- Add observability baseline.
- Add secret and dependency scanning.
- Add onboarding E2E.

## Wave 2 homework and web voice backlog

Priority 0:

- Implement controlled homework upload after media policy is approved.
- Implement task confirmation and supported-problem normalization.
- Implement initial deterministic linear-equation validation.
- Enforce answer-leak guard and attempt-before-hint policy.
- Implement transfer problem flow.
- Implement voice session state machine.
- Implement foreground browser recording up to 60 seconds.
- Implement editable transcript confirmation.
- Implement temporary audio cleanup worker.
- Add image, math, voice, and answer-leak gold suites.

Priority 1:

- Add one approved recognition adapter after provider evidence is collected.
- Add mathematical speech normalization evaluation.
- Add quality, cost, latency, and deletion-compliance instrumentation.
- Add escalation for uncertainty and unsupported cases.

Blocked before production Wave 2 activation:

- provider policy evidence: `NOT YET COLLECTED`;
- exact media retention durations: `NOT YET COLLECTED`;
- answer-leak threshold: `NOT YET COLLECTED`;
- math accuracy threshold: `NOT YET COLLECTED`;
- speech correction-rate and latency thresholds: `NOT YET COLLECTED`.

## Wave 3 diagnostic and weekly plan backlog

Priority 0:

- Create seed skill graph.
- Create original diagnostic.
- Implement mastery model that does not update from one answer.
- Implement school, restorative, and target tracks.
- Implement weekly plan and spaced review.
- Implement parent report.
- Add analytics and experiment governance.

Priority 1:

- Add first textbook mapping workflow.
- Add content review and publication metadata.
- Add transfer and report-comprehension evidence collection.

Blocked before Wave 3 activation:

- seed graph evidence and review: `NOT YET COLLECTED`;
- textbook priority list and rights evidence: `NOT YET COLLECTED`;
- mastery calibration evidence: `NOT YET COLLECTED`;
- parent report comprehension evidence: `NOT YET COLLECTED`.

