import type { Metadata } from "next";
import Link from "next/link";
import { TrackOrderForm } from "@/components/storefront/track-order-form";
import { createSiteMetadata } from "@/lib/site-metadata";
import { SITE_NAME } from "@/lib/store";

export const metadata: Metadata = createSiteMetadata("מעקב הזמנה");

export default function TrackOrderSearchPage() {
  return (
    <div dir="rtl" className="mx-auto max-w-md px-4 py-12 md:py-16">
      <div className="mb-8 text-center">
        <Link href="/" className="text-2xl font-black text-white">
          {SITE_NAME}
        </Link>
        <h1 className="mt-6 text-3xl font-black text-white">מעקב הזמנה</h1>
        <p className="mt-2 text-sm text-zinc-400">הזינו מספר הזמנה ואימייל לצפייה בסטטוס המשלוח</p>
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl backdrop-blur-sm">
        <TrackOrderForm />
      </div>
    </div>
  );
}
