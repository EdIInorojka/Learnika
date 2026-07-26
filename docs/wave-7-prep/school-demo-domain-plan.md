# Synthetic school demo domain plan

## Domain intent

The domain plan describes the smallest school-shaped vocabulary needed for a
future demo. It is not a Prisma schema, API contract or runtime design.
Physical persistence and public interfaces require separately approved slices.

## Synthetic school context

The demo context contains the following conceptual entities:

| Entity | Demo purpose | Boundary |
| --- | --- | --- |
| `SchoolOrganization` | Customer-level school grouping | Synthetic organization only |
| `School` | Institution boundary | One synthetic school per scenario |
| `AcademicYear` | Time and curriculum context | Synthetic year label |
| `SchoolClass` | Grade 7–9 learning group | Synthetic class code |
| `Enrollment` | Student membership in a class | Synthetic membership only |
| `Teacher` | Teacher or curator role | Synthetic role label |
| `ParentLink` | Optional parent relationship | Synthetic link; no family data |
| `TeacherAssignment` | Teacher permission for subject/period | Future authorization input |
| `Assessment` | Teacher-defined assignment | Future builder input |
| `Delivery` | Online or print administration | Future delivery configuration |
| `ClassAnalyticsSummary` | Aggregate class skill view | No identifying learner detail |
| `ImportPreview` | CSV/XLSX validation result | Preview only; no persistence |
| `PrintVariant` | Equivalent PDF variant plan | Synthetic assessment only |
| `AnswerSheet` | Printable response form plan | No learner response data |
| `OMRReviewCase` | Ambiguity queue concept | Future prototype only |

The terms `Assessment`, `Delivery`, `AnswerSheet` and `OMRReviewCase` follow
the future-gate concepts in the architecture domain model. Their presence here
does not implement assessment, answer checking, scoring or review.

## Relationships and authorization

The intended relationship chain is:

`SchoolOrganization → School → AcademicYear → SchoolClass → Enrollment`.

`TeacherAssignment` grants a future teacher or curator capability within one
school class, subject and period. It must never be inferred from a family
relationship. A future implementation must check organization, school, class,
role and assignment scope on every school query and must test both positive and
cross-tenant denial cases.

`ParentLink` is a narrowly scoped conceptual link for a future demo. It does
not import a family subscription, parent account, child profile, homework
history or consent record. Any shared view between school and family contexts
requires a separately approved authorization and privacy design.

## Import and print flows

CSV/XLSX is the planned first exchange boundary:

1. accept a synthetic fixture;
2. parse into a preview;
3. validate columns, grade/class labels and duplicate rows;
4. show only bounded, non-identifying error categories;
5. reject or clear the preview unless a later slice explicitly authorizes
   persistence.

Electronic-journal integrations are deferred. Each future connector requires
separate approval, documented consent/legal basis, field minimization,
residency, deletion and incident handling.

PDF planning covers equivalent variants, answer sheets, answer keys and
rubrics for synthetic assessments. OMR and manual review remain future
prototypes with explicit teacher confirmation and ambiguity handling.

## Synthetic examples

Examples may use values such as:

- organization: `DEMO_ORG_001`;
- school: `DEMO_SCHOOL_001`;
- academic year: `DEMO_YEAR_2026`;
- class: `DEMO_CLASS_7A`;
- role: `SYNTHETIC_TEACHER`;
- aggregate count: `studentCount: 0`.

These values are placeholders only. Do not add names, emails, phone numbers,
personal identifiers, account IDs, storage keys, URLs or real learner records.

## Cross-cutting metadata

Any future sensitive entity must define its owner module, tenant scope, privacy
class, retention/deletion rule, audit requirement, versioning, authorization
and idempotency needs. This plan records no actual retention schedule, audit
event, identity binding or storage object.
