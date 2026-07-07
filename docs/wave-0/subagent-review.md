# Wave 0 focused subagent review

## Summary

All focused lanes were executed read-only before Wave 0 documentation edits. Each lane initially returned `APPROVE WITH FIXES`; none found a blocker for Wave 0 documentation execution.

Wave 0 closure review classified the recorded fixes and evidence gaps in `docs/wave-0/open-decisions-and-evidence.md`. No unresolved item blocks starting the Wave 1 technical foundation, so the final Wave 0 closure verdict is `APPROVE`.

Deferred evidence does not authorize commercial release, school deployment, native mobile, new subjects, new age bands, realtime voice, or any other expansion of product scope.

## Product and scope

Documents reviewed: `AGENTS.md`, `README.md`, `docs/INDEX.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/prompts/00-wave-0.md`, reference and product docs.

Findings:

- Scope is coherent: Russia, Russian, grades 7-9, mathematics.
- Long-term ages 3-18, multiple subjects, mobile, school, and advanced voice remain gated.
- Evidence is directional only.

Missing artifacts:

- usability findings: `NOT YET COLLECTED`;
- pricing validation: `NOT YET COLLECTED`;
- voice demand evidence: `NOT YET COLLECTED`.

Initial verdict: `APPROVE WITH FIXES`. Closure classification: no Wave 1 blocker.

## Architecture and domain model

Documents reviewed: architecture docs, API contracts, ADRs, privacy data-boundary docs.

Findings:

- Modular monolith plus Python math-AI service is coherent.
- Family and future school tenancy are explicit.
- API contracts are conceptual but directionally sound.

Missing artifacts:

- context map;
- dependency graph;
- ownership matrix;
- concrete data-boundary model;
- state machines;
- draft schema files: `NOT YET COLLECTED`.

Initial verdict: `APPROVE WITH FIXES`. Closure classification: no Wave 1 blocker.

## Curriculum, skill graph, and textbook mapping

Documents reviewed: curriculum docs, product scope, MVP, business rules, homework helper, research findings.

Findings:

- Canonical skills are correctly independent from textbooks.
- Textbook mappings are rights-aware.
- Current whitelist is not yet a production contract.

Missing artifacts:

- seed graph: `NOT YET COLLECTED`;
- priority textbook list: `NOT YET COLLECTED`;
- rights evidence: `NOT YET COLLECTED`;
- gold sets: `NOT YET COLLECTED`.

Initial verdict: `APPROVE WITH FIXES`. Closure classification: no Wave 1 blocker.

## AI, mathematics, and homework safety

Documents reviewed: AI docs, homework helper, API contracts, ADR-002, content quality, testing.

Findings:

- No-answer policy, attempt gating, deterministic validation, and safe fallback are aligned.
- Python math-AI boundary is appropriate.
- Whitelist, schemas, thresholds, and gold sets need to become concrete before implementation.

Missing artifacts:

- strict JSON schemas: `NOT YET COLLECTED`;
- answer-leak threshold: `NOT YET COLLECTED`;
- severe math-error threshold: `NOT YET COLLECTED`;
- provider evidence: `NOT YET COLLECTED`.

Initial verdict: `APPROVE WITH FIXES`. Closure classification: no Wave 1 blocker.

## Voice input architecture and privacy

Documents reviewed: voice docs, MVP, business rules, system overview, API contracts, ADR-004, privacy, threat model, analytics, testing.

Findings:

- Voice is optional, foreground-only, and confirmation-based.
- `docs/product/voice-input.md` should be canonical.
- Retention and provider evidence remain open.

Missing artifacts:

- exact raw-audio retention duration: `NOT YET COLLECTED`;
- STT provider terms: `NOT YET COLLECTED`;
- legal/consent wording: `NOT YET COLLECTED`;
- full OpenAPI schemas: `NOT YET COLLECTED`.

Initial verdict: `APPROVE WITH FIXES`. Closure classification: no Wave 1 blocker.

## Student and parent UX

Documents reviewed: product scope, MVP, journeys, voice, research, homework helper, testing.

Findings:

- UX must center independence, task confirmation, attempt-before-hint, transcript confirmation, transfer, and concise parent reporting.
- Prototype planning is in scope; production screens are not.

