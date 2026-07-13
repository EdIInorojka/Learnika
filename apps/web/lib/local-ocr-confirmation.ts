export const localOcrConfirmationMaxLength = 4096;

export interface LocalOcrConfirmationState {
  confirmed: boolean;
  draftText: string;
}

export type LocalOcrConfirmationAction =
  { text: string; type: "EDIT" | "RESET" } | { type: "CONFIRM" };

function boundedText(text: string): string {
  return text.slice(0, localOcrConfirmationMaxLength);
}

export function createLocalOcrConfirmationState(candidateText: string): LocalOcrConfirmationState {
  return {
    confirmed: false,
    draftText: boundedText(candidateText),
  };
}

export function canConfirmLocalOcrText(state: LocalOcrConfirmationState): boolean {
  return !state.confirmed && state.draftText.trim().length > 0;
}

export function localOcrConfirmationReducer(
  state: LocalOcrConfirmationState,
  action: LocalOcrConfirmationAction,
): LocalOcrConfirmationState {
  if (action.type === "EDIT" || action.type === "RESET") {
    return {
      confirmed: false,
      draftText: boundedText(action.text),
    };
  }

  if (!canConfirmLocalOcrText(state)) return state;
  return { ...state, confirmed: true };
}
