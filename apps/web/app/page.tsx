import Link from "next/link";

import {
  loginParentAction,
  logoutParentAction,
  refreshParentSessionAction,
  registerParentAction,
} from "./auth-actions";
import { readAuthShellState } from "../lib/auth-service.server";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  credentials: "Неверная почта или пароль.",
  exists: "Аккаунт с этой почтой уже существует.",
  invalid: "Проверьте заполненные поля.",
  service: "Сервис входа временно недоступен.",
  session: "Сессия завершена. Войдите снова.",
};

interface HomePageProps {
  searchParams: Promise<{ authError?: string | string[] }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const state = await readAuthShellState();
  const rawError = (await searchParams).authError;
  const errorKey = typeof rawError === "string" ? rawError : "";
  const errorMessage = errorMessages[errorKey];

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1 className="brand">Learnika</h1>
        <span className="muted">Кабинет родителя</span>
      </header>

      {errorMessage ? (
        <p className="auth-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {state.status === "authenticated" ? (
        <section className="session-panel" aria-labelledby="session-title">
          <h2 id="session-title">Вы вошли</h2>
          <p>
            Родитель: <strong>{state.user.email}</strong>
          </p>
          <div className="session-actions">
            <Link className="button-link" href="/homework">
              Домашние задания
            </Link>
            <form action={logoutParentAction}>
              <button className="secondary" type="submit">
                Выйти
              </button>
            </form>
          </div>
        </section>
      ) : (
        <>
          {state.status === "unavailable" ? (
            <p className="auth-error" role="status">
              Не удалось проверить текущую сессию.
            </p>
          ) : null}

          {state.canRefresh ? (
            <form action={refreshParentSessionAction} className="session-actions">
              <button className="secondary" type="submit">
                Продолжить сессию
              </button>
            </form>
          ) : null}

          <div className="auth-layout">
            <section className="auth-section" aria-labelledby="login-title">
              <h2 id="login-title">Вход</h2>
              <form action={loginParentAction}>
                <div className="field">
                  <label htmlFor="login-email">Электронная почта</label>
                  <input autoComplete="email" id="login-email" name="email" required type="email" />
                </div>
                <div className="field">
                  <label htmlFor="login-password">Пароль</label>
                  <input
                    autoComplete="current-password"
                    id="login-password"
                    minLength={12}
                    name="password"
                    required
                    type="password"
                  />
                </div>
                <button type="submit">Войти</button>
              </form>
            </section>

            <section className="auth-section" aria-labelledby="register-title">
              <h2 id="register-title">Регистрация родителя</h2>
              <form action={registerParentAction}>
                <div className="field">
                  <label htmlFor="register-email">Электронная почта</label>
                  <input
                    autoComplete="email"
                    id="register-email"
                    name="email"
                    required
                    type="email"
                  />
                </div>
                <div className="field">
                  <label htmlFor="register-password">Пароль</label>
                  <input
                    autoComplete="new-password"
                    id="register-password"
                    maxLength={128}
                    minLength={12}
                    name="password"
                    required
                    type="password"
                  />
                </div>
                <button type="submit">Создать аккаунт</button>
              </form>
            </section>
          </div>
        </>
      )}
    </main>
  );
}
