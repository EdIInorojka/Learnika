# Canonical skill graph contract

## Status

This is the Wave 3 Slice 1 planning contract for canonical grade 7-9
mathematics skills. It is not a database schema, API schema, content package or
runtime diagnostic implementation.

## Contract goals

The canonical skill graph must:

- give diagnostics, homework, transfer and plans a shared skill reference;
- stay independent of textbook editions and section order;
- support Russian MVP mathematics for grades 7-9;
- allow selected prerequisite skills without expanding the learner audience;
- make prerequisite relationships explicit and conservative;
- keep every skill ID stable, readable and versionable;
- avoid copyrighted textbook copying, task answers, worked solutions and hints;
- keep uncertain curriculum mappings visible as open decisions.

## Skill ID format

Canonical skill IDs use lowercase ASCII tokens:

```text
math.<strand>.<topic>[.<subtopic>...].v<major>
```

Validation pattern for the first contract draft:

```text
^math\.(number|algebra|functions|geometry|data)\.[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*\.v[1-9][0-9]*$
```

Rules:

- `math` is the subject namespace for the current MVP.
- `strand` is one of `number`, `algebra`, `functions`, `geometry` or `data`.
- topic tokens are stable English engineering identifiers, not textbook titles.
- Russian display names are metadata, not part of the ID.
- grade is metadata, not part of the ID, because textbook sequencing can vary.
- textbook edition, chapter, page and exercise numbers are never part of the ID.
- `v<major>` changes only when the meaning or boundary of the skill changes.
- small metadata edits use the curriculum package version, not a new skill ID.
- deprecated IDs remain resolvable through migration notes.

Examples:

```text
math.algebra.linear-equation-one-variable.v1
math.algebra.quadratic-equation-basic.v1
math.functions.linear-function.v1
math.geometry.triangle-congruence.v1
math.number.rational-number-operations.v1
```

## Skill node fields

A future persisted skill node should contain at least:

| Field | Meaning |
|---|---|
| `id` | Stable canonical skill ID. |
| `status` | Draft, reviewed, active, deprecated or retired. |
| `strand` | High-level mathematics strand. |
| `titleRu` | Reviewed learner-facing or methodologist-facing Russian title. |
| `titleEn` | Optional engineering title. |
| `gradeRange` | Intended MVP grade range, usually within 7-9. |
| `description` | Original high-level definition, not copied textbook text. |
| `covers` | Included concepts and operations at a high level. |
| `excludes` | Out-of-scope variants and unsupported cases. |
| `prerequisites` | Explicit conservative prerequisite skill IDs. |
| `evidenceUse` | Allowed evidence sources, such as diagnostic, homework or transfer. |
| `safetyNotes` | Answer-leak, uncertainty or unsupported-case constraints. |
| `review` | Curriculum, QA and safety approval metadata. |

No field may contain a copied exercise, final answer, worked source solution,
provider prompt, provider completion, raw OCR text, raw transcript body or raw
homework media.

## High-level topic coverage

This table defines coverage families for planning. It is not an exhaustive leaf
skill list and does not settle exact grade placement for every Russian textbook.

