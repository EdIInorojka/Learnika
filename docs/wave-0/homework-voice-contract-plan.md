# Wave 0 homework and voice contract plan

## Sources

- `docs/architecture/api-contracts.md`
- `docs/ai/homework-helper.md`
- `docs/product/voice-input.md`
- `docs/architecture/adr/ADR-004-voice-input-pipeline.md`
- `docs/data/analytics-events.md`

## Scope

This is a contract plan only. It does not create OpenAPI files, generated clients, endpoints, workers, database schemas, or provider integrations.

## Homework state plan

Planned state flow from `docs/ai/homework-helper.md`:

```text
CREATED
  -> UPLOADING
  -> PROCESSING
  -> TASK_CONFIRMATION
  -> ATTEMPT_REQUIRED
  -> VALIDATING
  -> HINT_AVAILABLE
  -> COMPLETED_ASSISTED
  -> TRANSFER_REQUIRED
  -> COMPLETED_TRANSFER
```

Safe terminal or side states:

- `UNSUPPORTED`
- `ESCALATED`
- `FAILED`

## Voice state plan

Planned state flow:

```text
CREATED
  -> UPLOADING
  -> UPLOADED
  -> QUEUED
  -> PROCESSING
  -> REVIEW_REQUIRED
  -> CONFIRMED
  -> DELETED
```

Safe terminal or side states:

- `FAILED`
- `CANCELLED`
- `DELETED`

Invariant: only confirmed text may enter homework or learning flows.

## API plan

The endpoint groups in `docs/architecture/api-contracts.md` remain the source of truth.

Wave 0 contract drafting should cover:

- homework upload creation;
- asset upload completion;
- task candidate confirmation;
- attempt creation;
- step validation;
- hint request;
- source completion;
- transfer retrieval and answer;
- voice session create;
- voice upload complete;
- voice status/review retrieval;
- voice transcript confirmation;
- voice cancellation/deletion.

Production OpenAPI schemas: `NOT YET COLLECTED`.

## Schema requirements

Every future schema must include:

- schema version;
- request id;
- idempotency key where retryable;
- actor and tenant context enforced by API;
- policy version;
- provider/model metadata when applicable;
- confidence or uncertainty field where meaningful;
- refusal or unsupported state;
- localized child-facing copy separated from internal error codes.

## Event contract plan

Event taxonomy source of truth: `docs/data/analytics-events.md`.

Wave 0 event families:

- homework funnel;
- voice funnel;
- learning evidence;
- parent report;
- quality and safety.

Event schemas must declare:

- event version;
- owner;
- allowed properties;
- forbidden properties;
- data class;
- retention category;
- privacy review status.

Concrete event schemas are `NOT YET COLLECTED`.

## Event-to-data-class examples

| Event family | Allowed data | Forbidden data |
|---|---|---|
| Homework funnel | problem type, skill id, confidence bucket, hint level, error category, latency bucket | task text, answer text, raw image, signed URL |
| Voice funnel | purpose, duration bucket, MIME category, confidence bucket, edit-distance bucket, error category | raw audio, raw transcript, confirmed transcript body |
| Learning evidence | skill id, correctness, assistance level, policy version | full solution text, private chat body |
| Quality and safety | error category, provider version, policy version | child name, contact, raw content |

## Contract evidence

- OpenAPI draft: `NOT YET COLLECTED`.
- JSON schemas for math-AI normalize/validate/hint intents: `NOT YET COLLECTED`.
- Event schema files: `NOT YET COLLECTED`.
- Generated clients: `NOT YET COLLECTED`.
- Contract tests: `NOT YET COLLECTED`.

