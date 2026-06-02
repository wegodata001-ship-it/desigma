"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AssetImg } from "@/components/asset-img";
import { SubcategoryPillLink } from "@/components/storefront/subcategory-pill-link";
import { useStoreI18n } from "@/components/storefront/store-i18n";
import { pickLocalized } from "@/lib/localized";

type CategoryItem = {
  id: string;
  parentId: string | null;
  name_he: string;
  name_ar: string;
  name_en: string;
  imageUrl: string | null;
};

const PRIORITY_EN = ["Smartphones", "Laptops", "Gaming", "Audio", "Cables"];

function sortMainCategories(mains: CategoryItem[]): CategoryItem[] {
  const index = (name: string) => {
    const i = PRIORITY_EN.findIndex((p) => p.toLowerCase() === name.toLowerCase());
    return i === -1 ? 999 : i;
  };
  return [...mains].sort((a, b) => index(a.name_en) - index(b.name_en));
}

export function FeaturedCategories({ categories }: { categories: CategoryItem[] }) {
  const { lang, t, dir } = useStoreI18n();
  const searchParams = useSearchParams();
  const selectedCatId = searchParams.get("cat")?.trim() ?? "";
  const scroller = useRef<HTMLDivElement>(null);
  const [openMain, setOpenMain] = useState<string | null>(null);

  const mains = useMemo(() => sortMainCategories(categories.filter((c) => c.parentId == null)), [categories]);
  const childrenByParent = useMemo(() => {
    const map = new Map<string, CategoryItem[]>();
    for (const c of categories) {
      if (!c.parentId) continue;
      const list = map.get(c.parentId) ?? [];
      list.push(c);
      map.set(c.parentId, list);
    }
    return map;
  }, [categories]);

  const scroll = (dx: number) => scroller.current?.scrollBy({ left: dx, behavior: "smooth" });

  if (mains.length === 0) {
    return null;
  }

  return (
    <section id="featured-categories" className="scroll-mt-24 rounded-3xl border border-zinc-800/70 bg-gradient-to-b from-zinc-950/80 to-black/90 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
        <div className="min-w-0 flex-1 text-center sm:flex-none sm:text-start">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-400/90">{t("featuredCategoriesKicker")}</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">{t("featuredCategoriesTitle")}</h2>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => scroll(dir === "rtl" ? 200 : -200)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700/90 bg-zinc-900/90 text-lg text-zinc-200 shadow-[0_0_16px_-4px_rgba(249,115,22,0.25)] transition hover:border-orange-500/60 hover:text-orange-300 hover:shadow-[0_0_20px_-2px_rgba(249,115,22,0.4)]"
            aria-label="scroll-prev"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scroll(dir === "rtl" ? -200 : 200)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700/90 bg-zinc-900/90 text-lg text-zinc-200 shadow-[0_0_16px_-4px_rgba(249,115,22,0.25)] transition hover:border-orange-500/60 hover:text-orange-300 hover:shadow-[0_0_20px_-2px_rgba(249,115,22,0.4)]"
            aria-label="scroll-next"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="flex snap-x snap-mandatory justify-start gap-6 overflow-x-auto px-1 py-2 sm:gap-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        dir={dir}
      >
        {mains.map((c) => {
          const children = childrenByParent.get(c.id) ?? [];
          const hasChildren = children.length > 0;
          const expanded = openMain === c.id;
          const active = selectedCatId === c.id || children.some((ch) => ch.id === selectedCatId);
          const label = pickLocalized(c, "name", lang);

          const item = (
            <div className="flex w-[108px] shrink-0 snap-center flex-col items-center sm:w-[128px]">
              <motion.div
                className={`relative rounded-full p-[3px] transition-shadow duration-300 ${
                  expanded || active
                    ? "bg-gradient-to-br from-orange-300 via-orange-500 to-orange-600 shadow-[0_0_32px_4px_rgba(249,115,22,0.55)]"
                    : "bg-gradient-to-br from-orange-400/85 via-orange-500/70 to-orange-700/45 shadow-[0_0_22px_-2px_rgba(249,115,22,0.38)] group-hover:shadow-[0_0_30px_2px_rgba(249,115,22,0.5)]"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="h-[100px] w-[100px] overflow-hidden rounded-full bg-zinc-950 ring-2 ring-black/40 sm:h-[120px] sm:w-[120px]">
                  <AssetImg
                    path={c.imageUrl}
                    alt={label}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                  />
                </div>
              </motion.div>
              <p
                className={`mt-3 max-w-[128px] text-center text-sm font-bold leading-snug transition sm:text-base ${
                  active ? "text-white" : "text-zinc-300 group-hover:text-white"
                }`}
              >
                {label}
              </p>
              {hasChildren ? (
                <span className="mt-1 text-[11px] font-medium text-orange-400/90">{expanded ? "▲" : "▼"}</span>
              ) : null}
            </div>
          );

          const wrapClass =
            "group block shrink-0 text-center transition duration-300 hover:-translate-y-1";

          if (!hasChildren) {
            return (
              <Link key={c.id} href={`/products?cat=${encodeURIComponent(c.id)}`} className={wrapClass}>
                {item}
              </Link>
            );
          }

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setOpenMain((prev) => (prev === c.id ? null : c.id))}
              className={`${wrapClass} cursor-pointer border-0 bg-transparent p-0`}
            >
              {item}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {openMain && (childrenByParent.get(openMain)?.length ?? 0) > 0 ? (
          <motion.div
            key={openMain}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            <div className="mt-6 border-t border-zinc-800/60 pt-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-orange-400/85 sm:text-sm">
                {t("subcategoriesLabel")}
              </p>
              <motion.div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
                {(childrenByParent.get(openMain) ?? []).map((child) => (
                  <SubcategoryPillLink
                    key={child.id}
                    href={`/products?cat=${encodeURIComponent(child.id)}`}
                    label={pickLocalized(child, "name", lang)}
                    imageUrl={child.imageUrl}
                    active={selectedCatId === child.id}
                    size="lg"
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
