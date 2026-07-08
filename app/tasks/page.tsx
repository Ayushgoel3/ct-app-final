"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import { BucketBadge, PriorityText, SourceTag, StatusBadge } from "@/components/Badges";
import { memberName, useDB } from "@/lib/store";
import { fmtDate, isAging, isOverdue, pendingDuration } from "@/lib/format";

export default function TrackerPage() {
  return (
    <>
      <Nav />
      <Suspense fallback={<main className="p-6 text-slate-400">Loading…</main>}>
        <Tracker />
      </Suspense>
    </>
  );
}

function Tracker() {
  const params = useSearchParams();
  const { db } = useDB();

  const [fBucket, setFBucket] = useState(params.get("bucket") ?? "");
  const [fOwner, setFOwner] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fSource, setFSource] = useState("");
  const [q, setQ] = useState("");

  const tasks = db?.tasks ?? [];

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (fBucket && t.bucket !== fBucket) return false;
      if (fStatus && t.status !== fStatus) return false;
      if (fSource && t.source !== fSource) return false;
      if (fOwner === "unassigned" && t.owner_id) return false;
      if (fOwner && fOwner !== "unassigned" && t.owner_id !== fOwner) return false;
      if (q) {
        const hay = `${t.title} ${t.description} ${t.bucket}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [tasks, fBucket, fStatus, fSource, fOwner, q]);

  if (!db) return <main className="p-6 text-slate-400">Loading…</main>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-xl font-bold">Escalation tracker</h1>
        <Link
          href="/tasks/new"
          className="rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          + New task
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title / description…"
          className="w-56 rounded border border-slate-300 px-3 py-1.5 text-sm"
        />
        <Select value={fBucket} onChange={setFBucket} label="All buckets" options={db.buckets} />
        <Select
          value={fStatus}
          onChange={setFStatus}
          label="All statuses"
          options={["open", "in_progress", "resolved", "closed"]}
        />
        <Select
          value={fSource}
          onChange={setFSource}
          label="All sources"
          options={["gmail", "slack", "gsheet", "manual"]}
        />
        <select
          value={fOwner}
          onChange={(e) => setFOwner(e.target.value)}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">All owners</option>
          <option value="unassigned">Unassigned</option>
          {db.members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2.5">Escalation</th>
              <th className="px-3 py-2.5">Bucket</th>
              <th className="px-3 py-2.5">Source</th>
              <th className="px-3 py-2.5">Owner</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Priority</th>
              <th className="px-3 py-2.5">Pending</th>
              <th className="px-3 py-2.5">Due</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const hot = isOverdue(t) || isAging(t);
              return (
                <tr
                  key={t.id}
                  className={`border-t border-slate-100 hover:bg-slate-50 ${hot ? "bg-red-50/50" : ""}`}
                >
                  <td className="max-w-xs px-3 py-2.5">
                    <Link href={`/tasks/${t.id}`} className="font-medium text-slate-900 hover:text-sky-600">
                      <span className="line-clamp-2">{t.title}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5">
                    <BucketBadge bucket={t.bucket} />
                  </td>
                  <td className="px-3 py-2.5">
                    <SourceTag source={t.source} />
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">
                    {memberName(db, t.owner_id) ?? <span className="text-orange-600">Unassigned</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-3 py-2.5">
                    <PriorityText priority={t.priority} />
                  </td>
                  <td className={`px-3 py-2.5 font-mono ${hot ? "font-semibold text-red-600" : ""}`}>
                    {t.status === "resolved" || t.status === "closed" ? "—" : pendingDuration(t.created_at)}
                  </td>
                  <td className={`px-3 py-2.5 ${isOverdue(t) ? "font-semibold text-red-600" : "text-slate-600"}`}>
                    {fmtDate(t.due_date)}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-400">
                  No escalations match. Try the ⟳ Sync button or the Ingest page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        {filtered.length} of {tasks.length} escalations shown · red rows are overdue or pending &gt; 3 days
      </p>
    </main>
  );
}

function Select({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border border-slate-300 px-3 py-1.5 text-sm"
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
