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
import { MediaAssetContractError, type MediaAssetView } from "../../../lib/media-asset-contract";
import { listMediaAssetMetadata } from "../../../lib/media-asset-service.server";
import { isMediaAssetUploadAvailable } from "../../../lib/media-upload-contract";
import { isMockOcrCandidateAvailable } from "../../../lib/mock-ocr-candidate-contract";
import { logoutParentAction } from "../../auth-actions";
import {
  attemptStatusLabel,
  formatMetadataDate,
  sessionStatusLabel,
  sourceLabel,
} from "../homework-labels";
import { createMediaAssetMetadataAction } from "./media-asset-actions";
import { formatByteSize, mediaAssetKindLabel, mediaRetentionLabel } from "./media-asset-labels";
import { uploadMediaAssetAction } from "./media-upload-actions";
import { requestMockOcrCandidateAction } from "./mock-ocr-candidate-actions";
import { MockOcrCandidatePanel } from "./mock-ocr-candidate-panel";

export const dynamic = "force-dynamic";

interface HomeworkSessionPageProps {
  params: Promise<{ homeworkSessionId: string }>;
  searchParams: Promise<{
    created?: string | string[];
    mediaCreated?: string | string[];
    mediaError?: string | string[];
    uploadError?: string | string[];
    uploadSuccess?: string | string[];
  }>;
}

const mediaErrorMessages: Record<string, string> = {
  invalid: "Проверьте метаданные медиафайла.",
  service: "Метаданные медиафайлов временно недоступны.",
};

