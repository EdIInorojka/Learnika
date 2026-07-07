# Wave 0 context map and dependency graph

## Sources

- `docs/architecture/system-overview.md`
- `docs/architecture/domain-model.md`
- `docs/architecture/api-contracts.md`
- `docs/architecture/adr/ADR-001-modular-monolith.md`
- `docs/architecture/adr/ADR-002-python-math-ai-service.md`
- `docs/architecture/adr/ADR-003-multi-tenancy.md`
- `docs/architecture/adr/ADR-004-voice-input-pipeline.md`

## Context map

| Context | Current status | Owns | Must not own |
|---|---:|---|---|
| Identity and sessions | Wave 1 foundation | Adult and child authentication, sessions, role assignments | Learning decisions, provider calls |
| Family and consent | Wave 1 foundation | Family tenant, child profile, parent-child link, consent records | School organization data outside explicit relationship |
| Curriculum and textbooks | Wave 1 foundation, Wave 3 expansion | Skill graph, textbook catalog, mappings, school pace metadata | Copied textbook content without rights |
| Homework orchestration | Wave 2 | Upload workflow, task confirmation, attempts, hints, transfer handoff | Deterministic math internals, provider auth |
| Voice sessions and media jobs | Wave 2 | VoiceInputSession lifecycle, signed upload orchestration, transcript confirmation, deletion scheduling | Learning assistant decisions before confirmation |
| Learning evidence and planning | Wave 3 | Evidence, mastery state, weekly plan, review schedule | Mastery update from one answer |
| Reports | Wave 3 | Parent summaries and recommendations | Raw transcripts, raw homework bodies, unnecessary private content |
| Escalation and specialist review | MVP and later | Human-review cases with minimized context | Broad unassigned learner access |
| Audit and administration | Wave 1 foundation | Sensitive access records, policy version traces | Ordinary analytics payloads |
| Math-AI service | Wave 2 separate runtime | Problem normalization, deterministic validation, speech normalization support, structured hint intent | Authorization, billing, direct mastery writes |
| Analytics | Wave 1+ instrumentation | PII-safe event taxonomy and metrics | Raw text, images, audio, contacts, signed URLs |
| School organization | Future gate | Organization, class, teacher assignment, roster, assessment | Family subscription and private homework by default |

## Dependency graph

Documentation-only approved direction:

```text
Browser web client
  -> Core API modular monolith
       -> identity / family / consent
       -> curriculum / textbooks
       -> homework orchestration
       -> voice session orchestration
       -> attempts / evidence / reports
       -> audit / administration
       -> PostgreSQL
       -> Redis / BullMQ
       -> private S3-compatible storage
       -> Python math-AI service
            -> deterministic math validation
            -> media preprocessing helpers
            -> OCR / STT / LLM adapters behind provider policy
       -> analytics event pipeline
```

## Allowed boundary directions

- Browser calls the core API only.
- Browser receives signed upload targets, never storage credentials.
- Core API owns authorization and tenant checks.
- Core API calls math-AI through strict versioned contracts.
- Math-AI never directly accesses the database.
- Math-AI never writes mastery state.
- Raw audio never enters the learning assistant; only confirmed text may enter learning flows.
- Analytics receives allowlisted event properties only.

## Forbidden dependency directions

- Math-AI directly querying PostgreSQL.
- Provider adapters deciding authorization.
- Analytics storing raw homework, raw transcript, image, audio, contacts, signed URLs, or answer text.
- School context automatically reading family homework or subscription data.
- Student mode receiving the original final answer or full source solution.
- Future native mobile, school, or high-load infrastructure driving Wave 0 or Wave 1 implementation without a gate.

## Approved monorepo structure

The planned structure remains documentation-only until Wave 1:

```text
apps/
  web/
  api/
  mobile/              # future Wave 4
  content-studio/      # later
  school/              # future school gate
services/
  math-ai/
  learning-engine/     # later extraction candidate
packages/
  contracts/
  domain/
  curriculum/
  content-schema/
  ui/
  analytics/
  test-fixtures/
infra/
  docker/
  migrations/
  observability/
docs/
```

None of these folders are created in Wave 0.

## Architecture boundary decisions

- Keep the core API as a modular monolith.
- Keep Python math-AI as a separate runtime boundary because of SymPy/media tooling.
- Keep family and future school tenancy explicit.
- Keep learning evidence separate from assisted source completion and transfer.
- Keep voice asynchronous and confirmation-based.
- Revisit extraction only after independent scale, security, language, or lifecycle evidence is collected.

Extraction evidence: `NOT YET COLLECTED`.

