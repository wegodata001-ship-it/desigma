/** Reference-counted body scroll lock for stacked modals/drawers. */

let lockCount = 0;
let previousOverflow = "";

export function lockBodyScroll(): () => void {
  if (typeof document === "undefined") return () => {};

  lockCount += 1;
  if (lockCount === 1) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  return () => {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.body.style.overflow = previousOverflow;
    }
  };
}

/** Force-unlock (recovery after stuck overlay). */
export function forceUnlockBodyScroll(): void {
  lockCount = 0;
  if (typeof document !== "undefined") {
    document.body.style.overflow = previousOverflow || "";
  }
}
