export type StudioBackground = "white" | "black" | "gray" | "transparent";

export const STUDIO_BG_HEX: Record<StudioBackground, string> = {
  white: "#ffffff",
  black: "#000000",
  gray: "#f3f4f6",
  transparent: "transparent",
};

export const STUDIO_DISPLAY_MAX = 1600;
export const STUDIO_THUMB_MAX = 500;
export const STUDIO_WEBP_QUALITY = 0.91;
export const STUDIO_ORIGINAL_MAX = 2400;

export type StudioExportBundle = {
  display: File;
  thumb: File;
  original: File;
};
