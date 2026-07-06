# Voice Input

## 1. Purpose

Voice input provides students with a faster and more accessible
alternative to typing.

Voice input is an input interface, not an independent tutor.

The function converts a student's speech into editable text.
The confirmed text is then passed to the relevant learning flow.

Voice input must not provide a ready-made answer or weaken
the educational restrictions of the platform.

## 2. Target users

The initial target audience is students in grades 7–9 studying
mathematics.

Voice input may later be extended to:

- younger students;
- preschool users;
- students preparing for exams;
- foreign-language learning;
- accessibility scenarios;
- teacher workflows.

## 3. MVP use cases

A student can use voice input to:

- ask a question about a task;
- explain which part of the task is unclear;
- dictate an intermediate solution step;
- respond to a tutor prompt;
- add a comment to uploaded homework;
- search for a mathematical topic;
- explain their reasoning before receiving a hint.

## 4. Example scenarios

### 4.1 Question about a task

Student says:

> I do not understand why the sign changes when the term
> is moved to the other side of the equation.

The application:

1. Records the voice message.
2. Converts speech to text.
3. Shows the transcript.
4. Allows the student to edit it.
5. Receives confirmation.
6. Sends the confirmed text to the learning assistant.
7. Returns a hint rather than a complete solution.

### 4.2 Intermediate solution step

Student says:

> First I multiplied both sides of the equation by six.

The application uses the statement as a student attempt
and evaluates whether the reasoning is appropriate.

### 4.3 Comment on uploaded homework

Student uploads a task image and says:

> I understand the first part, but I do not know how
> to begin the second part.

The transcript is attached to the homework session.

## 5. Recording rules

- Recording starts only after explicit user action.
- Recording stops manually or when the time limit is reached.
- The MVP recording limit is 60 seconds.
- No background recording is allowed.
- No continuous microphone access is allowed.
- A visible recording indicator is required.
- A cancel action must always be available.
- The user must see the current recording duration.
- The user must receive a clear error if microphone access is denied.
- Text input must always remain available.

## 6. Processing pipeline

1. The student starts recording.
2. The client records an audio fragment.
3. The client validates duration and file type.
4. The backend creates a VoiceInputSession.
5. The client uploads audio through a signed temporary URL.
6. The client reports that the upload is complete.
7. The backend creates a transcription job.
8. A worker validates and transcodes the audio when required.
9. The Speech-to-Text adapter sends the audio to the selected provider.
10. The provider returns a transcript and confidence information.
11. The Math Speech Normalizer processes mathematical phrases.
12. The application displays the resulting text.
13. Uncertain fragments are highlighted.
14. The student edits or confirms the transcript.
15. Only confirmed text is submitted to the educational flow.
16. The raw audio is deleted according to the retention policy.

## 7. Mathematical speech normalization

The system may normalize common Russian mathematical phrases.

Examples:

- "икс в квадрате" → `x²`
- "два икс" → `2x`
- "икс в третьей степени" → `x³`
- "корень из девяти" → `√9`
- "одна вторая" → `1/2`
- "три четвертых" → `3/4`
- "открываем скобку" → `(`
- "закрываем скобку" → `)`
- "не равно" → `≠`
- "больше или равно" → `≥`
- "меньше или равно" → `≤`
- "модуль икс" → `|x|`
- "пять икс минус три равно семь" → `5x − 3 = 7`

Normalization must never bypass user confirmation.

## 8. Confidence handling

### High confidence

The application displays the transcript for confirmation.

### Medium confidence

The application displays the transcript and highlights uncertain fragments.

### Low confidence

The application asks the student to:

- repeat the recording;
- edit the transcript manually;
- switch to typed input.

Low-confidence text must not be automatically submitted.

## 9. Transcript confirmation

Before submission, the student must see:

- original transcript;
- normalized mathematical text;
- highlighted uncertain fragments;
- edit action;
- confirm action;
- cancel action.

The confirmed text becomes the authoritative user input.

## 10. Privacy

- Raw audio is temporary by default.
- Audio is stored only for the time required for processing.
- The default retention target should be as short as operationally possible.
- The transcript may be stored as part of the learning history.
- The raw audio must not be used for model training without separate consent.
- Audio access must be logged.
- Temporary download links must be short-lived.
- Deleted audio must not remain accessible through cached links.
- Support access to child audio requires a documented reason.
- The system must provide a cleanup process for expired audio.

## 11. Security requirements

- Audio uploads use signed URLs.
- File type, duration and size are validated.
- Unsupported formats are rejected.
- Authorization is checked for every voice session.
- One student cannot access another student's recordings.
- Audio is encrypted in transit and at rest.
- Cleanup jobs are monitored.
- Failed deletion attempts generate alerts.
- Uploaded files must not be executed.
- File names supplied by users must not be trusted.

## 12. Accessibility

Voice input supplements but does not replace:

- text input;
- mathematical keyboard;
- image upload;
- manual topic selection;
- standard navigation.

The main product flow must remain usable when:

- microphone permission is denied;
- no microphone is present;
- transcription is unavailable;
- the student cannot or does not want to speak.

## 13. Error handling

Supported error states:

- microphone permission denied;
- no microphone detected;
- no speech detected;
- recording too short;
- recording too long;
- unsupported audio format;
- upload failed;
- network disconnected;
- transcription provider unavailable;
- low-confidence transcript;
- audio processing failed;
- audio deletion failed.

Each error must provide an understandable recovery action.

## 14. Analytics

The platform must measure:

- voice input adoption;
- recording completion rate;
- transcription success rate;
- average processing latency;
- transcript edit rate;
- fallback-to-text rate;
- low-confidence rate;
- average audio duration;
- transcription cost per minute;
- mathematical normalization error rate;
- deletion compliance rate;
- impact of voice input on homework completion.

## 15. MVP scope

Included:

- manual recording start and stop;
- recordings up to 60 seconds;
- Russian speech recognition;
- transcript preview;
- transcript editing;
- explicit confirmation;
- typed-input fallback;
- basic mathematical phrase normalization;
- temporary audio storage;
- automatic audio deletion;
- web browser support.

Not included:

- realtime voice conversation;
- always-on microphone;
- background recording;
- speech synthesis;
- full voice navigation;
- speaker identification;
- emotion recognition;
- long-term audio archive;
- complex mathematical formula dictation;
- voice-only grading;
- automatic submission without confirmation.

## 16. Future development

Possible future functions:

- native mobile recording;
- voice navigation;
- text-to-speech for task statements;
- spoken mental arithmetic;
- realtime tutoring conversation;
- pronunciation analysis;
- foreign-language speaking practice;
- accessibility mode;
- voice input for preschool users;
- teacher voice comments;
- controlled voice assessment.