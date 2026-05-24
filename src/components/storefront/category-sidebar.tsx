"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AssetImg } from "@/components/asset-img";
import { SubcategoryPillLink } from "@/components/storefront/subcategory-pill-link";
import { useStoreI18n } from "@/components/storefront/store-i18n";
import { pickLocalized } from "@/lib/localized";

export type CategorySidebarItem = {
  id: string;
  parentId: string | null;
  name_he: string;
  name_ar: string;
  name_en: string;
  imageUrl?: string | null;
};

const PRIORITY_EN = ["Smartphones", "Laptops", "Gaming", "Audio", "Cables"];

function sortMainCategories(mains: CategorySidebarItem[]): CategorySidebarItem[] {
  const index = (name: string) => {
    const i = PRIORITY_EN.findIndex((p) => p.toLowerCase() === name.toLowerCase());
    return i === -1 ? 999 : i;
  };
  return [...mains].sort((a, b) => index(a.name_en) - index(b.name_en));
}

function findMainId(categories: CategorySidebarItem[], selectedId?: string): string | null {
  if (!selectedId) return null;
  const byId = new Map(categories.map((c) => [c.id, c] as const));
  let cur = byId.get(selectedId);
  while (cur?.parentId) cur = byId.get(cur.parentId);
  return cur?.id ?? null;
}

