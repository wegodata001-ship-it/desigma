import { STORAGE_BUCKET } from "@/lib/storage";
import { resolvePublicAssetSrc } from "@/lib/assets-path";

/** Supabase image render API — avoids loading 4000px originals in admin lists. */
export function adminThumbnailSrc(path: string | null | undefined, size = 300): string {
  if (!path?.trim()) return "";
  const resolved = resolvePublicAssetSrc(path);
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  if (!base || !resolved.includes(base)) return resolved;

  const renderUrl = resolved.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/",
  );
  const sep = renderUrl.includes("?") ? "&" : "?";
  return `${renderUrl}${sep}width=${size}&height=${size}&resize=contain`;
}

/** Storefront product card — medium thumb via render when on Supabase. */
export function catalogThumbnailSrc(path: string | null | undefined, size = 600): string {
  return adminThumbnailSrc(path, size) || resolvePublicAssetSrc(path ?? "");
}

export { STORAGE_BUCKET };
