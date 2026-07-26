# Pre-Wave 7 / Slice 0 — School demo foundation gate

## Decision

`APPROVE PRE-WAVE 7 / SLICE 0 SYNTHETIC DEMO FOUNDATION`.

This gate approves a documentation and planning foundation for a synthetic,
school-shaped demo. It does not start the Wave 7 school beta, create a school
tenant, add a product capability, or authorize any production use.

Real Wave 7 remains `BLOCKED` until both conditions are met:

1. the business gate approves the school-beta problem, pilot economics,
   security and operating model; and
2. named design-partner schools exist outside this repository and are
   approved for the pilot.

No real school, organization, teacher, learner, parent or design partner is
named by this gate.

## Demo target

The future demo is a disposable, synthetic scenario that demonstrates the
shape of a standard Russian-school workflow without representing a real
institution:

- one synthetic organization and one synthetic school;
- one synthetic academic year;
- classes for grades 7, 8 and 9;
- synthetic teacher and class-curator roles;
- synthetic students and optional synthetic parent links;
- a teacher assignment builder using reviewed or explicitly synthetic items;
- online assignment delivery with bounded timing and attempt settings;
- class-level, aggregate skill analytics with no learner-identifying output;
- CSV/XLSX roster-import preview and validation planning;
- PDF assessment variants, answer sheets and answer-key planning;
- OMR and manual-review concepts reserved for later slices.

All identifiers in a demo fixture must be opaque, clearly synthetic and
non-operational (for example, `DEMO_ORG_001` or `DEMO_CLASS_7A`). They are not
candidate IDs, account IDs or references to real people.

## Readiness assumptions for a Russian-school-shaped demo

The planning track assumes, for usability purposes only, that a participating
teacher works with Russian-language mathematics for grades 7–9, academic years,
classes, enrollments, assignments and printable assessment material. It also
assumes CSV/XLSX is a practical first exchange format and that low-bandwidth
print workflows matter.

These are product and UX assumptions, not a statement of legal compliance,
state accreditation, electronic-journal certification, curriculum equivalence
or procurement eligibility. Legal, educational-methodology, accessibility,
security and residency reviews remain separate gates.

## Tenancy boundary

School tenancy is a distinct authorization context from the existing family
tenancy:

- a school relationship does not grant access to family subscriptions,
  private homework history or parent reports;
- family relationships do not grant access to a school roster, class analytics
  or teacher tools;
- any future shared record requires an explicit policy, legal basis, consent
  where applicable and an auditable authorization path;
- demo data must remain synthetic in both contexts, with no cross-tenant joins
  implied by a fixture.

## Gate evidence and fail-closed rule

This document is a planning gate only. Green CI, an empty issue list, a
successful demo walkthrough or a complete synthetic fixture does not satisfy a
Wave 7 prerequisite and does not authorize real school onboarding.

Before a real beta can be considered, a separately approved gate must provide,
at minimum, named design partners, security isolation evidence, teacher
workflow evidence, privacy/legal review, restore readiness, support ownership,
license/entitlement decisions and an independent release review.

Any missing, stale, conflicting or unverifiable gate evidence keeps Wave 7
`BLOCKED`.

## Follow-on boundary

The next implementation slice, if separately authorized, is **Pre-Wave 7 /
Slice 1 — school tenancy schema foundation**. It must begin with a clean git
gate and remain synthetic until the business and design-partner gates are
approved.

The detailed scope, data boundary, domain plan and ten-slice sequence are
documented in the companion files in `docs/wave-7-prep/`.
