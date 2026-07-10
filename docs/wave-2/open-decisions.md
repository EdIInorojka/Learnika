# Wave 2 open decisions

## Status

This register lists decisions that remain unresolved at the planning gate. It
does not authorize implementation, provider activation or beta use with real
child data.

## Decision register

| Decision | Current state | Evidence needed | Owner | Blocks |
|---|---|---|---|---|
| OCR provider choice | Not selected | Residency, retention, training setting, subprocessors, deletion mechanism, accuracy on synthetic/rights-cleared fixtures, latency, cost, fallback behavior and security review | ai-vision-math, security-privacy | Real OCR provider activation and beta OCR |
| Speech-to-Text provider choice | Not selected | Russian math speech quality, confidence behavior, retention, no-training setting, deletion mechanism, latency, cost, subprocessors, fallback and privacy review | voice-media, security-privacy | Real STT provider activation and beta voice |
| LLM provider choice | Not selected | Structured output reliability, no-training setting, residency, retention, deletion, safety evaluation, cost limits, provider kill switch and privacy review | ai-vision-math, security-privacy | Real LLM-backed hints or classification |
| Media retention policy | Exact durations not approved | Legal basis, data category schedule, operational need, deletion SLA, backup behavior and support-access policy | security-privacy, devops-sre | Real child media beta and cleanup closure |
| Raw audio retention policy | Exact duration not approved | Voice-specific legal review, troubleshooting need, deletion SLA, provider deletion behavior and monitoring plan | voice-media, security-privacy | Real voice beta |
| Exact homework UX | Not finalized | Mobile-first prototype, learner usability evidence for no-answer help, attempt-before-hint comprehension and low-confidence confirmation | student-parent-ux, product-program | Student-facing homework UI release |
| Exact voice UX | Not finalized | Prototype for permission, recording state, stop/cancel, transcript editing, uncertainty highlighting, typed fallback and 360 px accessibility | voice-media, student-parent-ux | Browser voice UI release |
| Legal consent wording | Placeholder only | Qualified legal review for child learning data, homework media, voice processing, transcript confirmation, retention and withdrawal | security-privacy, product-program | Processing real child data in beta |
| Textbook rights | Not collected | Priority edition list, rights metadata, permitted use, restrictions, expiry and content review workflow | content-platform, curriculum-knowledge, security-privacy | Any copied or stored protected textbook content |
| Safety evaluation thresholds | Not approved | Numeric thresholds for answer leakage, severe math error, supported validation accuracy, unsupported overconfidence, voice correction rate, latency and deletion compliance | qa-evaluation, curriculum-knowledge, ai-vision-math, voice-media | Wave 2 closure and beta readiness |
| Initial math whitelist | Wave 0 proposal exists | Curriculum review of included/excluded forms, synthetic gold set, validator plan and unsupported handling | curriculum-knowledge, ai-vision-math | Deterministic math validation slice |
| Meaningful attempt rubric | Not finalized | Rubric by problem family and hint level, examples, validation criteria and learner UX copy | curriculum-knowledge, student-parent-ux | Hint-policy implementation |
| Transfer problem policy | Not finalized | Reviewed transfer templates, difference rules, deterministic checks and evidence weighting | curriculum-knowledge, learning-engine | Transfer flow implementation |
| Provider environment naming | Planning pattern only | Final env inventory, `.env.example` updates, disabled defaults, secret ownership and kill-switch behavior | devops-sre, backend-platform | Provider-boundary implementation |
| Cost and abuse limits | Not approved | Upload, OCR, STT and LLM rate/concurrency/cost thresholds with alert and kill-switch owner | devops-sre, data-analytics | Provider-backed slices and beta |
| Support access model for media | Not approved | Reason codes, approval path, time limit, audit event fields and review cadence | security-privacy, operations | Human review of raw media or transcripts |
| Analytics event schemas | Taxonomy exists, schemas absent | Versioned event schemas with allowlisted properties, PII checks and small-cohort policy | data-analytics, security-privacy | Product analytics implementation |
| Escalation policy | Product rule exists, details absent | Reasons, priority, routing, specialist access, audit and learner/parent copy | product-program, security-privacy | Human-review flow |
| Production deployment and region | Not selected | Hosting target, data residency, secret manager, backup/restore and monitoring plan | devops-sre, security-privacy | Public beta deployment |

## Decisions that should not block mock-first coding

The following can remain unresolved for early mock-only slices if each slice
keeps real providers and real child data disabled:

- final provider choice;
- production provider credentials;
- production cost baseline;
- exact commercial beta retention durations;
- production deployment region.

These still block any slice that sends real child data to a real provider or
claims beta readiness.

## Decisions that should block first coding slice

The first Wave 2 coding slice should not start until:

- this planning gate is approved;
- local validation is green or a pre-existing environment failure is resolved;
- the initial coding slice has explicit approval;
- the slice states whether it is documentation-only, schema-only, mock-only or
  user-facing;
- tenant, retention, logging and answer-leak test expectations are defined for
  the slice.
