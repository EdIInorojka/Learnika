# Wave 0 data, authorization, and privacy inventory

## Sources

- `docs/security/privacy-and-data.md`
- `docs/security/threat-model.md`
- `docs/architecture/domain-model.md`
- `docs/architecture/api-contracts.md`
- `docs/architecture/adr/ADR-003-multi-tenancy.md`
- `docs/product/business-rules.md`
- `docs/product/voice-input.md`

## Role model

| Role | Current status | Scope | Notes |
|---|---:|---|---|
| Parent or legal representative | MVP | Family | Controls consent, child recovery, payments, reports |
| Child learner | MVP | Own child profile within family | Cannot access payment, consent, or adult admin |
| Mentor or teacher | MVP limited support | Assigned learner or class | Access requires assignment and audit |
| Administrator | MVP internal | Platform | Sensitive access requires least privilege and audit |
| School administrator | Future gate | Organization | No implementation before school gate |
| Teacher in school mode | Future gate | Organization/class | No family data by default |

## Authorization model

Every future endpoint must document:

- actor role;
- tenant scope;
- resource owner;
- relationship requirement;
- purpose;
- audit behavior;
- rate and cost limits.

Baseline policy:

- default deny;
- tenant context required;
- family-scoped access cannot cross families;
- organization-scoped access cannot cross organizations;
- school relationship does not imply family homework access;
- support access requires reason and audit.

Concrete endpoint authorization matrix: `NOT YET COLLECTED`.

## Tenant boundaries

### Family tenant

The family is the current B2C tenant. It owns child profiles, parent-child links, consents, homework sessions, learning evidence, reports, and subscription references.

### Future school tenant

Organization, class, enrollment, teacher assignment, roster, and assessment data remain future-gated. A school relationship does not automatically expose private family homework, subscription, or report data.

School-family sharing policy: `NOT YET COLLECTED`.

## PII and sensitive-data inventory

| Data category | Class | Examples | Retention status | Ordinary logs/analytics |
|---|---:|---|---|---|
| Public content | 0 | Public help and marketing content | Policy-defined | Allowed if non-personal |
| Internal non-personal telemetry | 1 | Aggregated counts, technical status | Policy-defined | Allowed |
| Adult account personal data | 2 | Contact, auth, billing reference | Exact duration `NOT YET COLLECTED` | Forbidden except internal IDs/status |
| Child learning data | 3 | Grade, textbook, goals, attempts, confirmed transcripts, mastery, plans, reports | Exact duration `NOT YET COLLECTED` | Raw bodies forbidden |
| Temporary child media | 4 | Homework images, PDFs, handwriting crops, raw audio | Exact duration `NOT YET COLLECTED` | Forbidden |
| Sensitive operational data | 5 | Consent evidence, audit records, provider request IDs, school rosters | Exact duration `NOT YET COLLECTED` | Restricted status only |
| Secrets | 6 | Keys, tokens, signing credentials | Exact rotation policy `NOT YET COLLECTED` | Always forbidden |

## Voice-specific inventory

| Field | Class | Rule |
|---|---:|---|
| Raw audio object | 4 | Temporary, private storage, deleted by retention deadline |
| Raw transcript before confirmation | 4 or restricted review state | Not ordinary analytics/log data |
| Normalized text proposal | 4 or restricted review state | Not authoritative until learner confirms |
| Confirmed transcript | 3 | May enter learning record if needed |
| Provider metadata | 5 | Store provider, model/version, policy version, confidence where available |
| Duration, size, confidence buckets | 1 or 3 depending context | Allowed in analytics only as allowlisted buckets |

Exact voice retention duration and cleanup SLA: `NOT YET COLLECTED`.

## Required authorization tests

Future implementation must include negative tests for:

- parent A cannot access child B;
- child cannot access parent billing or consent;
- mentor cannot access unassigned learner;
- teacher cannot access another organization or class;
- school admin cannot access unrelated family data;
- learner cannot access another voice session or audio object;
- expired signed URL fails;
- deleted audio is inaccessible;
- support access requires reason and audit.

Concrete test suite status: `NOT YET COLLECTED`.

## Support access policy

Support access to raw homework media or raw audio requires:

- documented reason;
- time-bound access;
- least privilege;
- audit event;
- review of necessity;
- no copying to ordinary logs, analytics, or tickets.

Detailed approval path and reason-code list: `NOT YET COLLECTED`.

## Legal and privacy evidence

- Legal basis for processing child learning data in Russia: `NOT YET COLLECTED`.
- Consent wording for child homework media: `NOT YET COLLECTED`.
- Consent wording for voice processing: `NOT YET COLLECTED`.
- Data processing register: `NOT YET COLLECTED`.
- Provider data-processing terms: `NOT YET COLLECTED`.

