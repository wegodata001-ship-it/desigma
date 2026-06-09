"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BusinessContactRow,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@/components/storefront/business-icons";

export function ContactPageClient({
  businessName,
  address,
  phone,
  email,
}: {
  businessName: string;
  address: string;
  phone: string;
  email: string;
}) {
  const [name, setName] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phoneInput || null,
          email: emailInput || null,
          message,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "שליחה נכשלה");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שליחה נכשלה");
    } finally {
      setPending(false);
    }
  }

  return (
    <div dir="rtl" className="mx-auto max-w-xl px-4 py-12">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-500">{businessName}</p>
      <h1 className="mt-2 text-3xl font-black text-white">צור קשר</h1>
      <p className="mt-2 text-sm text-zinc-400">נשמח לעזור בכל שאלה לגבי הזמנה, משלוח או החזרה.</p>

      <div className="mt-8 space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 text-sm">
        <BusinessContactRow icon={<IconMapPin />}>{address}</BusinessContactRow>
        <BusinessContactRow icon={<IconPhone />} href={`tel:${phone.replace(/\D/g, "")}`}>
          {phone}
        </BusinessContactRow>
        <BusinessContactRow icon={<IconMail />} href={`mailto:${email}`}>
          {email}
        </BusinessContactRow>
      </div>

      {done ? (
        <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center text-emerald-100">
          <p className="font-semibold">הפנייה נשלחה בהצלחה</p>
          <p className="mt-2 text-sm text-emerald-200/80">נחזור אליך בהקדם.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-orange-400 hover:underline">
            חזרה לחנות
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
          <label className="block text-sm text-zinc-300">
            שם *
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
          <label className="block text-sm text-zinc-300">
            טלפון
            <input
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
              dir="ltr"
            />
          </label>
          <label className="block text-sm text-zinc-300">
            אימייל
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
              dir="ltr"
            />
          </label>
          <label className="block text-sm text-zinc-300">
            הודעה *
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-50"
          >
            {pending ? "שולח…" : "שלח פנייה"}
          </button>
        </form>
      )}

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/terms" className="text-orange-400 hover:underline">
          תקנון
        </Link>
        <Link href="/privacy" className="text-orange-400 hover:underline">
          פרטיות
        </Link>
        <Link href="/refunds" className="text-orange-400 hover:underline">
          ביטולים
        </Link>
        <Link href="/shipping" className="text-orange-400 hover:underline">
          משלוחים
        </Link>
        <Link href="/legal" className="text-orange-400 hover:underline">
          מידע משפטי
        </Link>
      </div>
    </div>
  );
}
