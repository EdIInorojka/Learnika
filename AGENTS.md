# Project instructions

 

## Mission

Build an evidence-driven educational platform that helps children learn and solve independently. The current production scope is mathematics for grades 7-9 in Russia. The long-term product supports children ages 3-18, parents, mentors, teachers and schools.

 

## Read first

Before changing code, read:

 

1. `docs/INDEX.md`

2. `docs/product/current-scope.md`

3. `docs/product/mvp.md`

4. `docs/product/business-rules.md`

5. `docs/product/voice-input.md`

6. `docs/architecture/system-overview.md`

7. `docs/architecture/technology-stack.md`

8. `docs/security/privacy-and-data.md`

9. the active wave prompt in `docs/prompts/`

 

Read additional domain documents referenced by the task.

 

## Non-negotiables

- Never reveal the full solution or final answer of the original homework problem in student mode.

- Require a meaningful student attempt before advancing to the next hint level.

- Use deterministic mathematical validation whenever the problem type is supported.

- Treat low-confidence recognition, transcription or validation as uncertainty: ask for confirmation, request another attempt or create a human-review case.

- Never copy protected textbook content without documented rights.

- Never log child PII, raw homework images, raw audio or message bodies in ordinary application logs or analytics.

- Every family-, school- or organization-scoped query must have authorization and tenant-isolation tests.

- Every AI output must be schema-validated and store provider, model version, policy version and confidence where available.

- Do not use child data for model training by default.

- Do not implement future roadmap features unless the active wave explicitly enables them.

- Do not create microservices without a measurable reason based on scale, language, security or independent lifecycle.

- Do not change mastery from a single answer.

- Internal gamification must reward learning progress, not screen time.

 

## Voice-input rules

- Voice input is optional and must always have a typed-input fallback.

- Recording starts only after explicit user action and stops manually or at the configured limit.

- Continuous listening and background recording are prohibited in the initial product.

- The recording state and duration must always be visible.

- The learner can cancel a recording at any moment.

- Raw audio is temporary sensitive data.

- A transcript must be shown in editable form before submission.

- Only learner-confirmed text may enter the homework helper or learning assistant.

- Mathematical speech normalization never bypasses learner confirmation.

- Low-confidence fragments are highlighted and never submitted automatically.

- Voice input follows the same no-answer, attempt and hint rules as typed input.

- Microphone denial or transcription failure must not block the learning flow.

- Voice biometrics, emotion recognition and speaker profiling are prohibited.

 

## Current product boundary

Production implementation starts with:

 

- users: parent, child, teacher or mentor, administrator;

- audience: grades 7-9;

- subject: mathematics, including algebra, geometry and selected prerequisite skills;

- key flows: onboarding, textbook selection, diagnostic, learning plan, homework upload, typed or voice question, step validation, hints, transfer problem, parent report and specialist escalation;

- voice scope: short Russian recordings, transcription, mathematical normalization, editable confirmation and temporary audio deletion;

- interfaces: mobile-first student and parent web application, basic teacher and administration tools;

- geography: Russia;

- language: Russian.

 

Everything else remains design-only until activated by a roadmap gate.

 

## Approved engineering direction

- monorepo with pnpm workspaces and Turborepo;

- web application with Next.js, React and strict TypeScript;

- core API as a NestJS modular monolith using Fastify;

- PostgreSQL with Prisma and reviewed SQL migrations;

- Redis and BullMQ for cache, queues, idempotency and rate or cost coordination;

- S3-compatible private object storage with signed URLs;

- Python FastAPI service with Pydantic and SymPy for mathematical and media workflows;

- provider adapters for OCR, Speech-to-Text, LLM, notifications and payments;

- Docker Compose for local development;

- React Native with Expo only after the mobile wave is activated;

- microservices and Kubernetes only after measurable extraction criteria are met.

 

## Engineering workflow

1. Inspect the repository and relevant documentation before editing.

2. State assumptions and a short implementation plan.

3. Respect file ownership and existing contracts.

4. Prefer the smallest vertical slice that proves the requirement.

5. Add or update tests with every behavior change.

6. Run formatting, lint, strict typecheck, unit tests, integration tests and applicable E2E tests.

7. Record architecture decisions in `docs/architecture/adr/`.

8. Update OpenAPI and generated contracts when an API changes.

9. Update analytics, retention and deletion behavior when new data is introduced.

10. Report exact commands, results, changed files, risks and open decisions.

11. Request security, QA and independent review at every release gate.

 

## Definition of done

A task is done only when:

 

- acceptance criteria are met;

- tests are green and evidence is shown;

- authorization and tenant boundaries are covered;

- migrations have an upgrade and rollback or forward-fix plan;

- observability and analytics events are updated without PII;

- user-facing behavior is accessible and checked on mobile viewports;

- AI behavior has deterministic mocks and evaluation coverage;

- temporary media has a tested retention and deletion path;

- documentation reflects the actual implementation;

- no critical security or methodological blocker remains.

 

## Agent collaboration

Use focused subagents when the task benefits from independent expertise. The orchestrator owns integration and final decisions.

 

Suggested roles:

 

- product-program-agent;

- solution-architect-agent;

- curriculum-knowledge-agent;

- content-platform-agent;

- backend-platform-agent;

- learning-engine-agent;

- ai-vision-math-agent;

- voice-media-agent;

- student-parent-ux-agent;

- mobile-agent;

- teacher-school-agent;

- assessment-print-agent;

- data-analytics-agent;

- security-privacy-agent;

- qa-evaluation-agent;

- devops-sre-agent;

- independent-review-agent.

 

Do not allow two agents to edit the same files concurrently. Require each agent to return findings, plan, changed files, test evidence, risks and unresolved decisions.