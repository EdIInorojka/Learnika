# Synthetic school demo slice plan

This sequence is a planning backlog, not authorization to start Wave 7. Every
slice requires its own clean git gate, exact scope, security review and
validation. Synthetic fixtures remain the default until the business and
design-partner gates are approved.

| # | Slice | Intended outcome | Explicit boundary |
| --- | --- | --- | --- |
| 1 | School tenancy schema foundation | Define organization, school, academic year, class and enrollment ownership | No real records, migration or external tenant |
| 2 | Synthetic seed data | Seed disposable grade 7–9 demo roles and classes | No PII, production copy or real school |
| 3 | Teacher role and school auth boundary | Prove teacher/curator scope and family/school separation | No real identity provider or school account |
| 4 | Class roster import preview | Parse synthetic CSV/XLSX and report bounded validation errors | Preview only; no persistence or invitations |
| 5 | Assignment builder MVP | Build a synthetic teacher assignment and variant configuration | No production content, grading or publication |
| 6 | Student assignment delivery | Demonstrate bounded online delivery and attempt/time settings | Synthetic students only; no learner-facing beta |
| 7 | Class analytics MVP | Show aggregate class skill summaries and privacy suppression | No individual profiling or production analytics |
| 8 | PDF/print workflow | Produce synthetic PDF variants, answer sheets and keys | No real submissions, grades or answer checking |
| 9 | OMR/manual review prototype | Explore confidence boundaries and teacher-confirmed review queue | Prototype only; no automatic final result |
| 10 | School demo closure gate | Review demo evidence, risks, support and future beta criteria | Does not approve real Wave 7 |

## Dependencies and exit criteria

Slices 1–3 establish school tenancy and authorization boundaries before any
roster or assignment workflow. Slice 4 must reject unsafe or malformed import
previews before Slice 5 can use them. Slices 5–8 form the synthetic teacher
workflow. Slice 9 is optional research and cannot be a release gate by itself.

Slice 10 may close the synthetic demo foundation only when:

- all synthetic fixtures are disposable and PII-safe;
- family and school tenancy denial cases are documented;
- import, delivery, analytics and print boundaries have negative cases;
- unresolved product, legal, security and support decisions are recorded;
- no real school or design partner is implied.

The closure gate must explicitly keep real Wave 7 `BLOCKED` until business gate
approval and named design partners exist.

## Validation expectations

Future implementation slices must run formatting, linting, typechecking,
tests, relevant builds/contracts, database checks where applicable and
`git diff --check`. Empty issue lists and green validation are consistency
evidence only; they do not satisfy a school-beta gate.
