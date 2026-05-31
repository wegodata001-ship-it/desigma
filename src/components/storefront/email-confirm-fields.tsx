"use client";

import {
  emailConfirmMatchState,
  type EmailConfirmMatchState,
} from "@/lib/email-confirm-validation";

export type EmailConfirmLabels = {
  email: string;
  confirmEmail: string;
  matchOk: string;
  matchFail: string;
};

export function EmailMatchIndicator({
  email,
  confirmEmail,
  labels,
}: {
  email: string;
  confirmEmail: string;
  labels: Pick<EmailConfirmLabels, "matchOk" | "matchFail">;
}) {
  const state: EmailConfirmMatchState = emailConfirmMatchState(email, confirmEmail);
  if (state === "idle") return null;

  const ok = state === "match";
  return (
    <p
      className={`mt-2 flex items-center gap-2 text-sm ${ok ? "text-emerald-400" : "text-red-400"}`}
      role="status"
      aria-live="polite"
    >
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          ok ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/15 text-red-300"
        }`}
        aria-hidden
      >
        {ok ? "✓" : "✕"}
      </span>
      <span>{ok ? labels.matchOk : labels.matchFail}</span>
    </p>
  );
}

export function EmailConfirmFields({
  dir,
  idPrefix = "email",
  email,
  confirmEmail,
  onEmailChange,
  onConfirmEmailChange,
  onEmailBlur,
  onConfirmBlur,
  labels,
  emailError,
  confirmEmailError,
  showEmailError,
  showConfirmError,
}: {
  dir?: "rtl" | "ltr";
  idPrefix?: string;
  email: string;
  confirmEmail: string;
  onEmailChange: (value: string) => void;
  onConfirmEmailChange: (value: string) => void;
  onEmailBlur?: () => void;
  onConfirmBlur?: () => void;
  labels: EmailConfirmLabels;
  emailError?: string | null;
  confirmEmailError?: string | null;
  showEmailError?: boolean;
  showConfirmError?: boolean;
}) {
  return (
    <div className="space-y-4" dir={dir}>
      <div>
        <label className="ds-label" htmlFor={`${idPrefix}-email`}>
          {labels.email}
        </label>
        <input
          id={`${idPrefix}-email`}
          required
          type="email"
          inputMode="email"
          autoComplete="email"
          dir="ltr"
          className="ds-input mt-1.5 w-full text-start"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onBlur={onEmailBlur}
        />
        {showEmailError && emailError && (
          <p className="mt-1 text-sm text-red-400">{emailError}</p>
        )}
      </div>
      <div>
        <label className="ds-label" htmlFor={`${idPrefix}-confirm-email`}>
          {labels.confirmEmail}
        </label>
        <input
          id={`${idPrefix}-confirm-email`}
          required
          type="email"
          inputMode="email"
          autoComplete="off"
          dir="ltr"
          className="ds-input mt-1.5 w-full text-start"
          value={confirmEmail}
          onChange={(e) => onConfirmEmailChange(e.target.value)}
          onBlur={onConfirmBlur}
        />
        {showConfirmError && confirmEmailError && (
          <p className="mt-1 text-sm text-red-400">{confirmEmailError}</p>
        )}
        <EmailMatchIndicator email={email} confirmEmail={confirmEmail} labels={labels} />
      </div>
    </div>
  );
}
