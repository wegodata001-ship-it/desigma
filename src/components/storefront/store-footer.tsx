"use client";

import Link from "next/link";
import { useStoreI18n } from "@/components/storefront/store-i18n";
import { STORE_BUSINESS, STORE_LEGAL_LINKS } from "@/lib/store-business";
import {
  BusinessContactRow,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@/components/storefront/business-icons";

export function StoreFooter() {
  const { t, dir } = useStoreI18n();
  const year = new Date().getFullYear();

  return (
    <footer dir={dir} className="mt-auto border-t border-zinc-800 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-12">
        <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-4 lg:gap-8">
          <div>
            <p className="text-lg font-black tracking-tight text-white">{STORE_BUSINESS.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">{t("footerTagline")}</p>
          </div>

          <div className="text-sm leading-relaxed">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400/90">{t("footerAddressLabel")}</p>
            <div className="mt-3">
              <BusinessContactRow icon={<IconMapPin />}>{STORE_BUSINESS.address}</BusinessContactRow>
            </div>
          </div>

          <div className="text-sm leading-relaxed">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400/90">{t("footerContactLabel")}</p>
            <div className="mt-3 space-y-3">
              <BusinessContactRow icon={<IconPhone />} href={`tel:${STORE_BUSINESS.phoneTel}`}>
                {STORE_BUSINESS.phone}
              </BusinessContactRow>
              <BusinessContactRow icon={<IconMail />} href={`mailto:${STORE_BUSINESS.email}`}>
                {STORE_BUSINESS.email}
              </BusinessContactRow>
            </div>
          </div>

          <nav aria-label={t("footerLegal")} className="flex flex-col gap-2 text-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400/90">{t("footerLegal")}</p>
            {STORE_LEGAL_LINKS.map(({ href, labelKey }) => (
              <Link
                key={href}
                href={href}
                className="text-zinc-300 transition hover:text-white hover:underline underline-offset-4"
              >
                {t(labelKey)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-zinc-800/80 pt-6 text-center text-xs text-zinc-600 sm:text-start">
          <p>
            © {year} {STORE_BUSINESS.name}
          </p>
          <p className="mt-1">{t("footerRightsReserved")}</p>
        </div>
      </div>
    </footer>
  );
}
