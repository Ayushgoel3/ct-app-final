"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import { BucketBadge, StatusBadge } from "@/components/Badges";
import { memberName, useDB } from "@/lib/store";
import { isAging, isOverdue, pendingDuration, pendingMs } from "@/lib/format";

export default function DashboardPage() {
  const { db } = useDB();

  if (!db)
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-6xl p-6 text-slate-400">Loading…</main>
      </>
    );

  const tasks = db.tasks;
  const active = tasks.filter((t) => t.status === "open" || t.status === "in_progress");
  const overdue = tasks.filter(isOverdue);
  const unassigned = active.filter((t) => !t.owner_id);
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const resolvedThisWeek = tasks.filter(
    (t) => t.resolved_at && new Date(t.resolved_at).getTime() > weekAgo
  );

  const bucketCounts = new Map<string, number>();
  for (const t of active) bucketCounts.set(t.bucket, (bucketCounts.get(t.bucket) ?? 0) + 1);

  const byOwner = db.members
    .map((m) => {
      const mine = tasks.filter((t) => t.owner_id === m.id);
      const open = mine.filter((t) => t.status === "open");
      const inProg = mine.filter((t) => t.status === "in_progress");
      const activeMine = [...open, ...inProg].sort(
        (a, b) => pendingMs(b.created_at) - pendingMs(a.created_at)
      );
      return {
        member: m,
        open: open.length,
        inProgress: inProg.length,
        oldest: activeMine[0] ? pendingDuration(activeMine[0].created_at) : "—",
      };
    })
    .sort((a, b) => b.open + b.inProgress - (a.open + a.inProgress));

  const aging = [...active].sort((a, b) => pendingMs(b.created_at) - pendingMs(a.created_at));

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-6">
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card label="Open + in progress" value={active.length} tone="text-slate-900" />
          <Card label="Overdue" value={overdue.length} tone={overdue.length ? "text-red-600" : "text-slate-900"} />
          <Card label="Unassigned" value={unassigned.length} tone={unassigned.length ? "text-orange-600" : "text-slate-900"} />
          <Card label="Resolved this week" value={resolvedThisWeek.length} tone="text-emerald-600" />
        </section>

        {tasks.length === 0 && (
          <section className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-lg font-medium">No escalations yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Click <span className="font-semibold">⟳ Sync Gmail / Slack / Sheets</span> in the top bar
              to pull escalations, or paste one on the{" "}
              <Link href="/ingest" className="text-sky-600 underline">
                Ingest
              </Link>{" "}
              page.
            </p>
          </section>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Open by bucket
            </h2>
            <div className="mt-4 space-y-2">
              {Array.from(bucketCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([bucket, count]) => (
                  <Link
                    key={bucket}
                    href={`/tasks?bucket=${encodeURIComponent(bucket)}`}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-50"
                  >
                    <BucketBadge bucket={bucket} />
                    <span className="font-mono text-sm font-semibold">{count}</span>
                  </Link>
                ))}
              {bucketCounts.size === 0 && (
                <p className="text-sm text-slate-400">Nothing open right now.</p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Who is working on what
            </h2>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-2">Owner</th>
                  <th className="pb-2 text-right">Open</th>
                  <th className="pb-2 text-right">In progress</th>
                  <th className="pb-2 text-right">Oldest pending</th>
                </tr>
              </thead>
              <tbody>
                {byOwner.map((row) => (
                  <tr key={row.member.id} className="border-t border-slate-100">
                    <td className="py-2">{row.member.name}</td>
                    <td className="py-2 text-right font-mono">{row.open}</td>
                    <td className="py-2 text-right font-mono">{row.inProgress}</td>
                    <td className="py-2 text-right font-mono">{row.oldest}</td>
                  </tr>
                ))}
                {unassigned.length > 0 && (
                  <tr className="border-t border-slate-100 text-orange-700">
                    <td className="py-2 font-medium">Unassigned</td>
                    <td className="py-2 text-right font-mono">{unassigned.length}</td>
                    <td className="py-2 text-right font-mono">—</td>
                    <td className="py-2 text-right font-mono">
                      {unassigned[0] ? pendingDuration(unassigned[0].created_at) : "—"}
                    </td>
                  </tr>
                )}
                {byOwner.length === 0 && unassigned.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-3 text-sm text-slate-400">
                      Add team members on the Team page, then assign owners.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Aging — pending duration
          </h2>
          <div className="mt-3 divide-y divide-slate-100">
            {aging.slice(0, 12).map((t) => {
              const hot = isOverdue(t) || isAging(t);
              return (
                <Link
                  key={t.id}
                  href={`/tasks/${t.id}`}
                  className={`flex flex-wrap items-center gap-3 py-2.5 hover:bg-slate-50 ${
                    hot ? "bg-red-50/60" : ""
                  }`}
                >
                  <span
                    className={`w-20 shrink-0 font-mono text-sm font-semibold ${
                      hot ? "text-red-600" : "text-slate-700"
                    }`}
                  >
                    {pendingDuration(t.created_at)}
                  </span>
                  <BucketBadge bucket={t.bucket} />
                  <span className="min-w-0 flex-1 truncate text-sm">{t.title}</span>
                  <StatusBadge status={t.status} />
                  <span className="text-xs text-slate-500">
                    {memberName(db, t.owner_id) ?? "Unassigned"}
                  </span>
                </Link>
              );
            })}
            {aging.length === 0 && tasks.length > 0 && (
              <p className="py-3 text-sm text-slate-400">Everything is resolved. 🎉</p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

function Card({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 font-mono text-3xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}
