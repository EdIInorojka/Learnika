# Wave 0 gate checklist

## Gate status

Final Wave 0 closure verdict: `APPROVE`.

No unresolved item blocks starting the Wave 1 technical foundation. Deferred evidence does not authorize commercial release, school deployment, native mobile, new subjects, new age bands, realtime voice, or any other expansion of product scope.

## Scope checks

| Check | Status |
|---|---:|
| Active wave is Wave 0 | PASS |
| Wave 1 not started | PASS |
| No production application code created | PASS |
| Approved product scope unchanged | PASS |
| Future roadmap remains gated | PASS |
| Evidence gaps marked `NOT YET COLLECTED` | PASS |

## Deliverable checks

| Deliverable | File |
|---|---|
| Repository and documentation audit | `docs/wave-0/repository-audit.md` |
| Finalized scope and non-goals | `docs/product/current-scope.md`, `docs/wave-0/repository-audit.md` |
| Prototype plan | `docs/wave-0/prototype-plan.md` |
| Learner usability findings | External evidence: `NOT YET COLLECTED` |
| Domain context map | `docs/wave-0/context-map-and-dependencies.md` |
| Dependency graph | `docs/wave-0/context-map-and-dependencies.md` |
| Approved monorepo structure | `docs/wave-0/context-map-and-dependencies.md` |
| Architecture boundaries | `docs/wave-0/context-map-and-dependencies.md` |
| Role and authorization model | `docs/wave-0/data-auth-privacy-inventory.md` |
| Family and future school tenant boundaries | `docs/wave-0/data-auth-privacy-inventory.md` |
| PII and sensitive-data inventory | `docs/wave-0/data-auth-privacy-inventory.md` |
| External provider policy | `docs/wave-0/provider-policy.md` |
| Initial supported math whitelist | `docs/wave-0/math-curriculum-safety.md` |
| Curriculum and textbook mapping approach | `docs/wave-0/math-curriculum-safety.md` |
| AI and answer-leak policy | `docs/wave-0/math-curriculum-safety.md` |
| Voice lifecycle and retention policy | `docs/wave-0/homework-voice-contract-plan.md`, `docs/product/voice-input.md` |
| API and event contract plan | `docs/wave-0/homework-voice-contract-plan.md` |
| Analytics event plan | `docs/wave-0/analytics-metrics-plan.md`, `docs/data/analytics-events.md` |
| Testing and evaluation strategy | `docs/wave-0/qa-evaluation-gate.md` |
| Threat model | `docs/security/threat-model.md`, `docs/wave-0/data-auth-privacy-inventory.md` |
| Local development and release expectations | `docs/wave-0/delivery-expectations.md` |
| File ownership matrix | `docs/wave-0/ownership-matrix.md` |
| Prioritized backlog Waves 1-3 | `docs/wave-0/backlog-waves-1-3.md` |
| Open decisions and external evidence | `docs/wave-0/open-decisions-and-evidence.md` |
| Subagent review | `docs/wave-0/subagent-review.md` |

## Independent review requirements

Independent review must confirm:

- all required lanes are represented;
- all unavailable evidence is marked `NOT YET COLLECTED`;
- no Wave 1 scaffold exists;
- voice canonical source is clear;
- duplicate domain entities are resolved;
- future product scope remains gated;
- final verdict is one of `APPROVE`, `APPROVE WITH FIXES`, or `BLOCK`.

## Closure classification

Master classification file: `docs/wave-0/open-decisions-and-evidence.md`.

- `BLOCKS_WAVE_1`: none after closure review.
- `DEFERRED_TO_RELEVANT_PRODUCT_GATE`: Wave 1 foundation exit items and future product-gate items.
- `REQUIRED_BEFORE_BETA`: legal, privacy, provider, retention, usability, gold-set, threshold, analytics, support, incident, deployment and observability evidence needed before beta with real users or real providers.
- `REQUIRED_BEFORE_COMMERCIAL_RELEASE`: demand, payment, retention, educational effectiveness, unit economics, mastery calibration, OGE alignment, backup deletion and commercial reliability evidence.
- `REQUIRED_BEFORE_B2B_SCHOOL_PILOT`: school-family sharing, roster tenancy, teacher access, audit, procurement, data policy and security review.

Deferred evidence does not authorize commercial release, school deployment, or expansion of product scope.
