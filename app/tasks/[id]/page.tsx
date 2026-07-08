"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import { BucketBadge, PriorityText, SourceTag, StatusBadge } from "@/components/Badges";
import { addRemark, memberName, useDB } from "@/lib/store";
import { Task, TaskPriority, TaskStatus } from "@/lib/types";
import { fmtDateTime, isOverdue, pendingDuration } from "@/lib/format";

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { db, update } = useDB();
  const [newRemark, setNewRemark] = useState("");
  const [reply, setReply] = useState("");
  const [showRaw, setShowRaw] = useState(false);
  const [flash, setFlash] = useState("");

  if (!db)
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-4xl p-6 text-slate-400">Loading…</main>
      </>
    );

  const task = db.tasks.find((t) => t.id === id);
  if (!task)
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-4xl p-6">
          <p className="text-slate-500">This escalation no longer exists.</p>
          <Link href="/tasks" className="text-sm text-sky-600 hover:underline">
            ← Back to tracker
          </Link>
        </main>
      </>
    );

  const remarks = db.remarks
    .filter((r) => r.task_id === id)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  function patchTask(p: Partial<Task>, logBody: string, kind: string) {
    update((d) => {
      const next = {
        ...d,
        tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...p } : t)),
      };
      return addRemark(next, id, logBody, kind);
    });
  }

  function changeStatus(status: TaskStatus) {
    const p: Partial<Task> = { status };
    if (status === "resolved") p.resolved_at = new Date().toISOString();
    if (status === "open" || status === "in_progress") p.resolved_at = null;
    patchTask(p, `Status changed to ${status.replace("_", " ")}`, "status_change");
  }

  function changeOwner(ownerId: string) {
    const name = memberName(db!, ownerId || null);
    patchTask(
      { owner_id: ownerId || null },
      name ? `Assigned to ${name}` : "Owner removed",
      "assignment"
    );
  }

  function submitRemark() {
    if (!newRemark.trim()) return;
    update((d) => addRemark(d, id, newRemark.trim(), "remark"));
    setNewRemark("");
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setFlash("Copied to clipboard");
    } catch {
      setFlash("Copy failed — select and copy manually");
    }
    setTimeout(() => setFlash(""), 2500);
  }

  async function sendReply(channel: "gmail" | "slack" | "gsheet") {
    if (!reply.trim()) return;
    const text = reply.trim();
    await copyText(text);
    if (channel === "gmail") {
      const mailto = `mailto:?subject=${encodeURIComponent("Re: " + task!.title)}&body=${encodeURIComponent(text)}`;
      window.open(mailto, "_blank");
    } else if (task!.source_link) {
      window.open(task!.source_link, "_blank");
    }
    update((d) => addRemark(d, id, `Reply sent via ${channel}: "${text}"`, "reply_sent"));
    setReply("");
  }

  function deleteTask() {
    if (!confirm("Delete this escalation permanently?")) return;
    update((d) => ({
      ...d,
      tasks: d.tasks.filter((t) => t.id !== id),
      remarks: d.remarks.filter((r) => r.task_id !== id),
    }));
    router.replace("/tasks");
  }

  const activeAge =
    task.status === "resolved" || task.status === "closed"
      ? null
      : pendingDuration(task.created_at);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        {flash && <div className="rounded bg-emerald-600 px-4 py-2 text-sm text-white">{flash}</div>}

        <Link href="/tasks" className="text-sm text-sky-600 hover:underline">
          ← Back to tracker
        </Link>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center gap-2">
            <BucketBadge bucket={task.bucket} />
            <StatusBadge status={task.status} />
            <PriorityText priority={task.priority} />
            <SourceTag source={task.source} />
            {activeAge && (
              <span
                className={`ml-auto font-mono text-sm font-semibold ${
                  isOverdue(task) ? "text-red-600" : "text-slate-600"
                }`}
              >
                pending {activeAge}
              </span>
            )}
          </div>
          <h1 className="mt-3 text-xl font-bold leading-snug">{task.title}</h1>
          {task.description && <p className="mt-2 text-sm text-slate-600">{task.description}</p>}
          {task.source_link && (
            <a
              href={task.source_link}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm text-sky-600 hover:underline"
            >
              Open original thread ↗
            </a>
          )}
          {task.raw_content && (
            <div className="mt-3">
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                {showRaw ? "▾ Hide original message" : "▸ Show original message"}
              </button>
              {showRaw && (
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-700">
                  {task.raw_content}
                </pre>
              )}
            </div>
          )}
        </section>

        <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
          <Control label="Owner">
            <select
              value={task.owner_id ?? ""}
              onChange={(e) => changeOwner(e.target.value)}
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">Unassigned</option>
              {db.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </Control>
          <Control label="Status">
            <select
              value={task.status}
              onChange={(e) => changeStatus(e.target.value as TaskStatus)}
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </Control>
          <Control label="Priority">
            <select
              value={task.priority}
              onChange={(e) =>
                patchTask(
                  { priority: e.target.value as TaskPriority },
                  `Priority set to ${e.target.value}`,
                  "status_change"
                )
              }
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </Control>
          <Control label="Due date">
            <input
              type="date"
              value={task.due_date ?? ""}
              onChange={(e) =>
                patchTask(
                  { due_date: e.target.value || null },
                  e.target.value ? `Due date set to ${e.target.value}` : "Due date cleared",
                  "status_change"
                )
              }
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
          </Control>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Reply / update at source
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Compose once — send to the original mail, Slack thread or sheet. The reply is copied to
            your clipboard and logged below.
          </p>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            placeholder="e.g. RCA in progress — carrier has shared POD for 9/14 cases. ETA Friday."
            className="mt-3 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => sendReply("gmail")}
              disabled={!reply.trim()}
              className="rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-40"
            >
              ✉️ Reply via Gmail
            </button>
            <button
              onClick={() => sendReply("slack")}
              disabled={!reply.trim()}
              className="rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-40"
            >
              💬 Post in Slack thread
            </button>
            <button
              onClick={() => sendReply("gsheet")}
              disabled={!reply.trim()}
              className="rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-40"
            >
              📊 Update G-Sheet
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Activity &amp; remarks
          </h2>
          <div className="mt-3 space-y-3">
            {remarks.map((r) => (
              <div key={r.id} className="flex gap-3 text-sm">
                <span className="mt-0.5 shrink-0" aria-hidden>
                  {r.kind === "remark"
                    ? "💬"
                    : r.kind === "reply_sent"
                      ? "📤"
                      : r.kind === "assignment"
                        ? "👤"
                        : "🔁"}
                </span>
                <div>
                  <p className={r.kind === "remark" ? "text-slate-800" : "text-slate-500"}>{r.body}</p>
                  <p className="text-xs text-slate-400">
                    {r.author} · {fmtDateTime(r.created_at)}
                  </p>
                </div>
              </div>
            ))}
            {remarks.length === 0 && <p className="text-sm text-slate-400">No activity yet.</p>}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={newRemark}
              onChange={(e) => setNewRemark(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitRemark()}
              placeholder="Add a remark…"
              className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              onClick={submitRemark}
              disabled={!newRemark.trim()}
              className="rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </section>

        <button onClick={deleteTask} className="text-xs text-red-500 hover:underline">
          Delete this escalation
        </button>
      </main>
    </>
  );
}

function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
