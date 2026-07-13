# Wave 2 Slice 22 Implementation Note

## Scope

Slice 22 adds an editable learner confirmation control to successful candidates in the existing
Slice 21 mock OCR panel. It is web UI state only. It adds no route, API request, contract, persistence,
database write, object-storage operation, provider call or dependency.

Low-confidence, failure, invalid, not-ready and unavailable states keep their fixed no-text behavior
and never render the editor or confirmation control.

## Local Edit And Confirmation Boundary

Each successful candidate initializes an in-memory draft from the strictly projected Slice 21 text.
The learner can edit up to the existing 4096-character candidate limit. A blank draft cannot be
confirmed. Any edit or replacement candidate clears a previous confirmation.

Before confirmation, the candidate is visibly labelled as untrusted. Confirmation uses a plain
`type=button` control inside the client component; the editor is not a form and receives no server
action. The confirmed flag and edited draft remain only in React reducer state for the current page
lifetime. The UI states that confirmation is local, is not saved in Learnika, disappears on refresh
and sends no text onward.

Local confirmation does not change the API trust classification and does not override
`downstreamUseAllowed=false`. The existing panel continues to state that downstream transfer is
disabled. There is no attempt submission, learning-assistant input or later-wave handoff.

## Authentication And Data Safety

The Slice 18 protected homework layout and Slice 17 server-only token handling remain unchanged. OCR
candidate acquisition still uses the authenticated Slice 21 server action, but edited or locally
confirmed text never enters that action, a URL, cookie, log, browser storage, API body or database.

The editor receives only Slice 21's allowlisted candidate view. It receives no tenant or media IDs,
storage key, filename, raw media, answer, solution, hint, STT or LLM value, prompt, completion or
provider payload. React escapes displayed text and the component performs no HTML injection.

## Deferred Scope

This slice does not persist confirmed OCR text or confirmation state; submit an attempt; enable
downstream use; call OCR, STT, LLM or another provider; access MinIO or S3; add downloads or signed or
public URLs; add voice UI; or add billing, school, mobile, analytics or deployment behavior.

## Tests And Rollback

Dependency-free tests cover initial untrusted state, learner edits, explicit local confirmation,
confirmation invalidation after edits or candidate replacement, blank and length boundaries,
successful-candidate-only rendering and static absence of server actions, fetch, browser storage,
object storage, persistence and forbidden educational or provider fields.

Rollback removes the local reducer, learner editor, tests and this note, restores the prior web test
script, restores the Slice 21 candidate renderer and removes the Slice 22 style additions. No API,
contract, database, infrastructure or dependency rollback is required.
