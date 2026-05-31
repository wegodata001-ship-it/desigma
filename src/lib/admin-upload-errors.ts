export type UploadErrorMessages = {
  imageSaveFailed: string;
  fileTooLarge: string;
  uploadUnauthorized: string;
  uploadForbidden: string;
  uploadServerError: string;
  uploadTimeout: string;
  uploadStorageUnavailable: string;
};

export function resolveUploadErrorMessage(
  err: unknown,
  messages: UploadErrorMessages,
): string {
  if (err instanceof Error) {
    if (err.message === "FILE_TOO_LARGE") return messages.fileTooLarge;
    if (err.message.startsWith("TIMEOUT:")) return messages.uploadTimeout;
    if (/401|Unauthorized/i.test(err.message)) return messages.uploadUnauthorized;
    if (/403|Forbidden/i.test(err.message)) return messages.uploadForbidden;
    if (/413|too large/i.test(err.message)) return messages.fileTooLarge;
    if (/50[03]|503|Storage|unavailable/i.test(err.message)) return messages.uploadStorageUnavailable;
    if (err.message.length > 0 && err.message !== "Upload failed") return err.message;
  }
  return messages.imageSaveFailed;
}

export function uploadHttpErrorMessage(
  status: number,
  serverError: string | undefined,
  messages: UploadErrorMessages,
): string {
  if (status === 401) return messages.uploadUnauthorized;
  if (status === 403) return messages.uploadForbidden;
  if (status === 413) return messages.fileTooLarge;
  if (status === 503) return messages.uploadStorageUnavailable;
  if (status >= 500) return messages.uploadServerError;
  return serverError?.trim() || messages.imageSaveFailed;
}
