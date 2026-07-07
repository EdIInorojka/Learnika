# Wave 0 QA and evaluation gate

## Sources

- `docs/testing/test-strategy.md`
- `docs/runbooks/release-checklist.md`
- `docs/ai/ai-safety-policy.md`
- `docs/ai/homework-helper.md`
- `docs/security/threat-model.md`

## Gate posture

Wave 0 defines the QA and evaluation gate. It does not create test suites, dependencies, fixtures, or production code.

## Required future quality layers

Source of truth: `docs/testing/test-strategy.md`.

- static checks;
- unit tests;
- integration tests;
- contract tests;
- E2E tests;
- AI and educational evaluations;
- voice and media tests;
- security tests;
- performance tests.

## Mandatory release blockers

Future implementation releases are blocked by:

- tenant-isolation failure;
- answer leakage above threshold;
- severe math regression above threshold;
- unsupported cases classified overconfidently;
- voice confirmation bypass;
- temporary audio deletion not proven;
- raw transcript/audio in logs or analytics;
- missing provider policy;
- missing independent review.

## Threshold register

| Threshold | Status |
|---|---|
| Answer-leak rate | NOT YET COLLECTED |
| Severe math-error rate | NOT YET COLLECTED |
| Supported math validation accuracy | NOT YET COLLECTED |
| Unsupported overconfidence rate | NOT YET COLLECTED |
| Speech transcription confidence threshold | NOT YET COLLECTED |
| Transcript correction-rate threshold | NOT YET COLLECTED |
| Voice latency threshold | NOT YET COLLECTED |
| Temporary media deletion compliance | NOT YET COLLECTED |
| Cost per completed session | NOT YET COLLECTED |

## Gold-set plan

Gold sets must be synthetic, original, or rights-cleared.

Required future gold sets:

- math validation;
- problem normalization;
- hint safety;
- answer leakage;
- prompt injection;
- transfer equivalence;
- Russian mathematical speech transcription;
- mathematical speech normalization;
- age-appropriate language;
- unsupported and low-confidence handling.

Gold sets are `NOT YET COLLECTED`.

## Deterministic mocks

Future implementation must include deterministic mocks for:

- OCR;
- Speech-to-Text;
- LLM;
- math validation;
- provider timeout and error states;
- low-confidence recognition and transcription.

Mock fixture plan: `NOT YET COLLECTED`.

## Security negative-test matrix

Future implementation must cover:

- cross-family denial;
- child denied parent billing and consent;
- unassigned mentor denial;
- cross-organization denial;
- school denied unrelated family data;
- unauthorized voice session denial;
- expired signed URL denial;
- deleted audio inaccessible;
- support access requires reason and audit.

Concrete tests: `NOT YET COLLECTED`.

## Documentation validation for Wave 0

Available Wave 0 validations are repository/documentation checks only:

- `git status --short`
- `git diff --check`
- `rg --files`
- placeholder check for project-name markers
- duplicate domain heading check for `Asset`
- forbidden Wave 1 scaffold check
- `docs/INDEX.md` link target check

Results are reported in the Wave 0 gate response.
