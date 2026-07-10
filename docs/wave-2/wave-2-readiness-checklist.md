# Wave 2 readiness checklist

## Status

This checklist must be satisfied before the first Wave 2 coding slice starts.
It is not an implementation checklist for the whole wave and does not approve
real provider use or beta launch.

## Gate approval

- [ ] Wave 0 closure remains `APPROVE`.
- [ ] Wave 1 closure remains `APPROVE`.
- [ ] GitHub Actions CI remains passing after the Prisma client generation
      hotfix.
- [ ] Wave 2 planning documents are reviewed.
- [ ] User explicitly approves starting the first Wave 2 coding slice.
- [ ] The first slice has a named objective, owner, files/modules in scope,
      acceptance criteria, tests and rollback or block conditions.

## Local foundation health

- [ ] `git status --short` is clean before the coding slice starts.
- [ ] `node --version` reports Node.js 24.x.
- [ ] `pnpm.cmd --version` reports `11.7.0`.
- [ ] Docker and Docker Compose are available for local infrastructure checks.
- [ ] `pnpm.cmd run contracts:check` passes.
- [ ] `pnpm.cmd run contracts:validate` passes.
- [ ] `pnpm.cmd run db:validate` passes.
- [ ] `pnpm.cmd run validate` passes.
- [ ] Any sandbox-only validation issue is rerun outside the sandbox and
      documented.

## Scope controls

- [ ] The first coding slice does not implement future roadmap scope.
- [ ] Billing, subscription, school, teacher/admin, mobile, deployment and
      production analytics remain out of scope.
- [ ] No real OCR, Speech-to-Text or LLM provider is enabled.
- [ ] No real provider secret is required.
- [ ] No copyrighted textbook content is copied into fixtures, prompts or
      documentation without recorded rights.
- [ ] The slice uses synthetic, original or rights-cleared test data only.

## Security and privacy prerequisites

- [ ] Tenant and family ownership rules are identified for every new resource.
- [ ] Authorization negative tests are planned before exposing any route.
- [ ] PII class, retention fields and deletion behavior are identified for every
      new data category.
- [ ] Ordinary logs and analytics forbid raw homework text, transcript bodies,
      images, audio, signed URLs, names, contacts, school identifiers and
      secrets.
- [ ] Audit behavior is defined for sensitive media, voice and authorization
      actions introduced by the slice.
- [ ] Support access to raw media remains disabled unless a reviewed support
      policy exists.

## Learning safety prerequisites

- [ ] Student-mode schemas exclude the original final answer and full source
      solution.
- [ ] The meaningful-attempt rule is defined for the slice.
- [ ] Hint progression cannot advance without a new meaningful attempt.
- [ ] Deterministic validation is used for supported math and uncertainty is a
      safe state.
- [ ] Unsupported or low-confidence content has confirmation, retry,
      unsupported or escalation behavior.
- [ ] Answer-leak tests are planned before any hint or validation response is
      student-facing.

## Voice prerequisites

- [ ] Voice remains optional and typed fallback remains available.
- [ ] Recording can start only after explicit foreground user action.
- [ ] Recording state, duration, stop and cancel are part of the approved UX
      before browser recording is built.
- [ ] Transcript review is editable and requires explicit confirmation.
- [ ] Low-confidence fragments are highlighted and never submitted
      automatically.
- [ ] Raw audio has retention, deletion and audit behavior before real voice
      beta use.
- [ ] Voice biometrics, emotion recognition, speaker profiling, realtime voice
      dialogue and background recording remain prohibited.

## Provider prerequisites

- [ ] Mock provider strategy is approved for the slice.
- [ ] Default local and CI configuration cannot make external provider calls.
- [ ] Provider output schemas and failure states are defined before use.
- [ ] Provider metadata fields are defined where applicable.
- [ ] Kill-switch and disabled-by-default behavior are defined before real
      provider activation.
- [ ] Real provider activation evidence is collected before any real provider
      receives child, homework, voice or learning data.

## Review prerequisites

- [ ] Product-program review confirms the slice matches Wave 2 scope.
- [ ] Security-privacy review confirms data, logging, retention and provider
      boundaries.
- [ ] Curriculum or AI/math review confirms supported problem scope where math
      behavior is involved.
- [ ] QA-evaluation review confirms tests and thresholds for the slice.
- [ ] Independent review is scheduled for Wave 2 closure and any high-risk
      interim gate.
