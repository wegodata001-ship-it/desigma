"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AssetImg } from "@/components/asset-img";
import { resolvePublicAssetSrc } from "@/lib/assets-path";
import { lockBodyScroll } from "@/lib/modal-scroll-lock";
import { storefrontGalleryImageClass } from "@/lib/product-media-fit";

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
  const [hoverZoom, setHoverZoom] = useState(false);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 ${
        lightbox ? "h-full min-h-[min(80vh,880px)]" : "aspect-square"
      }`}
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
      <div
        className={`relative z-0 flex h-full w-full items-center justify-center p-4 transition duration-500 md:p-8 ${
          hoverZoom ? "scale-[1.06]" : "scale-100"
        }`}
        onMouseEnter={() => setHoverZoom(true)}
        onMouseLeave={() => setHoverZoom(false)}
      >
        <AssetImg path={currentUrl} alt={title} className={storefrontGalleryImageClass("contain")} />
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
            <button
              type="button"
              key={img.id}
              onClick={() => setSelected(idx)}
              className={`group/thumb relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition md:h-24 md:w-24 ${
                idx === selected
                  ? "border-orange-500 ring-2 ring-orange-500/30"
                  : "border-zinc-800 hover:border-zinc-600"
              }`}
            >
              <AssetImg
                path={img.url}
                alt={title}
                className="h-full w-full object-cover transition group-hover/thumb:scale-105"
              />
            </button>
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
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setSelected(idx)}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                        idx === selected ? "border-orange-500" : "border-zinc-700"
                      }`}
                    >
                      <img
                        src={resolvePublicAssetSrc(img.url)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
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
