# Wave 0 analytics and educational metrics plan

## Sources

- `docs/product/vision.md`
- `docs/product/mvp.md`
- `docs/reference/research-findings.md`
- `docs/data/analytics-events.md`
- `docs/security/privacy-and-data.md`

## Analytics principles

- Measure independent learning progress, not screen time.
- Keep assisted completion separate from transfer evidence.
- Use pseudonymous identifiers.
- Exclude raw text, transcript, image, audio, contacts, names, signed URLs, and answer content.
- Treat unsupported or escalated sessions as safety outcomes, not only funnel failures.

## North-star metric

Source: `docs/product/vision.md`.

Metric: percentage of supported sessions followed by a correctly solved transfer problem without a higher hint level.

Baseline value: `NOT YET COLLECTED`.

## Metric dictionary plan

| Metric | Definition status | Baseline |
|---|---:|---|
| Activation | Needs numerator, denominator, exclusions, owner | NOT YET COLLECTED |
| Supported-session completion | Needs exact eligibility rules | NOT YET COLLECTED |
| Transfer success after support | Needs transfer scoring threshold | NOT YET COLLECTED |
| Return within 7 days | Needs cohort definition | NOT YET COLLECTED |
| Three sessions within 14 days | Needs cohort definition | NOT YET COLLECTED |
| Voice repeated use | Needs voice eligibility denominator | NOT YET COLLECTED |
| Transcript correction rate | Needs edit-distance bucket definition | NOT YET COLLECTED |
| Fallback-to-text rate | Needs fallback reason taxonomy | NOT YET COLLECTED |
| Parent report action rate | Needs action definition | NOT YET COLLECTED |
| AI/OCR/STT cost per completed session | Needs provider cost model | NOT YET COLLECTED |

## Privacy and reporting controls

Required before implementation:

- event-to-data-class mapping;
- allowed property list per event;
- forbidden property scanner;
- cohort suppression rule;
- dashboard privacy review checklist;
- metric owner;
- reporting cadence.

All items above are `NOT YET COLLECTED`.

## Evidence boundaries

Current research is directional and limited. The following must not be claimed as validated:

- educational effectiveness: `NOT YET COLLECTED`;
- voice demand: `NOT YET COLLECTED`;
- willingness to pay from behavior: `NOT YET COLLECTED`;
- repeated use: `NOT YET COLLECTED`;
- provider cost baseline: `NOT YET COLLECTED`;
- provider performance baseline: `NOT YET COLLECTED`;
- parent report comprehension: `NOT YET COLLECTED`.

## Experiment governance

Experiments involving children or learning interventions require:

- product owner;
- privacy review;
- educational hypothesis;
- no manipulation or fear-based messaging;
- no optimization for screen time;
- clear stop condition;
- small-cohort privacy controls.

Detailed experiment policy: `NOT YET COLLECTED`.

