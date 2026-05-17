/** Temporary gallery settings save tracing — dev or GALLERY_SETTINGS_DEBUG=true */
export function gallerySettingsDebug(step: string, detail?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "production" && process.env.GALLERY_SETTINGS_DEBUG !== "true") return;
  console.log(
    JSON.stringify({
      scope: "gallery_settings_save",
      step,
      ts: new Date().toISOString(),
      ...detail,
    }),
  );
}
