"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { uid, useDB } from "@/lib/store";
import { SAMPLE_ESCALATIONS } from "@/lib/sampleEscalations";
import { Task } from "@/lib/types";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/tasks", label: "Tracker" },
  { href: "/ingest", label: "Ingest" },
  { href: "/tasks/new", label: "New task" },
  { href: "/team", label: "Team" },
];

export default function Nav() {
  const pathname = usePathname();
  const { db, update } = useDB();
  const [toast, setToast] = useState("");

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  }

  function simulatedSync() {
    const rows: Task[] = SAMPLE_ESCALATIONS.map((s) => ({
      id: uid(),
      title: s.title,
      description: s.description,
      raw_content: s.raw_content,
      bucket: s.bucket,
      source: s.source,
      source_link: s.source_link,
      priority: s.priority,
      status: "open",
      owner_id: null,
      due_date: null,
      created_at: new Date(Date.now() - s.hoursAgo * 3600 * 1000).toISOString(),
      resolved_at: null,
    }));
    update((d) => ({ ...d, tasks: [...rows, ...d.tasks] }));
    flash(`${rows.length} new escalations pulled from Gmail / Slack / Sheets`);
  }

  function setMe(id: string) {
    if (id === "__add__") {
      const name = prompt("Your name?");
      if (!name?.trim()) return;
      const m = { id: uid(), name: name.trim() };
      update((d) => ({ ...d, members: [...d.members, m], me: m.id }));
      return;
    }
    update((d) => ({ ...d, me: id || null }));
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          CT <span className="text-sky-400">APP</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded px-3 py-1.5 transition-colors ${
                pathname === l.href
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={simulatedSync}
            className="rounded bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-500"
            title="Simulates pulling new escalations from Gmail, Slack and Sheets"
          >
            ⟳ Sync Gmail / Slack / Sheets
          </button>
          <label className="flex items-center gap-1.5 text-xs text-slate-400">
            You:
            <select
              value={db?.me ?? ""}
              onChange={(e) => setMe(e.target.value)}
              className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-100"
            >
              <option value="">— pick —</option>
              {db?.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
              <option value="__add__">+ Add me…</option>
            </select>
          </label>
        </div>
      </div>
      {toast && (
        <div className="bg-emerald-600 px-4 py-2 text-center text-sm text-white">{toast}</div>
      )}
    </header>
  );
}
