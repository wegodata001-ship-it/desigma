"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useStoreI18n } from "@/components/storefront/store-i18n";
import { SITE_NAME } from "@/lib/store";
import { pickLocalized } from "@/lib/localized";
import { resolvePublicAssetSrc } from "@/lib/assets-path";

/** Local hero assets in /public — tried in order when primary image fails. */
const HERO_FALLBACK_CHAIN = [
  "/hero.png",
  "/images/desigma-hero-premium.png",
  "/desigma-hero-fallback.svg",
] as const;

const DEFAULT_HERO_BG = HERO_FALLBACK_CHAIN[0];

type HeroBanner = {
  id: string;
  title_he: string;
  title_ar: string;
  title_en: string;
  subtitle_he: string | null;
  subtitle_ar: string | null;
  subtitle_en: string | null;
  buttonText_he: string | null;
  buttonText_ar: string | null;
  buttonText_en: string | null;
  buttonUrl: string | null;
  imageUrl: string | null;
};

function resolveHeroImageUrl(imageUrl: string | null | undefined): string {
  const trimmed = imageUrl?.trim();
  if (!trimmed) return DEFAULT_HERO_BG;
  return resolvePublicAssetSrc(trimmed);
}

export function HeroSlider({ banners }: { banners: HeroBanner[] }) {
  const { lang, t, dir } = useStoreI18n();
  const isRtl = dir === "rtl";

  const activeBanners = useMemo(
    () => banners.filter((b) => b.imageUrl?.trim() || b.title_he?.trim() || b.title_en?.trim()),
    [banners],
  );

  if (activeBanners.length === 0) {
    return null;
  }

  const slides = activeBanners;
  const [idx, setIdx] = useState(0);
  const [bgSrc, setBgSrc] = useState<string>(DEFAULT_HERO_BG);
  const [bgLoaded, setBgLoaded] = useState(false);

  const current = slides[idx];
  const primaryBg = useMemo(() => resolveHeroImageUrl(current.imageUrl), [current.imageUrl]);

  useEffect(() => {
    setBgSrc(primaryBg);
    setBgLoaded(false);
  }, [primaryBg]);

  const onBgError = useCallback(() => {
    setBgSrc((prev) => {
      const i = HERO_FALLBACK_CHAIN.indexOf(prev as (typeof HERO_FALLBACK_CHAIN)[number]);
      const next = i >= 0 && i < HERO_FALLBACK_CHAIN.length - 1 ? HERO_FALLBACK_CHAIN[i + 1] : DEFAULT_HERO_BG;
      return next;
    });
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIdx((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const title = pickLocalized(current, "title", lang) || t("heroTitle");
  const subtitle = pickLocalized(current, "subtitle", lang);
  const btn = pickLocalized(current, "buttonText", lang) || t("heroCta");

  const overlayGradient = isRtl
    ? "linear-gradient(to left, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.25) 70%, rgba(0,0,0,0.15) 100%)"
    : "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.25) 70%, rgba(0,0,0,0.15) 100%)";

  const contentAlign =
    "flex h-full w-full max-w-7xl flex-col justify-center px-4 py-12 sm:px-6 md:py-16 max-md:items-center max-md:text-center " +
    (isRtl ? "md:items-end md:text-end" : "md:items-start md:text-start");

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: "90vh", height: "max(90vh, 22rem)" }}
      aria-label="Hero"
    >
      {/* Background image layer — positive z-index (never use negative z with stacking contexts) */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <img
          key={bgSrc}
          src={bgSrc}
          alt=""
          className={`hero-bg-image h-full w-full object-cover object-center transition-opacity duration-700 ${
            bgLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setBgLoaded(true)}
          onError={onBgError}
          fetchPriority="high"
          decoding="async"
        />
      </div>

      {/* Dark overlay — visible image must show through */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-700"
        style={{ background: overlayGradient }}
        aria-hidden
      />

      {/* Subtle glow + vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/50 via-transparent to-orange-500/[0.07]"
        aria-hidden
      />

      {/* Floating particles */}
      <div className="hero-particles pointer-events-none absolute inset-0 z-[2]" aria-hidden />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full min-h-[inherit]" dir={dir}>
        <div key={current.id} className={`${contentAlign} animate-in fade-in duration-700`}>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.35em] text-orange-400/95 sm:text-xs md:mb-3">
            {SITE_NAME}
          </p>
          <h1 className="max-w-xl text-3xl font-black leading-[1.08] tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-3 max-w-lg text-sm font-medium text-zinc-200 drop-shadow-md sm:text-base md:mt-4 md:text-lg">
            {subtitle || t("heroSubtitle")}
          </p>
          <Link
            href={current.buttonUrl || "/products"}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-900/35 transition hover:-translate-y-0.5 hover:brightness-105 md:mt-8 md:px-8 md:text-base"
          >
            {btn}
          </Link>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center justify-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIdx(i)}
            className={`h-2 rounded-full transition ${i === idx ? "w-7 bg-orange-500" : "w-2 bg-zinc-500/80"}`}
            aria-label={`slide-${i + 1}`}
          />
        ))}
      </div>
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIdx((idx - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-zinc-600/80 bg-black/40 px-2.5 py-1 text-lg text-white backdrop-blur-sm transition hover:bg-black/55 md:left-5"
            aria-label="previous-slide"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setIdx((idx + 1) % slides.length)}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-zinc-600/80 bg-black/40 px-2.5 py-1 text-lg text-white backdrop-blur-sm transition hover:bg-black/55 md:right-5"
            aria-label="next-slide"
          >
            ›
          </button>
        </>
      )}
    </section>
  );
}
