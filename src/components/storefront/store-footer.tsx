"use client";

import Link from "next/link";
import { useStoreI18n } from "@/components/storefront/store-i18n";

const LEGAL_LINKS = [
  { href: "/terms", key: "termsOfUse" as const },
  { href: "/privacy", key: "privacyPolicy" as const },
  { href: "/refunds", key: "refundPolicy" as const },
  { href: "/shipping", key: "shippingPolicy" as const },
];

export function StoreFooter() {
  const { t, dir } = useStoreI18n();
  const year = new Date().getFullYear();

  return (
    <footer dir={dir} className="mt-auto border-t border-zinc-800 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="text-lg font-black tracking-tight text-white">DESIGMA</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">{t("footerTagline")}</p>
            <p className="mt-4 text-sm">
              <a href="tel:+972542298822" className="text-zinc-300 transition hover:text-orange-400">
                054-2298822
              </a>
              <span className="mx-2 text-zinc-700">·</span>
              <a href="mailto:m.desigma@gmail.com" className="text-zinc-300 transition hover:text-orange-400">
                m.desigma@gmail.com
              </a>
            </p>
          </div>

          <nav aria-label={t("footerLegal")} className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400/90">{t("footerLegal")}</p>
            {LEGAL_LINKS.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-zinc-300 transition hover:text-white hover:underline underline-offset-4"
              >
                {t(key)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80 pt-6 text-xs text-zinc-600">
          <span>© {year} DESIGMA</span>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {LEGAL_LINKS.map(({ href, key }) => (
              <Link key={`bottom-${href}`} href={href} className="transition hover:text-zinc-400">
                {t(key)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
