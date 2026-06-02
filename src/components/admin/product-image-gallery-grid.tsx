"use client";

import type { DragEvent } from "react";
import { CatalogProductImage } from "@/components/storefront/catalog-product-image";
type GalleryImage = { id: string; url: string; isMain: boolean; sortOrder: number };

type GalleryCardProps = {
  image: GalleryImage;
  index: number;
  busy: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  editLabel: string;
  mainLabel: string;
  deleteLabel: string;
  dragHandleLabel: string;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
};

export function ProductImageGalleryCard({
  image,
  index,
  busy,
  isDragging,
  isDropTarget,
  editLabel,
  mainLabel,
  deleteLabel,
  dragHandleLabel,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: GalleryCardProps) {
  const isMain = index === 0;

  return (
    <article
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition ${
        isDragging ? "scale-[0.98] opacity-50" : ""
      } ${isDropTarget ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200"}`}
    >
      <div
        draggable={!busy}
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", image.id);
          onDragStart();
        }}
        onDragEnd={onDragEnd}
        className={`relative cursor-grab active:cursor-grabbing ${busy ? "pointer-events-none opacity-60" : ""}`}
      >
        <CatalogProductImage
          path={image.url}
          alt=""
          variant="thumb"
          frameClassName="rounded-none border-0"
        />
        {isMain && (
          <span className="absolute start-2 top-2 z-10 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
            ★ {mainLabel}
          </span>
        )}
        <span
          className="absolute end-2 top-2 z-10 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white"
          title={dragHandleLabel}
          aria-hidden
        >
          ⋮⋮
        </span>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-slate-100 p-2">
        <button
          type="button"
          disabled={busy}
          onClick={onEdit}
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2 py-2 text-xs font-semibold text-blue-900 hover:bg-blue-100 disabled:opacity-50"
        >
          <span aria-hidden>✏️</span>
          <span>{editLabel}</span>
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-2 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          <span aria-hidden>🗑</span>
          <span>{deleteLabel}</span>
        </button>
      </div>
    </article>
  );
}
