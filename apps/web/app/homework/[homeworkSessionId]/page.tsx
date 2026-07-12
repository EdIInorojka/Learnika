import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ApiClientError } from "../../../lib/api-client.server";
import {
  HomeworkContractError,
  type HomeworkAttemptView,
  type HomeworkSessionView,
  parseHomeworkSessionId,
} from "../../../lib/homework-contract";
import { getHomeworkSession, listHomeworkAttempts } from "../../../lib/homework-service.server";
import { logoutParentAction } from "../../auth-actions";
import {
  attemptStatusLabel,
  formatMetadataDate,
  sessionStatusLabel,
  sourceLabel,
} from "../homework-labels";

export const dynamic = "force-dynamic";

interface HomeworkSessionPageProps {
  params: Promise<{ homeworkSessionId: string }>;
  searchParams: Promise<{ created?: string | string[] }>;
}

export default async function HomeworkSessionPage({
  params,
  searchParams,
}: HomeworkSessionPageProps) {
  let homeworkSessionId: string;
  try {
    homeworkSessionId = parseHomeworkSessionId((await params).homeworkSessionId);
  } catch {
    notFound();
  }

  let session: HomeworkSessionView;
  let attempts: HomeworkAttemptView[];
  try {
    [session, attempts] = await Promise.all([
      getHomeworkSession(homeworkSessionId),
      listHomeworkAttempts(homeworkSessionId),
    ]);
  } catch (error: unknown) {
    if (error instanceof ApiClientError && (error.status === 401 || error.status === 403)) {
      redirect("/?authError=session");
    }
    if (
      error instanceof HomeworkContractError ||
      (error instanceof ApiClientError && error.status === 404)
    ) {
      notFound();
    }

    return (
      <main className="app-shell">
        <Link className="back-link" href="/homework">
          Назад к сессиям
        </Link>
        <p className="auth-error" role="status">
          Не удалось безопасно загрузить метаданные сессии.
        </p>
      </main>
    );
  }

  const created = (await searchParams).created === "1";

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <Link className="brand-link" href="/">
            Learnika
          </Link>
          <p className="page-context">Домашние задания</p>
        </div>
        <form action={logoutParentAction}>
          <button className="secondary" type="submit">
            Выйти
          </button>
        </form>
      </header>

      <div className="page-heading">
        <div>
          <Link className="back-link" href="/homework">
            Назад к сессиям
          </Link>
          <h1>Метаданные сессии</h1>
        </div>
      </div>

      {created ? (
        <p className="success-message" role="status">
          Сессия создана.
        </p>
      ) : null}

      <section className="metadata-section" aria-labelledby="session-metadata-title">
        <h2 id="session-metadata-title">Сессия</h2>
        <dl className="metadata-list">
          <div>
            <dt>Предмет</dt>
            <dd>Математика</dd>
          </div>
          <div>
            <dt>Класс</dt>
            <dd>{session.gradeLevel ? `${session.gradeLevel} класс` : "Не указан"}</dd>
          </div>
          <div>
            <dt>Источник</dt>
            <dd>{sourceLabel(session.sourceType)}</dd>
          </div>
          <div>
            <dt>Статус</dt>
            <dd>{sessionStatusLabel(session.status)}</dd>
          </div>
          <div>
            <dt>Создана</dt>
            <dd>
              <time dateTime={session.createdAt}>{formatMetadataDate(session.createdAt)}</time>
            </dd>
          </div>
          <div>
            <dt>Обновлена</dt>
            <dd>
              <time dateTime={session.updatedAt}>{formatMetadataDate(session.updatedAt)}</time>
            </dd>
          </div>
        </dl>
      </section>

      <section className="attempts-section" aria-labelledby="attempts-title">
        <h2 id="attempts-title">Попытки</h2>
        {attempts.length === 0 ? (
          <p className="empty-state">Метаданных попыток пока нет.</p>
        ) : (
          <ul className="attempt-list">
            {attempts.map((attempt) => (
              <li key={attempt.attemptNumber}>
                <strong>Попытка {attempt.attemptNumber}</strong>
                <span>{attemptStatusLabel(attempt.status)}</span>
                <time dateTime={attempt.createdAt}>{formatMetadataDate(attempt.createdAt)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
