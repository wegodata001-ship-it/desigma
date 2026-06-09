"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminI18nProvider, useAdminI18n } from "@/lib/admin-i18n";
import { SITE_NAME } from "@/lib/store";
import { STORE_BUSINESS } from "@/lib/store-business";

export default function LoginAdminPage() {
  return (
    <AdminI18nProvider>
      <LoginAdminInner />
    </AdminI18nProvider>
  );
}

function LoginSpinner() {
  return (
    <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

function IconEye({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function LangSwitch() {
  const { lang, setLang } = useAdminI18n();
  const pills: { code: "he" | "en" | "ar"; label: string }[] = [
    { code: "he", label: "HE" },
    { code: "en", label: "EN" },
    { code: "ar", label: "AR" },
  ];
  return (
    <div className="inline-flex gap-1 rounded-full border border-white/[0.08] bg-black/30 p-1 backdrop-blur-sm">
      {pills.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          className={`min-w-[36px] rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide transition ${
            lang === code
              ? "bg-[#ff7a00] text-white shadow-[0_0_16px_rgba(255,122,0,0.35)]"
              : "text-white/55 hover:bg-white/10 hover:text-white"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

const INPUT_WRAP =
  "flex h-12 items-center gap-2.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 transition duration-200 focus-within:border-[#ff7a00]/55 focus-within:shadow-[0_0_0_2px_rgba(255,122,0,0.18)]";
const INPUT_CLASS =
  "min-h-0 flex-1 border-0 bg-transparent text-[15px] text-white placeholder:text-white/35 outline-none ring-0";

function LoginAdminInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { lang, t } = useAdminI18n();
  const isRtl = lang !== "en";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      let data: { ok?: boolean; role?: string; error?: string } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        setError(t("errorGeneric"));
        return;
      }
      if (!res.ok) {
        setError(data.error ?? t("errorGeneric"));
        return;
      }
      if (data.role !== "STORE_OWNER" && data.role !== "SUPER_ADMIN") {
        setError(t("notStoreOwner"));
        return;
      }
      window.location.assign("/admin");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-3 py-8 sm:px-4"
      style={{
        background: `
          radial-gradient(circle at top right, rgba(255,120,0,0.25), transparent 30%),
          radial-gradient(circle at bottom left, rgba(0,80,255,0.25), transparent 40%),
          #05070d
        `,
      }}
    >
      <main
        className="admin-login-card admin-login-enter relative z-10 w-full max-w-[92vw] sm:max-w-[440px]"
        style={{
          background: "rgba(15,15,20,0.75)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderRadius: "20px",
          padding: "clamp(22px, 5vw, 32px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
        }}
      >
        <div className="mb-5 flex items-center justify-end">
          <LangSwitch />
        </div>

        <header className="mb-6 text-center">
          <div
            className="text-white"
            style={{
              fontSize: "clamp(28px, 6vw, 36px)",
              fontWeight: 900,
              letterSpacing: "5px",
              lineHeight: 1.1,
            }}
          >
            {SITE_NAME}
          </div>
          <p className="mt-1.5 text-[10px] font-medium tracking-[0.2em] text-white/45 uppercase">
            {t("adminPortalTagline")}
          </p>
          <h1 className="mt-5 text-lg font-bold text-white">{t("adminWelcomeTitle")}</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/50">
            {t("adminWelcomeSubtitle")}
          </p>
        </header>

        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-xs font-medium text-white/60">
              {t("email")}
            </label>
            <div className={INPUT_WRAP}>
              <IconMail className="h-5 w-5 shrink-0 text-[#ff7a00]/90" />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                className={INPUT_CLASS}
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-xs font-medium text-white/60">
              {t("password")}
            </label>
            <div className={INPUT_WRAP}>
              <IconLock className="h-5 w-5 shrink-0 text-[#ff7a00]/90" />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                className={INPUT_CLASS}
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-white/10 ${
                  showPassword ? "text-[#ff7a00]" : "text-white/45"
                }`}
                aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                aria-pressed={showPassword}
              >
                <IconEye className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <a
              href={`mailto:${STORE_BUSINESS.email}`}
              className="text-xs font-medium text-white/45 transition hover:text-[#ff7a00]"
            >
              {t("forgotPassword")}
            </a>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-200"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff7a00] text-base font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            style={{ boxShadow: "0 0 18px rgba(255,122,0,0.3)" }}
          >
            {loading ? (
              <>
                <LoginSpinner />
                <span>{t("adminLoggingIn")}</span>
              </>
            ) : (
              t("adminLoginSubmit")
            )}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-white/40 transition hover:text-white/70"
        >
          <span aria-hidden>←</span>
          <span>{t("backToSite")}</span>
        </Link>
      </main>

    </div>
  );
}
