"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminLoginIllustration } from "@/components/admin/admin-login-illustration";
import { AdminI18nProvider, useAdminI18n } from "@/lib/admin-i18n";

export default function LoginAdminPage() {
  return (
    <AdminI18nProvider>
      <LoginAdminInner />
    </AdminI18nProvider>
  );
}

function LoginSpinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin text-white"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function LangSwitch() {
  const { lang, setLang, t } = useAdminI18n();
  const btn = (code: "he" | "en" | "ar", label: string) => (
    <button
      key={code}
      type="button"
      onClick={() => setLang(code)}
      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
        lang === code ? "bg-white/15 text-white" : "text-white/50 hover:bg-white/10 hover:text-white/80"
      }`}
    >
      {label}
    </button>
  );
  return (
    <div className="inline-flex gap-0.5 rounded-xl border border-white/[0.08] bg-black/20 p-1 backdrop-blur-sm">
      {btn("he", t("hebrew"))}
      {btn("en", t("english"))}
      {btn("ar", t("arabic"))}
    </div>
  );
}

function BrandPanel({ compact }: { compact?: boolean }) {
  const { t } = useAdminI18n();
  return (
    <div
      className={`flex flex-col ${compact ? "items-center px-6 pt-10 text-center lg:items-start lg:px-12 lg:pt-0 lg:text-start" : "justify-center px-8 py-12 lg:px-14 lg:py-16"}`}
    >
      <div className="mb-8 lg:mb-10">
        <div className="text-3xl font-black tracking-[0.2em] text-white md:text-4xl">
          DESIGMA
        </div>
        <div className="mt-2 h-1 w-12 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FF8F1F] lg:mx-0 mx-auto" />
      </div>
      <h1 className="max-w-md text-2xl font-bold leading-tight text-white md:text-3xl lg:text-4xl">
        {t("adminWelcomeTitle")}
      </h1>
      <p className="mt-3 max-w-sm text-base leading-relaxed text-white/60 md:text-lg">
        {t("adminWelcomeSubtitle")}
      </p>
      {!compact && (
        <div className="mt-12 hidden w-full lg:block">
          <AdminLoginIllustration />
        </div>
      )}
    </div>
  );
}

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

  const inputWrap =
    "flex items-center gap-3 rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 transition focus-within:border-orange-500/50 focus-within:ring-2 focus-within:ring-orange-500/20";
  const inputClass =
    "min-h-[52px] flex-1 border-0 bg-transparent py-3 text-[15px] text-white placeholder:text-white/35 outline-none ring-0";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="relative min-h-screen overflow-hidden bg-[#050505] text-white"
    >
      {/* Gradient + glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#050505] via-[#0B1020] to-[#111827]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 start-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#FF7A00]/20 blur-[120px] md:start-auto md:end-0 md:translate-x-1/3"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 start-0 h-[300px] w-[300px] rounded-full bg-blue-600/10 blur-[100px]"
        aria-hidden
      />

      {/* Layout LTR: form left, brand right — text direction set per panel */}
      <div className="relative z-10 flex min-h-screen flex-col lg:grid lg:grid-cols-2" dir="ltr">
        <div className="lg:col-start-2 lg:row-start-1">
          <div dir={isRtl ? "rtl" : "ltr"}>
            <BrandPanel compact />
          </div>
        </div>

        <div
          dir={isRtl ? "rtl" : "ltr"}
          className="flex flex-1 flex-col justify-center px-5 pb-10 pt-4 sm:px-8 lg:col-start-1 lg:row-start-1 lg:px-12 lg:py-12"
        >
          <div className="mb-6 flex justify-end lg:absolute lg:end-8 lg:top-8">
            <LangSwitch />
          </div>

          <div className="mx-auto w-full max-w-[420px]">
            <div
              className="rounded-2xl border border-white/[0.08] p-6 shadow-2xl shadow-black/50 sm:p-8"
              style={{
                background: "rgba(20,20,20,0.7)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              <h2 className="mb-6 text-center text-lg font-semibold text-white/90 lg:text-start">
                {t("adminLoginFormTitle")}
              </h2>

              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label htmlFor="admin-email" className="mb-2 block text-sm font-medium text-white/70">
                    {t("email")}
                  </label>
                  <div className={inputWrap}>
                    <span className="text-lg opacity-70" aria-hidden>
                      📧
                    </span>
                    <input
                      id="admin-email"
                      type="email"
                      required
                      autoComplete="email"
                      className={inputClass}
                      placeholder={t("emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="admin-password" className="mb-2 block text-sm font-medium text-white/70">
                    {t("password")}
                  </label>
                  <div className={inputWrap}>
                    <span className="text-lg opacity-70" aria-hidden>
                      🔒
                    </span>
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      className={inputClass}
                      placeholder={t("passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg transition hover:bg-white/10 hover:text-white ${
                        showPassword ? "text-orange-400" : "text-white/50"
                      }`}
                      aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                      aria-pressed={showPassword}
                    >
                      👁
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <a
                    href="mailto:support@desigma-shop.com"
                    className="text-sm font-medium text-orange-400/90 transition hover:text-[#FF8F1F]"
                  >
                    {t("forgotPassword")}
                  </a>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-[14px] bg-[#FF7A00] text-base font-semibold text-white shadow-lg shadow-orange-900/30 transition hover:bg-[#FF8F1F] disabled:cursor-not-allowed disabled:opacity-70"
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
            </div>

            <Link
              href="/"
              className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-white/50 transition hover:text-white/80"
            >
              <span aria-hidden>←</span>
              <span>{t("backToSite")}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
