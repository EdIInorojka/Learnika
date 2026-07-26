# Synthetic school demo data boundary

## Rule

The school demo is synthetic by construction. It must not ingest, derive or
retain a production learner record. A fixture that cannot be proven synthetic
is rejected and removed from the demo path.

## Allowed synthetic data

The demo may contain only bounded, non-identifying values such as:

- opaque organization, school, class and academic-year demo codes;
- grade values 7, 8 or 9 and synthetic subject labels;
- role labels such as `SYNTHETIC_TEACHER` or `SYNTHETIC_CURATOR`;
- synthetic enrollment state and assignment state;
- aggregate counts, status values and validation categories;
- synthetic assessment configuration and print-variant metadata;
- disposable CSV/XLSX fixtures whose rows use demo codes only.

No field is allowed to look up a person or institution outside the fixture.

## Forbidden data

Do not add:

- real names, school names, emails, phone numbers or addresses;
- government, account, user, employee, student or parent identifiers;
- authentication secrets, tokens, storage keys, signed URLs or provider
  request identifiers;
- real rosters, production learner records, consent evidence or family
  subscription history;
- raw homework images, PDFs, audio, handwriting, submissions or OCR/STT/LLM
  payloads;
- answers, solutions, hints, grading outcomes, mastery or proficiency claims;
- copied textbook content or protected source exercises;
- external electronic-journal identifiers or synchronized records.

Synthetic codes must not be reused as aliases for real data.

## Tenancy and access

School demo data belongs to a synthetic school context. Existing family
tenancy remains separate. A school role cannot read family subscription data or
private homework history, and a family role cannot read school rosters,
assignments or class analytics. There is no implicit join or shared identifier.

Future real-data access would require least privilege, relationship and tenant
checks, privileged access controls, audit events, retention/deletion design,
documented consent or another lawful basis, and independent review.

## Import, retention and deletion

CSV/XLSX is an import-preview format, not a source of truth. A future preview
must validate schema and report bounded categories without exposing row values.
The preview is disposable and must be cleared on rejection, expiry or demo
reset.

Synthetic fixtures have no production retention schedule. Demo reset deletes
all scenario data and leaves no recovery copy. Real retention, deletion,
restriction, export, legal hold and backup propagation require a separate
privacy and operational gate.

## Integrations

Electronic-journal or other school-system integrations are explicitly deferred.
Before any real school data enters Learnika, the responsible parties must
approve purpose limitation, field minimization, consent/legal basis, residency,
security controls, retention, deletion, incident handling and exit procedures.

## Logging and analytics

Logs and analytics may contain only event type, bounded status, duration/size
buckets and aggregate demo counts. They must not contain names, contacts,
school identifiers that resolve outside the fixture, raw text/media,
credentials, URLs or row-level student data.

## Fail-closed boundary

Synthetic validity is a prerequisite for every future demo slice. If a fixture
contains private, production, provider-shaped or otherwise unverifiable data,
the slice must fail closed. A successful demo walkthrough or empty issue list
does not authorize real school onboarding, Wave 7 activation or production
data processing.
