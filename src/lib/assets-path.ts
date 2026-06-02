import { ASSETS_FOLDER } from "./store";
import { STORAGE_BUCKET } from "./storage";

export function assertAssetPath(pathOrUrl: string): string {
  const folder = ASSETS_FOLDER;
  const normalized = pathOrUrl.trim().replace(/^\/+/, "");
  if (!normalized.startsWith(`${folder}/`) && normalized !== folder) {
    throw new Error(`Asset path must start with ${folder}/`);
  }
  return normalized;
}

/** Banner images may be storage paths, absolute site paths (/… in public/), or full URLs. */
export function assertBannerImagePath(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) throw new Error("נדרש נתיב תמונה");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return assertAssetPath(trimmed);
}

/** Legacy store folder before NEXT_PUBLIC_ASSETS_FOLDER=desigma. */
function normalizeStorageKey(path: string): string {
  const trimmed = path.trim().replace(/^\/+/, "");
  if (trimmed.startsWith("base/")) return `desigma/${trimmed.slice(5)}`;
  return trimmed;
}

/** Use for any image that may be Supabase-relative, public static (/…), or absolute URL. */
export function resolvePublicAssetSrc(path: string): string {
  let p = path.trim();
  if (p.startsWith("http://") || p.startsWith("https://")) {
    // Fix old Supabase URLs that still point at /base/… in the bucket.
    if (p.includes("/store-assets/base/")) {
      p = p.replace("/store-assets/base/", "/store-assets/desigma/");
    }
    return p;
  }
  if (p.startsWith("/")) return p;
  p = normalizeStorageKey(p);
  // Bundled static assets in public/ (not Supabase storage)
  if (p.startsWith("demo/") || p.startsWith("products/") || p.startsWith("hero/") || p.startsWith("images/")) {
    return `/${p}`;
  }
  return publicStorageUrl(p);
}

export function publicStorageUrl(relativePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = normalizeStorageKey(relativePath);
  if (!base) return `/api/asset-placeholder?path=${encodeURIComponent(key)}`;
  const trimmed = base.replace(/\/+$/, "");
  return `${trimmed}/storage/v1/object/public/${STORAGE_BUCKET}/${key}`;
}