| Strand | Coverage family | Candidate parent ID |
|---|---|---|
| Number | Integer operations, signs and order of operations used by grade 7-9 topics | `math.number.integer-operations.v1` |
| Number | Rational numbers, fractions, decimals and proportional reasoning | `math.number.rational-number-operations.v1` |
| Number | Percent, ratio and simple applied quantities | `math.number.percent-ratio.v1` |
| Algebra | Algebraic notation, substitution and expression value | `math.algebra.expression-value.v1` |
| Algebra | Equivalent transformations, brackets and like terms | `math.algebra.expression-transformations.v1` |
| Algebra | One-variable linear equations | `math.algebra.linear-equation-one-variable.v1` |
| Algebra | Systems of two linear equations | `math.algebra.linear-equation-systems.v1` |
| Algebra | Powers, roots and grade-appropriate exponent rules | `math.algebra.powers-and-roots.v1` |
| Algebra | Polynomials, basic operations and factorization | `math.algebra.polynomials-and-factorization.v1` |
| Algebra | Algebraic fractions and rational transformations | `math.algebra.algebraic-fractions.v1` |
| Algebra | Basic quadratic equations and related transformations | `math.algebra.quadratic-equation-basic.v1` |
| Algebra | Basic inequalities and interval reasoning | `math.algebra.inequalities-basic.v1` |
| Functions | Coordinate plane, tables and graphs | `math.functions.coordinate-plane-graphs.v1` |
| Functions | Linear function and slope/intercept reasoning | `math.functions.linear-function.v1` |
| Functions | Inverse proportion and simple nonlinear graphs | `math.functions.inverse-proportion.v1` |
| Functions | Quadratic function at an introductory level | `math.functions.quadratic-function.v1` |
| Geometry | Points, lines, rays, segments, angles and measurement | `math.geometry.basic-objects-angles.v1` |
| Geometry | Triangle properties and triangle inequality | `math.geometry.triangle-properties.v1` |
| Geometry | Triangle congruence and proof scaffolds | `math.geometry.triangle-congruence.v1` |
| Geometry | Parallel lines, transversals and angle relations | `math.geometry.parallel-lines.v1` |
| Geometry | Quadrilaterals and their properties | `math.geometry.quadrilaterals.v1` |
| Geometry | Area, perimeter and Pythagorean theorem calculations | `math.geometry.area-pythagorean.v1` |
| Geometry | Similarity, ratios and proportional segments | `math.geometry.similarity-ratios.v1` |
| Geometry | Circles, arcs, chords and angle relations | `math.geometry.circle-relations.v1` |
| Geometry | Vectors and coordinate geometry basics | `math.geometry.vectors-coordinates.v1` |
| Geometry | Right-triangle trigonometry basics | `math.geometry.right-triangle-trigonometry.v1` |
| Data | Descriptive statistics, probability and combinatorial basics | `math.data.probability-statistics-basic.v1` |

Exact topic sequencing, grade assignment and textbook section mapping are open
decisions until reviewed against priority Russian curricula and rights-cleared
materials.

## Prerequisite relationship rules

Use prerequisite edges only when all conditions are true:

- the source skill is measurably needed for independent work on the target;
- the dependency is conceptually stable across common textbook sequences;
- omitting it would create a likely false interpretation of the learner gap;
- the prerequisite is narrow enough to practice or diagnose;
- the edge has curriculum review evidence or is explicitly marked draft.

Do not create prerequisite edges from:

- textbook order alone;
- co-occurrence in one exercise;
- vague topic similarity;
- a single learner error;
- unsupported OCR/STT/LLM classification;
- an unreviewed generated explanation.

Relationship types:

| Type | Use |
|---|---|
| `PREREQUISITE_OF` | Required or strongly blocking dependency. |
| `PART_OF` | Parent and child topic grouping. |
| `RELATED_TO` | Useful connection that should not block planning. |
| `COMMON_CONFUSION_WITH` | Frequent confusion for review and content design. |
| `SUPPORTS_EXAM_OBJECTIVE` | Later OGE or assessment objective mapping. |

Prerequisite edges must be acyclic within one published curriculum package.
When a dependency is useful but not blocking, use `RELATED_TO` instead of
`PREREQUISITE_OF`.

## Evidence use in diagnostics and homework

Diagnostic and homework evidence may reference a skill only when the evidence is
bounded and reviewed:

- diagnostic items are original or rights-cleared;
- homework task recognition is learner-confirmed before educational use;
- learner attempt text is typed or confirmed from OCR/STT before use;
- supported deterministic validators record validator and policy versions;
- unsupported work records uncertainty, not correctness;
- assisted homework evidence is separate from independent transfer evidence;
- mastery policy consumes repeated evidence, not one answer.

Skill IDs may be stored as low-sensitivity references. They must not carry
homework text, answer text, transcript bodies, image contents, prompts or
provider payloads.

## Safety constraints

The skill graph cannot be used to:

- reveal a source final answer;
- reveal a full worked solution;
- generate hints before an attempt gate;
- claim correctness for unsupported mathematics;
- bypass learner confirmation of OCR/STT output;
- let an LLM override deterministic validation;
- update mastery from a single event;
- infer sensitive traits from text, image or voice input;
- copy protected textbook exercises or explanations without recorded rights.

Low-confidence, ambiguous or controversial skill classification must produce a
review state, confirmation request or open decision.

## Deferred from this contract

Deferred until later approved slices:

- persisted curriculum tables or Prisma migrations;
- API, OpenAPI or package contract schemas;
- exact leaf skill inventory;
- exact Russian display names for every skill;
- textbook edition catalog and mappings;
- diagnostic item blueprints and gold sets;
- mastery evidence weights and calibration thresholds;
- supported deterministic validator list;
- hint ladders and meaningful-attempt rubrics by problem family;
- transfer problem templates;
- OGE objective mapping;
- analytics event schemas.
