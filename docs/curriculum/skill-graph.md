# Skill graph and mastery model

 

## Purpose

Represent knowledge independently of any one textbook, course or exam and identify prerequisite causes of errors.

 

## Skill-node requirements

A skill node must be:

 

- measurable;

- narrow enough for targeted practice;

- understandable to methodologists and engineers;

- connected to prerequisite and dependent skills;

- versioned;

- associated with examples, common errors and mastery criteria.

 

Example:

 

```yaml

id: math.algebra.linear-equation.one-variable.v1

title: Solve a linear equation in one variable

gradeRange: [7, 9]

prerequisites:

  - math.number.negative-operations.v1

  - math.algebra.distributive-property.v1

  - math.algebra.equivalent-transformations.v1

masteryEvidence:

  minIndependentItems: 3

  minTransferItems: 1

  maxRecentErrorRate: 0.2

```

 

## Edge types

- `PREREQUISITE_OF`;

- `PART_OF`;

- `RELATED_TO`;

- `COMMON_CONFUSION_WITH`;

- `SUPPORTS_EXAM_OBJECTIVE`.

 

## Evidence types

- diagnostic response;

- assisted homework step;

- independent exercise;

- transfer problem;

- review item;

- teacher-confirmed assessment;

- manually reviewed open response.

 

Evidence has:

 

- timestamp;

- independence level;

- hint level;

- difficulty;

- content version;

- validator version;

- correctness and error type;

- confidence;

- context: school, restorative or target.

 

## Mastery rules

 

### Principles

- do not update mastery from one answer alone;

- recent independent and transfer evidence is stronger than assisted evidence;

- repeated hints indicate support need but do not equal failure;

- old evidence decays in influence;

- contradictory evidence increases uncertainty;

- model versions are recorded and recalculable.

 

### Initial state labels

For UI only:

 

- unknown;

- needs foundation;

- developing;

- mostly independent;

- mastered for current level;

- review due.

 

Internal representation should preserve a numeric probability or score plus uncertainty.

 

## Planner behavior

The weekly plan blends:

 

- school-track items around the current textbook section;

- restorative prerequisites with the highest blocking impact;

- target items for tests or OGE;

- spaced review of previously mastered skills.

 

Constraints:

 

- age-appropriate weekly load;

- limited number of context switches;

- prerequisite order;

- upcoming school deadlines;

- learner fatigue and unfinished items;

- no drastic reroute from one response.

 

## Curriculum versioning

A published curriculum package contains:

 

- skill nodes and edges;

- mastery policy version;

- mappings to standards and exams;

- textbook mapping versions;

- content versions;

- migration notes;

- gold evaluation references.

 

Historical attempts remain linked to the version used at the time.