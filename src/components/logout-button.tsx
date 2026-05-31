"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LogoutButton({ label = "התנתקות", className }: { label?: string; className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className={className ?? "w-full text-start hover:text-orange-400 disabled:opacity-60"}
      onClick={() => {
        startTransition(async () => {
          try {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
          } finally {
            router.push("/");
            router.refresh();
          }
        });
      }}
    >
      {pending ? "…" : label}
    </button>
  );
}
