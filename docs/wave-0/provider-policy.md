# Wave 0 external provider policy

## Sources

- `docs/security/privacy-and-data.md`
- `docs/security/threat-model.md`
- `docs/ai/ai-safety-policy.md`
- `docs/architecture/system-overview.md`
- `docs/architecture/api-contracts.md`
- `docs/product/voice-input.md`

## Provider posture

No production provider is approved in Wave 0.

Provider activation evidence is `NOT YET COLLECTED` for:

- OCR;
- mathematical OCR;
- Speech-to-Text;
- LLM;
- notifications;
- payments;
- analytics;
- storage hosting.

## Activation checklist

Before any provider receives child, homework, voice, or learning data, document:

- purpose;
- data fields sent;
- data residency;
- retention;
- training-use settings;
- subprocessors;
- security controls;
- deletion mechanism;
- provider request identifiers stored by Learnika;
- fallback behavior;
- exit plan;
- rate and cost limits;
- kill switch owner.

All provider-specific items above are currently `NOT YET COLLECTED`.

## Data-minimization rules

- Send only the smallest context needed for the provider task.
- Remove names, contacts, school identifiers, and unrelated image regions where possible.
- Do not send raw audio to the learning LLM in the MVP.
- Send only learner-confirmed text into learning assistant flows.
- Do not allow production providers to train on child data by default.
- Do not expose raw provider output directly to children.

## Provider classes

| Provider class | Wave status | Minimum policy |
|---|---:|---|
| OCR / mathematical OCR | Wave 2 candidate | Sanitized images or extracted regions only; confidence and model metadata required |
| Speech-to-Text | Wave 2 candidate | Temporary raw audio only; no training by default; transcript confirmation required |
| LLM | Wave 2 candidate | Strict schema output; no final answer leakage; no raw audio |
| Notifications | Paid beta or later | Minimized contact data and consent rules |
| Payments | Paid beta or later | External payment references only; no sensitive payment storage |
| Analytics | Wave 1+ | PII-safe events only; no raw text/media |
| Storage hosting | Wave 1+ | Private buckets, generated keys, signed URLs, deletion audit |

## Required evidence register

| Evidence item | Status |
|---|---|
| OCR provider residency and retention terms | NOT YET COLLECTED |
| STT provider residency and retention terms | NOT YET COLLECTED |
| LLM provider training-use setting | NOT YET COLLECTED |
| Provider deletion mechanism | NOT YET COLLECTED |
| Provider subprocessors | NOT YET COLLECTED |
| Provider performance baseline | NOT YET COLLECTED |
| Provider cost baseline | NOT YET COLLECTED |
| Provider outage behavior | NOT YET COLLECTED |
| Legal review of provider terms | NOT YET COLLECTED |

## Safe fallback policy

Provider failure, timeout, invalid schema, low confidence, unsupported content, or unapproved terms must produce a safe user path:

- ask for confirmation;
- request another attempt;
- offer typed fallback;
- mark unsupported;
- create human review when appropriate.

The system must not invent a result to keep the flow moving.