Missing artifacts:

- clickable prototype: `NOT YET COLLECTED`;
- usability findings: `NOT YET COLLECTED`;
- mobile accessibility evidence: `NOT YET COLLECTED`.

Initial verdict: `APPROVE WITH FIXES`. Closure classification: no Wave 1 blocker.

## Security and personal data

Documents reviewed: privacy, threat model, business rules, voice, domain model, API contracts, ADR-003, ADR-004, analytics, testing.

Findings:

- Data classes and tenant boundaries are sound.
- Voice and analytics privacy rules are strong.
- Production is blocked until legal, provider, retention, and support-access policies are concrete.

Missing artifacts:

- legal basis: `NOT YET COLLECTED`;
- exact retention durations: `NOT YET COLLECTED`;
- provider policy evidence: `NOT YET COLLECTED`;
- authorization matrix: `NOT YET COLLECTED`.

Initial verdict: `APPROVE WITH FIXES`. Closure classification: no Wave 1 blocker.

## Analytics and educational metrics

Documents reviewed: vision, MVP, research, analytics events, homework helper, voice, privacy, testing.

Findings:

- North-star metric is educational transfer, not engagement time.
- Event taxonomy is privacy-aware.
- Metrics need definitions, baselines, and privacy review.

Missing artifacts:

- metric dictionary: `NOT YET COLLECTED`;
- baselines: `NOT YET COLLECTED`;
- cohort suppression rules: `NOT YET COLLECTED`;
- effectiveness evidence: `NOT YET COLLECTED`.

Initial verdict: `APPROVE WITH FIXES`. Closure classification: no Wave 1 blocker.

## QA and evaluation

Documents reviewed: implementation plan, test strategy, AI safety, homework helper, MVP, voice, threat model, release checklist.

Findings:

- Strategy covers static, unit, integration, contract, E2E, AI, voice, security, and performance.
- Release blockers are correctly identified.

Missing artifacts:

- thresholds: `NOT YET COLLECTED`;
- gold datasets: `NOT YET COLLECTED`;
- deterministic mocks: `NOT YET COLLECTED`;
- security negative-test matrix: `NOT YET COLLECTED`.

Initial verdict: `APPROVE WITH FIXES`. Closure classification: no Wave 1 blocker.

## DevOps and delivery

Documents reviewed: README, implementation plan, stack, system overview, runbooks, release checklist, privacy, threat model, testing.

Findings:

- Wave 1 infrastructure is correctly deferred.
- Runbooks are target expectations only.
- Operational evidence is not yet collected.

Missing artifacts:

- real setup commands: `NOT YET COLLECTED`;
- dependency versions: `NOT YET COLLECTED`;
- Docker/CI/env inventory: `NOT YET COLLECTED`;
- monitoring and backup evidence: `NOT YET COLLECTED`.

Initial verdict: `APPROVE WITH FIXES`. Closure classification: no Wave 1 blocker.

## Independent final review

Documents reviewed: user constraints, required docs, implementation plan, Wave 0 prompt, all lane findings.

Findings:

- All required lanes are represented.
- Wave 0 can proceed as documentation-only work.
- The gate is not closed until integrated artifacts and evidence register are reviewed.

Blocking questions:

- None for Wave 0 documentation execution.

Initial verdict: `APPROVE WITH FIXES`. Closure classification: no Wave 1 blocker.

## Closure review

Documents reviewed: `docs/wave-0/gate-checklist.md`, `docs/wave-0/open-decisions-and-evidence.md`, `docs/wave-0/subagent-review.md`, and all existing `APPROVE WITH FIXES` / `NOT YET COLLECTED` records in the Wave 0 artifact set.

Findings:

- No unresolved item blocks starting Wave 1 technical foundation.
- Wave 1 foundation exit requirements are classified under `DEFERRED_TO_RELEVANT_PRODUCT_GATE`.
- Beta, commercial release, B2B school pilot, and future product-gate evidence are classified by target gate.
- Deferred evidence does not authorize commercial release, school deployment, or product-scope expansion.

Final Wave 0 closure verdict: `APPROVE`.
