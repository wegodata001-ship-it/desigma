"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteContactLead, markContactLeadRead } from "@/app/admin/actions";

export type ContactLeadRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  createdAt: string;
  isRead: boolean;
};

export function ContactsAdminClient({
  rows,
  filter,
  q,
}: {
  rows: ContactLeadRow[];
  filter: "all" | "unread" | "read";
  q: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const unread = useMemo(() => rows.filter((r) => !r.isRead).length, [rows]);

  const refresh = () => startTransition(() => router.refresh());

  return (
    <div className="space-y-5">
      {toast && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">{toast}</div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Contact leads</h1>
          <p className="text-sm text-slate-500">
            {unread > 0 ? `${unread} unread` : "All caught up"} · newest first
          </p>
        </div>
        <form className="flex flex-wrap gap-2" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, email, phone…"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <select name="filter" defaultValue={filter} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
            Filter
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {rows.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No contact leads yet.
          </p>
        )}
        {rows.map((r) => (
          <article
            key={r.id}
            className={`rounded-xl border bg-white p-4 shadow-sm ${r.isRead ? "border-slate-200" : "border-orange-300 ring-1 ring-orange-200"}`}
          >
            <p className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-900">{r.name}</span>
              {!r.isRead && (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-700">
                  New
                </span>
              )}
              <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleString("he-IL")}</span>
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {r.phone && <span className="me-3">{r.phone}</span>}
              {r.email && <span>{r.email}</span>}
            </p>
            <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-800">{r.message}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {r.phone && (
                <a
                  href={`https://wa.me/${r.phone.replace(/\D/g, "").replace(/^0/, "972")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"
                >
                  WhatsApp
                </a>
              )}
              {r.email && (
                <a href={`mailto:${r.email}`} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">
                  Email
                </a>
              )}
              {!r.isRead && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={async () => {
                    const fd = new FormData();
                    fd.set("id", r.id);
                    const res = await markContactLeadRead(fd);
                    if (!res.ok) setToast(res.error);
                    else refresh();
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Mark read
                </button>
              )}
              <button
                type="button"
                disabled={pending}
                onClick={async () => {
                  if (!confirm("Delete this lead?")) return;
                  const fd = new FormData();
                  fd.set("id", r.id);
                  const res = await deleteContactLead(fd);
                  if (!res.ok) setToast(res.error);
                  else {
                    setToast("Deleted");
                    refresh();
                  }
                }}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
