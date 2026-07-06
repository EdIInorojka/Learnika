# Analytics event taxonomy

 

## Principles

- events represent durable product facts;

- names use past tense or completed action;

- schemas are versioned;

- properties are allowlisted;

- no raw text, transcript, image, audio, names, contacts or signed URLs;

- child and tenant IDs are pseudonymous;

- quality, cost and learning metrics can be joined through internal identifiers.

 

## Common properties

- event version;

- occurred at;

- user role;

- pseudonymous user ID;

- pseudonymous child ID when applicable;

- family or organization context ID;

- grade;

- subject;

- platform;

- application version;

- experiment assignments;

- trace or session identifier;

- locale;

- acquisition cohort.

 

## Acquisition and activation

- `landing_viewed`;

- `registration_started`;

- `adult_registered`;

- `child_profile_created`;

- `consent_recorded`;

- `textbook_selected`;

- `first_task_started`;

- `first_value_reached`.

 

## Homework funnel

- `homework_session_created`;

- `homework_upload_started`;

- `homework_upload_completed`;

- `homework_processing_started`;

- `homework_task_candidate_created`;

- `homework_task_confirmed`;

- `homework_attempt_submitted`;

- `homework_step_validated`;

- `homework_hint_requested`;

- `homework_hint_shown`;

- `homework_source_completed`;

- `transfer_problem_started`;

- `transfer_problem_completed`;

- `homework_session_unsupported`;

- `homework_session_escalated`;

- `homework_session_failed`.

 

Allowed properties include problem type, skill IDs, confidence bucket, hint level, error category, latency bucket, input-mode category and cost bucket. Do not include task or answer text.

 

## Voice funnel

- `voice_permission_requested`;

- `voice_permission_granted`;

- `voice_permission_denied`;

- `voice_recording_started`;

- `voice_recording_cancelled`;

- `voice_recording_completed`;

- `voice_upload_started`;

- `voice_upload_completed`;

- `voice_upload_failed`;

- `voice_transcription_queued`;

- `voice_transcription_started`;

- `voice_transcription_completed`;

- `voice_transcription_failed`;

- `voice_low_confidence_detected`;

- `voice_transcript_viewed`;

- `voice_transcript_edited`;

- `voice_transcript_confirmed`;

- `voice_fallback_to_text`;

- `voice_audio_deletion_scheduled`;

- `voice_audio_deleted`;

- `voice_audio_deletion_failed`.

 

Allowed voice properties:

 

- purpose;

- duration bucket;

- MIME type category;

- processing latency bucket;

- confidence bucket;

- edited yes or no;

- edit-distance bucket;

- fallback reason;

- provider version;

- error category;

- deletion delay bucket.

 

## Learning plan

- `diagnostic_started`;

- `diagnostic_completed`;

- `mastery_evidence_recorded`;

- `weekly_plan_generated`;

- `plan_item_started`;

- `plan_item_completed`;

- `review_scheduled`;

- `review_completed`;

- `weekly_goal_completed`.

 

## Parent and mentor

- `parent_report_generated`;

- `parent_report_viewed`;

- `recommendation_viewed`;

- `escalation_created`;

- `escalation_assigned`;

- `escalation_resolved`;

- `consultation_booked`.

 

## Commercial

- `trial_started`;

- `paywall_viewed`;

- `checkout_started`;

- `subscription_activated`;

- `subscription_renewed`;

- `subscription_cancelled`;

- `payment_failed`;

- `usage_limit_reached`.

 

## Quality and safety

- `recognition_low_confidence`;

- `math_validation_ambiguous`;

- `answer_leak_blocked`;

- `unsafe_input_blocked`;

- `provider_fallback_used`;

- `authorization_denied`;

- `manual_review_required`;

- `retention_cleanup_failed`.

 

## Core metrics

### Activation

Percentage of eligible learners who complete the first supported homework session.

 

### Learning north star

Percentage of supported sessions followed by a correctly solved transfer problem without a higher hint level.

 

### Retention

Weekly and monthly returning learners by acquisition and grade cohort.

 

### Voice value

Repeated voice use, transcript correction rate, fallback-to-text rate, incremental session completion and transfer versus comparable typed sessions.

 

### Parent value

Report view and recommendation action rate.

 

### Economics

Revenue and gross profit by cohort, AI, OCR and Speech-to-Text cost per completed session, specialist cost and support cost.

 

## Event governance

- schema changes reviewed by data and privacy owners;

- breaking changes increment version;

- event dictionary generated from code;

- automated tests forbid known PII and content-body fields;

- dashboards state metric definition and exclusions.