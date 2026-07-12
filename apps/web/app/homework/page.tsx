import Link from "next/link";
import { redirect } from "next/navigation";

import { ApiClientError } from "../../lib/api-client.server";
import { listChildProfileChoices, listHomeworkSessions } from "../../lib/homework-service.server";
import { logoutParentAction } from "../auth-actions";
import { createHomeworkSessionAction } from "./homework-actions";
import { formatMetadataDate, sessionStatusLabel, sourceLabel } from "./homework-labels";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  child: "Выбранный профиль ребенка недоступен.",
  invalid: "Проверьте метаданные новой сессии.",
  service: "Сервис домашних заданий временно недоступен.",
};

interface HomeworkPageProps {
  searchParams: Promise<{ homeworkError?: string | string[] }>;
}

export default async function HomeworkPage({ searchParams }: HomeworkPageProps) {
  let data: Awaited<
    ReturnType<
      () => Promise<{
        children: Awaited<ReturnType<typeof listChildProfileChoices>>;
        sessions: Awaited<ReturnType<typeof listHomeworkSessions>>;
      }>
    >
  > | null = null;
  try {
    const [children, sessions] = await Promise.all([
      listChildProfileChoices(),
      listHomeworkSessions(),
    ]);
    data = { children, sessions };
  } catch (error: unknown) {
    if (error instanceof ApiClientError && (error.status === 401 || error.status === 403)) {
      redirect("/?authError=session");
    }
  }

  const rawError = (await searchParams).homeworkError;
  const errorKey = typeof rawError === "string" ? rawError : "";
  const errorMessage = errorMessages[errorKey];

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
          <h1>Сессии домашних заданий</h1>
          <p className="muted">Только организационные метаданные без текста заданий и ответов.</p>
        </div>
      </div>

      {errorMessage ? (
        <p className="auth-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {!data ? (
        <p className="auth-error" role="status">
          Не удалось безопасно загрузить метаданные. Попробуйте позже.
        </p>
      ) : (
        <div className="homework-layout">
          <section className="homework-create" aria-labelledby="create-session-title">
            <h2 id="create-session-title">Новая сессия</h2>
            {data.children.length === 0 ? (
              <p className="empty-state">Сначала добавьте профиль ребенка в настройках семьи.</p>
            ) : (
              <form action={createHomeworkSessionAction}>
                <div className="field">
                  <label htmlFor="child-profile">Профиль ребенка</label>
                  <select id="child-profile" name="childProfileId" required>
                    {data.children.map((child, index) => (
                      <option key={child.id} value={child.id}>
                        Профиль {index + 1}
                        {child.gradeLevel ? ` · ${child.gradeLevel} класс` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="grade-level">Класс</label>
                  <select id="grade-level" name="gradeLevel" required>
                    <option value="7">7 класс</option>
                    <option value="8">8 класс</option>
                    <option value="9">9 класс</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="source-type">Источник</label>
                  <select id="source-type" name="sourceType" required>
                    <option value="MANUAL">Вручную</option>
                    <option value="IMAGE">Изображение</option>
                    <option value="SCREENSHOT">Скриншот</option>
                    <option value="PDF">PDF</option>
                    <option value="UNKNOWN">Не указан</option>
                  </select>
                </div>
                <button type="submit">Создать сессию</button>
              </form>
            )}
          </section>

          <section className="homework-list-section" aria-labelledby="session-list-title">
            <h2 id="session-list-title">Ваши сессии</h2>
            {data.sessions.length === 0 ? (
              <p className="empty-state">Сессий пока нет.</p>
            ) : (
              <ul className="session-list">
                {data.sessions.map((session) => (
                  <li key={session.id}>
                    <Link className="session-row" href={`/homework/${session.id}`}>
                      <span>
                        <strong>{sourceLabel(session.sourceType)}</strong>
                        <span className="session-meta">
                          {session.gradeLevel ? `${session.gradeLevel} класс` : "Класс не указан"}
                          {" · "}
                          <time dateTime={session.createdAt}>
                            {formatMetadataDate(session.createdAt)}
                          </time>
                        </span>
                      </span>
                      <span className="status-label">{sessionStatusLabel(session.status)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