function CategoryImageRing({
  imageUrl,
  label,
  active,
  size = "desktop",
}: {
  imageUrl?: string | null;
  label: string;
  active: boolean;
  size?: "desktop" | "mobile";
}) {
  const inner = size === "desktop" ? "h-[112px] w-[112px]" : "h-[100px] w-[100px]";
  const outer = size === "desktop" ? "p-[3px]" : "p-[2.5px]";

  return (
    <motion.div
      layout
      className={`relative shrink-0 rounded-full ${outer} transition-shadow duration-300 ${
        active
          ? "bg-gradient-to-br from-orange-300 via-orange-500 to-orange-600 shadow-[0_0_32px_4px_rgba(249,115,22,0.55)]"
          : "bg-gradient-to-br from-orange-400/80 via-orange-500/60 to-orange-700/40 shadow-[0_0_22px_-2px_rgba(249,115,22,0.35)] group-hover:shadow-[0_0_30px_2px_rgba(249,115,22,0.5)]"
      }`}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className={`${inner} overflow-hidden rounded-full bg-zinc-950 ring-2 ring-black/40`}
        whileHover={{ scale: 1.06 }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
      >
        <AssetImg path={imageUrl} alt={label} className="h-full w-full object-cover" />
      </motion.div>
    </motion.div>
  );
}

function DesktopMainCard({
  category,
  subcategories,
  expanded,
  selectedId,
  hrefForId,
  onToggle,
}: {
  category: CategorySidebarItem;
  subcategories: CategorySidebarItem[];
  expanded: boolean;
  selectedId?: string;
  hrefForId: (id: string) => string;
  onToggle: () => void;
}) {
  const { lang, t } = useStoreI18n();
  const label = pickLocalized(category, "name", lang);
  const hasChildren = subcategories.length > 0;
  const activeMain =
    selectedId === category.id || subcategories.some((c) => c.id === selectedId);

  const header = (
    <motion.div
      className={`group flex w-full items-center gap-4 text-start transition-colors duration-300 ${
        hasChildren ? "cursor-pointer" : ""
      }`}
      onClick={hasChildren ? onToggle : undefined}
    >
      <CategoryImageRing imageUrl={category.imageUrl} label={label} active={activeMain} size="desktop" />
      <motion.div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-400/90">
          {hasChildren ? t("tapExploreSubcats") : t("topCategories")}
        </p>
        <h3
          className={`mt-1 text-xl font-bold tracking-tight transition-colors ${
            activeMain ? "text-white" : "text-zinc-100 group-hover:text-white"
          }`}
        >
          {label}
        </h3>
        {hasChildren ? (
          <span
            className={`mt-2 inline-flex items-center gap-1 text-xs font-medium transition ${
              expanded ? "text-orange-300" : "text-zinc-500 group-hover:text-zinc-300"
            }`}
          >
            {expanded ? "▲" : "▼"} {subcategories.length} {t("subcategoriesLabel").toLowerCase()}
          </span>
        ) : null}
      </motion.div>
    </motion.div>
  );

  return (
    <motion.article
      layout
      initial={false}
      animate={{
        borderColor: activeMain || expanded ? "rgba(249,115,22,0.45)" : "rgba(39,39,42,0.85)",
      }}
      className={`rounded-2xl border bg-gradient-to-br from-zinc-900/90 via-zinc-950/95 to-black p-5 shadow-lg transition-shadow duration-300 ${
        activeMain || expanded
          ? "shadow-[0_0_44px_-10px_rgba(249,115,22,0.5)]"
          : "shadow-black/30 hover:shadow-[0_0_32px_-12px_rgba(249,115,22,0.25)]"
      }`}
    >
      {hasChildren ? (
        header
      ) : (
        <Link href={hrefForId(category.id)} className="block">
          {header}
        </Link>
      )}

      {hasChildren ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-zinc-800/60 pt-3">
          <SubcategoryPillLink
            href={hrefForId(category.id)}
            label={label}
            imageUrl={category.imageUrl}
            active={selectedId === category.id}
            size="md"
          />
        </div>
      ) : null}

      <AnimatePresence initial={false}>
        {hasChildren && expanded ? (
          <motion.div
            key="subs"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex flex-col gap-2.5 border-t border-zinc-800/50 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{t("subcategoriesLabel")}</p>
              <div className="flex flex-col gap-2.5">
                {subcategories.map((child) => (
                  <SubcategoryPillLink
                    key={child.id}
                    href={hrefForId(child.id)}
                    label={pickLocalized(child, "name", lang)}
                    imageUrl={child.imageUrl}
                    active={selectedId === child.id}
                    size="lg"
                    fullWidth
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}

export function CategorySidebar({
  categories,
  selectedId,
  hrefForId = (id) => `/products?cat=${encodeURIComponent(id)}`,
}: {
  categories: CategorySidebarItem[];
  selectedId?: string;
  hrefForId?: (id: string) => string;
}) {
  const { lang, t, dir } = useStoreI18n();
  const mains = useMemo(
    () => sortMainCategories(categories.filter((c) => c.parentId == null)),
    [categories],
  );
  const childrenByParent = useMemo(() => {
    const map = new Map<string, CategorySidebarItem[]>();
    for (const c of categories) {
      if (!c.parentId) continue;
      const list = map.get(c.parentId) ?? [];
      list.push(c);
      map.set(c.parentId, list);
    }
    return map;
  }, [categories]);

  const activeMainId = findMainId(categories, selectedId);
  const [openMain, setOpenMain] = useState<string | null>(() => activeMainId);

  const effectiveOpen = openMain ?? activeMainId;

  return (
    <>
      {/* Mobile — horizontal main categories */}
      <div className="lg:hidden">
        <div
          className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-3 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          dir={dir}
        >
          {mains.map((main) => {
            const children = childrenByParent.get(main.id) ?? [];
            const hasChildren = children.length > 0;
            const label = pickLocalized(main, "name", lang);
            const active = activeMainId === main.id;
            const expanded = effectiveOpen === main.id;

            const inner = (
              <div className="flex w-[108px] shrink-0 snap-center flex-col items-center">
                <CategoryImageRing imageUrl={main.imageUrl} label={label} active={active || expanded} size="mobile" />
                <p
                  className={`mt-2.5 max-w-[108px] text-center text-sm font-bold leading-snug ${
                    active ? "text-white" : "text-zinc-300"
                  }`}
                >
                  {label}
                </p>
              </div>
            );

            if (!hasChildren) {
              return (
                <Link key={main.id} href={hrefForId(main.id)} className="shrink-0">
                  {inner}
                </Link>
              );
            }

            return (
              <button
                key={main.id}
                type="button"
                onClick={() => setOpenMain((prev) => (prev === main.id ? null : main.id))}
                className="shrink-0 border-0 bg-transparent p-0"
              >
                {inner}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {effectiveOpen && (childrenByParent.get(effectiveOpen)?.length ?? 0) > 0 ? (
            <motion.div
              key={effectiveOpen}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.22 }}
              className="mt-2 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-4"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-orange-400/85">
                {t("subcategoriesLabel")}
              </p>
              <div className="flex flex-col gap-2.5">
                <SubcategoryPillLink
                  href={hrefForId(effectiveOpen)}
                  label={pickLocalized(mains.find((m) => m.id === effectiveOpen)!, "name", lang)}
                  imageUrl={mains.find((m) => m.id === effectiveOpen)?.imageUrl}
                  active={selectedId === effectiveOpen}
                  size="lg"
                  fullWidth
                />
                {(childrenByParent.get(effectiveOpen) ?? []).map((child) => (
                  <SubcategoryPillLink
                    key={child.id}
                    href={hrefForId(child.id)}
                    label={pickLocalized(child, "name", lang)}
                    imageUrl={child.imageUrl}
                    active={selectedId === child.id}
                    size="lg"
                    fullWidth
                  />
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Desktop — vertical premium cards */}
      <div className="hidden space-y-4 lg:block">
        {mains.map((main) => (
          <DesktopMainCard
            key={main.id}
            category={main}
            subcategories={childrenByParent.get(main.id) ?? []}
            expanded={effectiveOpen === main.id}
            selectedId={selectedId}
            hrefForId={hrefForId}
            onToggle={() => setOpenMain((prev) => (prev === main.id ? null : main.id))}
          />
        ))}
      </div>
    </>
  );
}
