"use client";

import { useEffect, useReducer } from "react";

import type { MockOcrCandidateTextView } from "../../../lib/mock-ocr-candidate-contract";
import {
  canConfirmLocalOcrText,
  createLocalOcrConfirmationState,
  localOcrConfirmationMaxLength,
  localOcrConfirmationReducer,
} from "../../../lib/local-ocr-confirmation";

interface LearnerOcrConfirmationEditorProps {
  candidate: MockOcrCandidateTextView;
  controlId: string;
}

export function LearnerOcrConfirmationEditor({
  candidate,
  controlId,
}: LearnerOcrConfirmationEditorProps) {
  const [state, dispatch] = useReducer(
    localOcrConfirmationReducer,
    candidate.text,
    createLocalOcrConfirmationState,
  );

  useEffect(() => {
    dispatch({ text: candidate.text, type: "RESET" });
  }, [candidate.text]);

  return (
    <li className="learner-ocr-confirmation">
      <span className={state.confirmed ? "local-confirmation-label" : "mock-ocr-untrusted-label"}>
        {state.confirmed ? "Локально подтверждено, не сохранено" : "Непроверенный OCR-текст"}
      </span>
      <label htmlFor={controlId}>Проверьте и при необходимости исправьте текст</label>
      <textarea
        id={controlId}
        maxLength={localOcrConfirmationMaxLength}
        onChange={(event) => dispatch({ text: event.target.value, type: "EDIT" })}
        rows={4}
        spellCheck={false}
        value={state.draftText}
      />
      <div className="local-confirmation-actions">
        <button
          className="secondary"
          disabled={!canConfirmLocalOcrText(state)}
          onClick={() => dispatch({ type: "CONFIRM" })}
          type="button"
        >
          Подтвердить локально
        </button>
        <span aria-live="polite" role="status">
          {state.confirmed
            ? "Подтверждение действует только на этой странице. Текст никуда не отправлен."
            : "Текст пока не подтверждён и никуда не передаётся."}
        </span>
      </div>
      <p className="local-confirmation-note">
        Изменения исчезнут при обновлении страницы и не сохраняются в Learnika.
      </p>
    </li>
  );
}
