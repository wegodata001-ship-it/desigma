import { uploadHttpErrorMessage } from "@/lib/admin-upload-errors";
import { compressImageForUpload } from "@/lib/image-compress-client";
import { withTimeout } from "@/lib/promise-with-timeout";

export type UploadKind = "products" | "categories" | "banners" | "logo";

const UPLOAD_FETCH_TIMEOUT_MS = 90_000;
const COMPRESS_TIMEOUT_MS = 45_000;

const defaultUploadMessages = {
  imageSaveFailed: "Image upload failed",
  fileTooLarge: "File is too large",
  uploadUnauthorized: "Unauthorized — please sign in again",
  uploadForbidden: "You do not have permission to upload",
  uploadServerError: "Server error during upload",
  uploadTimeout: "Upload timed out — try again",
  uploadStorageUnavailable: "Storage is unavailable",
};

export async function uploadAdminAsset(
  file: File,
  kind: UploadKind,
  options?: { entityId?: string; originalName?: string; compress?: boolean },
): Promise<string> {
  let uploadFile = file;
  if (options?.compress !== false && kind !== "logo") {
    try {
      uploadFile = await withTimeout(
        compressImageForUpload(file),
        COMPRESS_TIMEOUT_MS,
        "compress",
      );
    } catch (e) {
      if (e instanceof Error && e.message === "FILE_TOO_LARGE") throw e;
      if (e instanceof Error && e.message.startsWith("TIMEOUT:")) throw e;
      uploadFile = file;
    }
  }

  const fd = new FormData();
  fd.append("file", uploadFile);
  fd.append("kind", kind);
  if (options?.entityId) fd.append("entityId", options.entityId);
  if (options?.originalName) fd.append("originalName", options.originalName);

  let res: Response;
  try {
    res = await withTimeout(
      fetch("/api/upload", { method: "POST", body: fd }),
      UPLOAD_FETCH_TIMEOUT_MS,
      "upload-fetch",
    );
  } catch (e) {
    console.error("[uploadAdminAsset] fetch failed", { kind, entityId: options?.entityId, err: e });
    throw e;
  }

  const raw = await res.text();
  let parsed: { path?: string; error?: string } | null = null;
  try {
    parsed = JSON.parse(raw) as { path?: string; error?: string };
  } catch {
    const err = new Error(`Upload failed (HTTP ${res.status})`);
    console.error("[uploadAdminAsset] non-JSON response", { status: res.status, raw: raw.slice(0, 200) });
    throw err;
  }
  if (!res.ok) {
    const msg = uploadHttpErrorMessage(res.status, parsed.error, defaultUploadMessages);
    console.error("[uploadAdminAsset] HTTP error", {
      status: res.status,
      error: parsed.error,
      kind,
      entityId: options?.entityId,
    });
    throw new Error(msg);
  }
  if (!parsed.path) {
    console.error("[uploadAdminAsset] missing path in response", parsed);
    throw new Error("Upload failed: missing path");
  }
  return parsed.path;
}
