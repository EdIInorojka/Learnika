# Pre-Wave 7 / Slice 7 — school demo presentation flow

This note documents how to present the synthetic school demo locally. It is a
demo aid only. It does not start real Wave 7, approve a school beta, create
mutations, authorize production records or name a real school.

## Local run path

Use the normal local stack and deterministic synthetic seed before opening the
demo surface:

```powershell
pnpm.cmd run infra:validate
pnpm.cmd run db:migrate:deploy
pnpm.cmd run db:seed
pnpm.cmd run dev:api
pnpm.cmd run dev:web
```

Then open `/school-demo`. The class drilldown links point to
`/school-demo/classes/[classCode]` for the seeded grade 7–9 synthetic classes.

## What to show

Use the page as a short guided route:

1. overview — organization, school and academic year context;
2. classes — grade 7–9 class list and drilldown entry points;
3. teacher assignments — synthetic teacher roles and subject groups;
4. license/entitlements — planned read-only school-demo capabilities;
5. class drilldown — roster-style synthetic student codes and assignments for
   one class.

The theme toggle may be used during the walkthrough to switch between the
light SaaS base and dark graphite analytics mode from the Slice 6 reference
direction.

## Synthetic and non-production boundary

All displayed values must remain synthetic demo codes. The presentation must
not include real school names, real people, contacts, addresses, personal
identifiers, production learner records, family links, payments, grades,
answers, solutions, hints, copied textbook content or provider payloads.

Green validation and a successful walkthrough are consistency evidence only.
They do not change diagnostic readiness, school beta status, production data
authorization or the Wave 7 business/design-partner gates.
