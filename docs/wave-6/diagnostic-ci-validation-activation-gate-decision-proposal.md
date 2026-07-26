# Diagnostic CI and deterministic validation activation gate decision proposal

## Status and boundary

This Wave 6 / Slice 12 artifact is a static, non-production governance
proposal. It records unresolved decisions for a future CI and deterministic
validation activation gate; it does not activate a gate, change the workflow,
execute a validator, create release evidence or authorize diagnostic review.

The frozen baseline remains:

- readiness: `NOT_READY`;
- blockers: exactly `INCOMPLETE_COVERAGE` and `NON_PRODUCTION_FIXTURES`;
- activation: `BLOCKED`;
- review workflow: `INACTIVE`;
- satisfied prerequisites: `0`;
- `ci_and_deterministic_validation`: `UNSATISFIED_DEFERRED`;
- production approvals, evidence, identities and lifecycle records: `0`.

No `.github/workflows/ci.yml` change is part of this slice. The workflow path
is an observed dependency only.

## Contract chain

The proposal is downstream of the Wave 5 CI activation-gate placeholder and
the readiness/rollback contract chain. The references are consistency pins,
not approval or execution evidence:

1. Wave 5 / Slice 2 activation prerequisites;
2. Wave 5 / Slice 10 production approval authority;
3. Wave 5 / Slice 11 coverage gap closure;
4. Wave 5 / Slice 12 readiness integration;
5. Wave 5 / Slice 13 rollback and withdrawal;
6. Wave 5 / Slice 14 CI and deterministic validation placeholder;
7. Wave 6 / Slice 11 rollback-withdrawal decision proposal.

Every dependency remains unresolved, deferred, inactive or unsatisfied.

## Decision areas

The following requirements remain `UNRESOLVED_DEFERRED` and are not approved:

- final CI job graph and dependency order;
- deterministic validator ownership and synthetic-fixture policy;
- governance consistency plus no-answer/no-scoring and privacy rule versions;
- runtime, API, OpenAPI and web change-review routing;
- migration and schema-drift policy;
- Docker/infrastructure failure classification;
- rerun limits, flakiness ownership and reproducibility vectors;
- independent manual approval handoff and activation sequencing.

The proposal also keeps disabled placeholders for the machine-readable
artifact schema, synthetic fixtures, negative authorization cases,
reproducibility vectors, retention tests and independent release evidence.
Each future item requires explicit versioning, deterministic results,
failure classification and evidence ownership before any activation review.

## Future gate expectations

A later approved implementation must define closed-world artifact schemas,
exact upstream pins, negative authorization cases, no-answer/no-scoring and
privacy scans, runtime/interface and schema-drift boundaries, infrastructure
expectations, rerun/reproducibility handling and independent release
evidence. A green CI run, an empty evidence set or a workflow mutation must
never be treated as approval.

The future gate must fail closed on stale, missing, conflicting, withdrawn or
unverifiable inputs; out-of-scope files; unknown fields; safety/privacy
violations; schema or migration drift; unavailable infrastructure; and
non-reproducible results. Manual authority and sequencing remain separate
decisions.

## Non-goals

This slice does not:

- modify `.github/workflows/ci.yml`;
- run or record CI jobs, validators, retries, retention tests or approvals;
- satisfy a prerequisite or change readiness/activation;
- create candidates, evidence, digests, identities, assignments or release
  records;
- add runtime, API, OpenAPI, Prisma, migration, database, web or dependency
  behavior.

## Open decision

`W5-OD-CI-ACTIVATION-GATE` remains unresolved. This proposal only makes its
future decision surface explicit and machine-validatable.