const uploadErrorMessages: Record<string, string> = {
  invalid: "Выбранный файл не соответствует зарегистрированным метаданным.",
  service: "Загрузка временно недоступна.",
  state: "Текущее состояние медиафайла не разрешает загрузку.",
};

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

  let mediaAssets: MediaAssetView[] | null = null;
  try {
    mediaAssets = await listMediaAssetMetadata(homeworkSessionId);
  } catch (error: unknown) {
    if (error instanceof ApiClientError && (error.status === 401 || error.status === 403)) {
      redirect("/?authError=session");
    }
    if (error instanceof ApiClientError && error.status === 404) notFound();
    if (!(error instanceof MediaAssetContractError || error instanceof ApiClientError)) throw error;
  }

  const query = await searchParams;
  const created = query.created === "1";
  const mediaCreated = query.mediaCreated === "1";
  const mediaErrorKey = typeof query.mediaError === "string" ? query.mediaError : "";
  const mediaErrorMessage = mediaErrorMessages[mediaErrorKey];
  const uploadErrorKey = typeof query.uploadError === "string" ? query.uploadError : "";
  const uploadErrorMessage = uploadErrorMessages[uploadErrorKey];
  const uploadSuccess = query.uploadSuccess === "1";
  const createMediaAssetForSession = createMediaAssetMetadataAction.bind(null, homeworkSessionId);

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

      <section className="media-section" aria-labelledby="media-title">
        <h2 id="media-title">Метаданные медиафайлов</h2>

        {mediaCreated ? (
          <p className="success-message" role="status">
            Метаданные зарегистрированы.
          </p>
        ) : null}
        {mediaErrorMessage ? (
          <p className="auth-error" role="alert">
            {mediaErrorMessage}
          </p>
        ) : null}
        {uploadSuccess ? (
          <p className="success-message" role="status">
            Файл загружен.
          </p>
        ) : null}
        {uploadErrorMessage ? (
          <p className="auth-error" role="alert">
            {uploadErrorMessage}
          </p>
        ) : null}

        {mediaAssets === null ? (
          <p className="auth-error" role="status">
            Не удалось безопасно загрузить метаданные медиафайлов.
          </p>
        ) : (
          <div className="media-layout">
            <div className="media-create">
              <h3>Новая запись</h3>
              <form action={createMediaAssetForSession}>
                <div className="field">
                  <label htmlFor="asset-kind">Вид</label>
                  <select id="asset-kind" name="assetKind" required>
                    <option value="HOMEWORK_IMAGE">Изображение задания</option>
                    <option value="HOMEWORK_SCREENSHOT">Скриншот задания</option>
                    <option value="HOMEWORK_PDF">PDF задания</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="mime-type">MIME-тип</label>
                  <select id="mime-type" name="mimeType" required>
                    <option value="image/jpeg">image/jpeg</option>
                    <option value="image/png">image/png</option>
                    <option value="image/webp">image/webp</option>
                    <option value="application/pdf">application/pdf</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="size-bytes">Размер, байт</label>
                  <input
                    id="size-bytes"
                    inputMode="numeric"
                    max={10_485_760}
                    min={0}
                    name="sizeBytes"
                    required
                    step={1}
                    type="number"
                  />
                </div>
                <div className="field">
                  <label htmlFor="checksum-sha256">SHA-256, необязательно</label>
                  <input
                    autoComplete="off"
                    id="checksum-sha256"
                    maxLength={64}
                    minLength={64}
                    name="checksumSha256"
                    pattern="[0-9a-fA-F]{64}"
                    spellCheck={false}
                    type="text"
                  />
                </div>
                <button type="submit">Зарегистрировать</button>
              </form>
            </div>

            <div className="media-list-section">
              <h3>Зарегистрированные файлы</h3>
              {mediaAssets.length === 0 ? (
                <p className="empty-state">Метаданных медиафайлов пока нет.</p>
              ) : (
                <ul className="media-list">
                  {mediaAssets.map((mediaAsset, index) => {
                    const uploadAvailable = isMediaAssetUploadAvailable(mediaAsset);
                    const mockOcrAvailable = isMockOcrCandidateAvailable(mediaAsset);
                    const uploadAction = uploadMediaAssetAction.bind(
                      null,
                      homeworkSessionId,
                      mediaAsset.id,
                      mediaAsset.mimeType,
                      mediaAsset.sizeBytes,
                    );
                    const inputId = `media-upload-${index}`;
                    const mockOcrControlId = `mock-ocr-scenario-${index}`;
                    const mockOcrAction = requestMockOcrCandidateAction.bind(
                      null,
                      homeworkSessionId,
                      mediaAsset.id,
                    );

                    return (
                      <li key={mediaAsset.id}>
                        <div className="media-row-heading">
                          <strong>{mediaAssetKindLabel(mediaAsset.assetKind)}</strong>
                          <span>{mediaRetentionLabel(mediaAsset.retentionStatus)}</span>
                        </div>
                        <dl className="media-metadata-list">
                          <div>
                            <dt>MIME-тип</dt>
                            <dd>{mediaAsset.mimeType}</dd>
                          </div>
                          <div>
                            <dt>Размер</dt>
                            <dd>{formatByteSize(mediaAsset.sizeBytes)}</dd>
                          </div>
                          <div>
                            <dt>SHA-256</dt>
                            <dd>{mediaAsset.checksumPresent ? "Указана" : "Не указана"}</dd>
                          </div>
                          <div>
                            <dt>Хранить до</dt>
                            <dd>
                              <time dateTime={mediaAsset.retentionUntil}>
                                {formatMetadataDate(mediaAsset.retentionUntil)}
                              </time>
                            </dd>
                          </div>
                        </dl>
                        {uploadAvailable ? (
                          <form action={uploadAction} className="media-upload-form">
                            <label htmlFor={inputId}>Файл</label>
                            <input
                              accept={mediaAsset.mimeType}
                              id={inputId}
                              name="file"
                              required
                              type="file"
                            />
                            <button className="secondary" type="submit">
                              Загрузить
                            </button>
                          </form>
                        ) : null}
                        {mockOcrAvailable ? (
                          <MockOcrCandidatePanel
                            action={mockOcrAction}
                            controlId={mockOcrControlId}
                          />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
