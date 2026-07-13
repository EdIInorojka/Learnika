"use client";

import { useActionState } from "react";

import {
  type MockOcrCandidateActionState,
  type MockOcrCandidateResultView,
  initialMockOcrCandidateActionState,
} from "../../../lib/mock-ocr-candidate-contract";

interface MockOcrCandidatePanelProps {
  action: (
    state: MockOcrCandidateActionState,
    formData: FormData,
  ) => Promise<MockOcrCandidateActionState>;
  controlId: string;
}

function confidenceLabel(confidence: MockOcrCandidateResultView["confidence"]): string {
  if (confidence === "HIGH") return "Высокая";
  if (confidence === "MEDIUM") return "Средняя";
  if (confidence === "LOW") return "Низкая";
  return "Не определена";
}

function ResultGuardrails({ result }: { result: MockOcrCandidateResultView }) {
  return (
    <div className="mock-ocr-guardrails">
      <strong>Требуется подтверждение ученика.</strong>
      <span>Передача текста дальше отключена.</span>
      <span>Уверенность: {confidenceLabel(result.confidence)}.</span>
    </div>
  );
}

function MockOcrResult({ result }: { result: MockOcrCandidateResultView }) {
  if (result.status === "NEEDS_REVIEW") {
    return (
      <div className="mock-ocr-result" role="status">
        <p className="auth-error">
          Низкая уверенность распознавания. Текст не показан; нужна проверка или повторная попытка.
        </p>
        <ResultGuardrails result={result} />
      </div>
    );
  }

  if (result.status === "FAILED") {
    return (
      <div className="mock-ocr-result" role="status">
        <p className="auth-error">Не удалось безопасно получить черновик. Текст не показан.</p>
        <ResultGuardrails result={result} />
      </div>
    );
  }

  return (
    <div className="mock-ocr-result" role="status">
      <p className="mock-ocr-untrusted-label">Непроверенный черновик распознавания</p>
      <ul className="mock-ocr-candidates">
        {result.candidates.map((candidate, index) => (
          <li key={index}>
            <span>Непроверенный OCR-текст</span>
            <p>{candidate.text}</p>
          </li>
        ))}
      </ul>
      <ResultGuardrails result={result} />
    </div>
  );
}

export function MockOcrCandidatePanel({ action, controlId }: MockOcrCandidatePanelProps) {
  const [state, formAction, pending] = useActionState(action, initialMockOcrCandidateActionState);

  return (
    <div className="mock-ocr-panel">
      <form action={formAction} className="mock-ocr-form">
        <label htmlFor={controlId}>Режим распознавания</label>
        <select defaultValue="candidate" id={controlId} name="scenario">
          <option value="candidate">Обычная проверка</option>
          <option value="review">Низкая уверенность</option>
          <option value="failure">Безопасный отказ</option>
        </select>
        <button className="secondary" disabled={pending} type="submit">
          {pending ? "Проверяем..." : "Получить черновик"}
        </button>
      </form>

      <div aria-live="polite">
        {state.status === "RESULT" ? <MockOcrResult result={state.result} /> : null}
        {state.status === "NOT_READY" ? (
          <p className="auth-error" role="status">
            Медиафайл пока не готов к безопасному распознаванию.
          </p>
        ) : null}
        {state.status === "INVALID" ? (
          <p className="auth-error" role="status">
            Запрос распознавания отклонён.
          </p>
        ) : null}
        {state.status === "UNAVAILABLE" ? (
          <p className="auth-error" role="status">
            Распознавание временно недоступно.
          </p>
        ) : null}
      </div>
    </div>
  );
}
