# Wave 6 / Slice 3 — предложение решения по владению ролями ревьюеров

## Статус

`PROPOSED_DEFERRED`, static non-production proposal only. Документ не назначает
владельца, не создаёт reviewer или audit identity, не выдаёт authority и не
включает review workflow.

## Границы

Предложение относится только к диагностике математики 7–9 классов (`ru-RU`).
Оно фиксирует формы будущих решений по восьми темам:

1. accountable role ownership;
2. role eligibility, competence and independence;
3. appointment and assignment authority;
4. scope, minimum counts, quorum and decision aggregation;
5. reviewer lifecycle, expiry, suspension and reassignment;
6. delegation, revocation and emergency coverage;
7. policy maintenance and access-review ownership;
8. reviewer and audit identity separation.

Все формы остаются предложениями: active ruleset, assignments, grants,
identities, review decisions и approvals отсутствуют.

## Upstream pins

Артефакт точно закрепляет Wave 5 activation prerequisites, Wave 4 review
authority, Wave 5 candidate identity и canonicalization/digest placeholders,
а также решения Wave 6 / Slice 1 и Slice 2. Upstream-артефакты не изменяются.

## Таксономия

Используются ровно семь taxonomy-only placeholders:

`METHODOLOGY_REVIEWER_PLACEHOLDER`, `SAFETY_REVIEWER_PLACEHOLDER`,
`RIGHTS_REVIEWER_PLACEHOLDER`, `GRADE_PLACEMENT_REVIEWER_PLACEHOLDER`,
`ACCESSIBILITY_REVIEWER_PLACEHOLDER`, `PRODUCTION_APPROVER_PLACEHOLDER`,
`AUDIT_OBSERVER_PLACEHOLDER`.

Это не реальные роли, люди, аккаунты, assignments, permissions или authority.

## Синтетические примеры

Четыре positive vectors показывают только формы taxonomy, eligibility, quorum
и lifecycle. Четыре rejected vectors демонстрируют запрет real owner,
assignment, authority grant и identity. Каждый вектор содержит маркеры
`SYNTHETIC_EXAMPLE_ONLY`, `NOT_A_REAL_ROLE_OWNER`, `NOT_ASSIGNED`,
`NOT_AUTHORIZED`, `NOT_ACTIVE`, `NOT_USABLE_FOR_REVIEW`,
`NOT_USABLE_FOR_PRODUCTION`.

## Состояние продукта

Readiness остаётся `NOT_READY` с blockers `INCOMPLETE_COVERAGE` и
`NON_PRODUCTION_FIXTURES`. Activation остаётся `BLOCKED`, workflow —
`INACTIVE`, satisfied prerequisites — `0/12`, approved candidates — `0`,
production approvals — `0`. Prerequisite `reviewer_role_ownership` остаётся
`UNSATISFIED_DEFERRED` с `UNASSIGNED_OWNER_PLACEHOLDER` и пустыми evidence refs.

## Дальнейший gate

Следующее решение требует отдельного согласования пользователя, независимого
governance/security/QA review и синтетических deterministic evidence. Это
предложение само по себе не удовлетворяет prerequisite и не активирует review.
