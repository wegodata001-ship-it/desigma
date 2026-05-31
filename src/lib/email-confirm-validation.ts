/** Exact copy for form + API validation messages. */
export const EMAIL_MISMATCH_MESSAGE = "אימות האימייל אינו תואם לכתובת האימייל";

export function isValidEmailFormat(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emailsMatch(email: string, confirmEmail: string): boolean {
  const a = email.trim();
  const b = confirmEmail.trim();
  if (!a || !b) return false;
  return normalizeEmail(a) === normalizeEmail(b);
}

export type EmailConfirmMatchState = "idle" | "match" | "mismatch";

export function emailConfirmMatchState(email: string, confirmEmail: string): EmailConfirmMatchState {
  const e = email.trim();
  const c = confirmEmail.trim();
  if (!c || !isValidEmailFormat(e)) return "idle";
  return emailsMatch(e, c) ? "match" : "mismatch";
}

export type EmailConfirmValidationResult = {
  emailError: string | null;
  confirmEmailError: string | null;
  matchState: EmailConfirmMatchState;
  isValid: boolean;
  normalizedEmail: string;
};

export function validateEmailConfirmPair(
  email: string,
  confirmEmail: string,
  messages: {
    emailRequired: string;
    emailInvalid: string;
    confirmRequired: string;
    mismatch: string;
  },
): EmailConfirmValidationResult {
  const trimmed = email.trim();
  const confirmTrimmed = confirmEmail.trim();

  let emailError: string | null = null;
  let confirmEmailError: string | null = null;

  if (!trimmed) emailError = messages.emailRequired;
  else if (!isValidEmailFormat(trimmed)) emailError = messages.emailInvalid;

  if (!confirmTrimmed) confirmEmailError = messages.confirmRequired;
  else if (trimmed && isValidEmailFormat(trimmed) && !emailsMatch(trimmed, confirmTrimmed)) {
    confirmEmailError = messages.mismatch;
  }

  const matchState = emailConfirmMatchState(email, confirmEmail);
  const isValid =
    !emailError &&
    !confirmEmailError &&
    isValidEmailFormat(trimmed) &&
    emailsMatch(trimmed, confirmTrimmed);

  return {
    emailError,
    confirmEmailError,
    matchState,
    isValid,
    normalizedEmail: normalizeEmail(trimmed),
  };
}
