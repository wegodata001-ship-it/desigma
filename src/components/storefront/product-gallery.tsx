"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CatalogProductImage } from "@/components/storefront/catalog-product-image";
import { lockBodyScroll } from "@/lib/modal-scroll-lock";

function GalleryMainFrame({
  title,
  currentUrl,
  selected,
  safeLength,
  lightbox,
  onOpenLightbox,
  onMove,
  onSelect,
  safe,
}: {
  title: string;
  currentUrl: string | null;
  selected: number;
  safeLength: number;
  lightbox: boolean;
  onOpenLightbox: () => void;
  onMove: (n: number) => void;
  onSelect: (idx: number) => void;
  safe: { id: string; url: string }[];
}) {
  const touchStartX = useRef<number | null>(null);

  return (
    <div
      className={`group relative w-full ${lightbox ? "h-full min-h-[min(80vh,880px)]" : ""}`}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
        const dx = endX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(dx) < 40) return;
        if (dx < 0) onMove(selected + 1);
        else onMove(selected - 1);
      }}
    >
      <button
        type="button"
        className="absolute inset-0 z-[1] cursor-zoom-in"
        aria-label={title}
        onClick={onOpenLightbox}
      />
      <div className="relative z-0 h-full min-h-[inherit] w-full">
        <CatalogProductImage
          path={currentUrl}
          alt={title}
          variant="gallery-main"
          priority
          frameClassName={lightbox ? "!h-[min(80vh,880px)] border-zinc-700" : ""}
        />
      </div>
      {safeLength > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMove(selected - 1);
            }}
            className="absolute left-2 top-1/2 z-[2] -translate-y-1/2 rounded-full border border-zinc-700 bg-black/70 px-3 py-2 text-lg text-zinc-100 backdrop-blur hover:bg-black/90"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMove(selected + 1);
            }}
            className="absolute right-2 top-1/2 z-[2] -translate-y-1/2 rounded-full border border-zinc-700 bg-black/70 px-3 py-2 text-lg text-zinc-100 backdrop-blur hover:bg-black/90"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 z-[2] flex -translate-x-1/2 gap-1.5">
            {safe.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                aria-label={`Image ${idx + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(idx);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  idx === selected ? "w-6 bg-orange-500" : "w-1.5 bg-zinc-600 hover:bg-zinc-400"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GalleryThumb({
  url,
  title,
  selected,
  onSelect,
}: {
  url: string;
  title: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`shrink-0 transition ${
        selected ? "ring-2 ring-orange-500/30" : ""
      }`}
    >
      <CatalogProductImage
        path={url}
        alt={title}
        variant="thumb"
        frameClassName={
          selected ? "border-orange-500" : "border-zinc-800 hover:border-zinc-600"
        }
      />
    </button>
  );
}

export function ProductGallery({
  images,
  title,
}: {
  images: { id: string; url: string }[];
  title: string;
}) {
  const safe = useMemo(() => images.filter((i) => !!i.url), [images]);
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [mounted, setMounted] = useState(false);
  const current = safe[selected] ?? safe[0];
  const sig = useMemo(() => safe.map((i) => i.url).join("|"), [safe]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setSelected(0);
  }, [sig]);

  useEffect(() => {
    if (!lightbox) return;
    const unlock = lockBodyScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      unlock();
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox]);

  const move = useCallback(
    (next: number) => {
      if (safe.length === 0) return;
      setSelected((next + safe.length) % safe.length);
    },
    [safe.length],
  );

  return (
    <div className="space-y-3">
      <GalleryMainFrame
        title={title}
        currentUrl={current?.url ?? null}
        selected={selected}
        safeLength={safe.length}
        lightbox={false}
        onOpenLightbox={() => setLightbox(true)}
        onMove={move}
        onSelect={setSelected}
        safe={safe}
      />

      {safe.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {safe.map((img, idx) => (
            <GalleryThumb
              key={img.id}
              url={img.url}
              title={title}
              selected={idx === selected}
              onSelect={() => setSelected(idx)}
            />
          ))}
        </div>
      )}

      {lightbox && mounted
        ? createPortal(
            <div className="fixed inset-0 z-[200] flex flex-col bg-black/95 p-4 md:p-6">
              <div className="mb-3 flex shrink-0 items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">
                  {selected + 1} / {safe.length}
                </span>
                <button
                  type="button"
                  onClick={() => setLightbox(false)}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
                >
                  ✕
                </button>
              </div>
              <div className="min-h-0 flex-1">
                <GalleryMainFrame
                  title={title}
                  currentUrl={current?.url ?? null}
                  selected={selected}
                  safeLength={safe.length}
                  lightbox
                  onOpenLightbox={() => {}}
                  onMove={move}
                  onSelect={setSelected}
                  safe={safe}
                />
              </div>
              {safe.length > 1 && (
                <div className="mt-4 flex shrink-0 justify-center gap-2 overflow-x-auto">
                  {safe.map((img, idx) => (
                    <GalleryThumb
                      key={img.id}
                      url={img.url}
                      title={title}
                      selected={idx === selected}
                      onSelect={() => setSelected(idx)}
                    />
                  ))}
                </div>
              )}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
