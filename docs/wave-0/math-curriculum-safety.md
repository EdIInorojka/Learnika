# Wave 0 math, curriculum, and homework safety

## Sources

- `docs/curriculum/skill-graph.md`
- `docs/curriculum/textbook-mapping.md`
- `docs/curriculum/content-quality.md`
- `docs/ai/homework-helper.md`
- `docs/ai/ai-safety-policy.md`
- `docs/product/mvp.md`
- `docs/product/business-rules.md`

## Curriculum approach

Learnika uses a canonical skill graph independent of textbook editions. Textbooks map to skills through reviewed metadata, not copied protected content.

Key decisions:

- Skill nodes are versioned, measurable, and connected to prerequisites.
- Textbook mappings are versioned and reviewed.
- Changing a textbook does not erase mastery history.
- Transfer evidence is separate from assisted homework evidence.
- Mastery must not change from a single answer.

Seed skill graph with actual nodes and edges: `NOT YET COLLECTED`.

Priority textbook edition list and rights metadata: `NOT YET COLLECTED`.

## Initial supported mathematics problem whitelist

This Wave 0 whitelist is for later contract and evaluation planning only. It does not create production support.

Initial deterministic-support whitelist:

| Problem family | Included forms | Excluded forms |
|---|---|---|
| One-variable linear equations | Equations reducible to `a*x + b = c` or `a*(x + b) = c`, with integer or rational constants | Parameters, absolute values, inequalities, systems, word-problem interpretation |
| Equivalent transformations for linear equations | Add/subtract same expression, multiply/divide by non-zero constant, distribute, collect like terms | Transformations requiring unsupported strategy detection |
| Arithmetic prerequisites in context | Integer operations, fractions, signs, simple rational simplification needed for the above | Open-ended simplification, arbitrary rational expressions |

Candidate later families from `docs/product/mvp.md` remain future backlog until reviewed:

- systems of two linear equations;
- broader rational transformations;
- powers and roots;
- basic quadratic equations;
- selected structured word problems;
- basic geometry calculations.

Those later candidates require gold sets, validators, thresholds, and curriculum review before implementation.

## Meaningful attempt rule

A meaningful attempt must include learner-provided information relevant to the next solution action, such as:

- an equation transformation;
- a selected rule;
- a short explanation;
- a structured numeric step;
- learner-confirmed text from voice input.

Voice input does not bypass the attempt requirement.

Detailed attempt rubric by problem type and hint level: `NOT YET COLLECTED`.

## Answer-leak prevention policy

Student mode must not expose:

- the original final answer;
- the full source solution;
- a hint that allows simple copying of the source answer;
- raw provider output;
- complete hidden solution models.

Required controls for later implementation:

- source final answer excluded from student response schemas;
- hint state enforcement;
- structured hint intents instead of unrestricted prose;
- reviewed templates or constrained generation;
- answer-leak evaluation suite;
- adversarial tests for direct answer requests and prompt injection.

Answer-leak release threshold: `NOT YET COLLECTED`.

## AI and math validation policy

- Deterministic validation is preferred when supported.
- Unsupported or ambiguous cases are safe outcomes, not failures to hide.
- Python math-AI returns strict schemas and confidence.
- Math-AI never decides authorization or writes mastery.
- Provider, model, schema, policy version, and confidence are stored where available.

Strict schema files and production contracts are not created in Wave 0.

## Evaluation evidence

| Evidence | Status |
|---|---|
| Math validation gold set | NOT YET COLLECTED |
| Hint safety gold set | NOT YET COLLECTED |
| Transfer equivalence gold set | NOT YET COLLECTED |
| Answer-leak adversarial suite | NOT YET COLLECTED |
| Severe math-error threshold | NOT YET COLLECTED |
| Supported validation accuracy threshold | NOT YET COLLECTED |
| Alternative-method policy | NOT YET COLLECTED |

