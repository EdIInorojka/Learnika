import type {
  HomeworkAttemptStatus,
  HomeworkSessionStatus,
  HomeworkSourceType,
} from "../../lib/homework-contract";

const sourceLabels: Record<HomeworkSourceType, string> = {
  IMAGE: "Изображение",
  MANUAL: "Вручную",
  PDF: "PDF",
  SCREENSHOT: "Скриншот",
  UNKNOWN: "Не указан",
};

const sessionStatusLabels: Record<HomeworkSessionStatus, string> = {
  CANCELLED: "Отменена",
  CLOSED: "Закрыта",
  CREATED: "Создана",
  PAUSED: "Приостановлена",
  WAITING_FOR_ATTEMPT: "Ожидает попытку",
};

const attemptStatusLabels: Record<HomeworkAttemptStatus, string> = {
  CANCELLED: "Отменена",
  CREATED: "Создана",
  SUBMITTED: "Отправлена",
};

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function sourceLabel(sourceType: HomeworkSourceType): string {
  return sourceLabels[sourceType];
}

export function sessionStatusLabel(status: HomeworkSessionStatus): string {
  return sessionStatusLabels[status];
}

export function attemptStatusLabel(status: HomeworkAttemptStatus): string {
  return attemptStatusLabels[status];
}

export function formatMetadataDate(value: string): string {
  return dateFormatter.format(new Date(value));
}
