# Textbook mapping

 

## Goal

Align the learner's school track with the selected textbook while keeping the canonical knowledge profile independent of textbook sequence.

 

## Catalog fields

- subject;

- grade;

- title;

- authors;

- publisher;

- publication year;

- edition or revision;

- level;

- ISBN;

- federal-list status where relevant;

- cover fingerprint for selection assistance;

- rights metadata.

 

## Section model

Store permitted metadata:

 

- chapter and section identifiers;

- title or short reference where legally permitted;

- order;

- page range as reference;

- expected study period;

- mapping to skills and objectives;

- common exercise types.

 

Do not store unauthorized full text, illustrations or copied task banks.

 

## Mapping workflow

1. Methodologist selects an edition.

2. Sections are entered as metadata.

3. Each section is mapped to canonical skills.

4. Mapping indicates introduction, practice, review or assessment role.

5. A second reviewer checks order and completeness.

6. Mapping is published as a version.

7. Telemetry identifies sections with frequent mismatch or confusion.

8. Changes create a new version with migration notes.

 

## Mapping structure example

 

```yaml

mappingVersion: 1.0.0

textbookEditionId: tb_math_8_example_2025

sectionId: chapter_3_section_2

skills:

  - skillId: math.algebra.quadratic-equation.basic.v1

    role: INTRODUCE

    weight: 0.6

  - skillId: math.algebra.factorization.v1

    role: PRACTICE

    weight: 0.4

```

 

## School pace

A parent, learner or teacher may set:

 

- current section;

- planned next sections;

- date of test;

- skipped or delayed topics;

- class-specific notes without copying protected content.

 

The planner prioritizes the pace but may insert prerequisites.

 

## Textbook change

When the learner changes textbook:

 

1. retain the canonical mastery state;

2. activate the new mapping version;

3. calculate section coverage from existing skills;

4. identify only genuinely missing or differently sequenced material;

5. update the school track without resetting history.

 

## Rights rules

- public availability does not imply commercial reuse rights;

- use original platform explanations and exercises;

- store source and license metadata;

- licensed content must have expiry and permitted-use fields;

- remove or disable content when rights expire;

- rights status is part of publication approval.