"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addRemark, memberName, uid, useDB } from "@/lib/store";
import { Task, TaskPriority, TaskSource } from "@/lib/types";

export interface TaskFormValues {
  title: string;
  description: string;
  raw_content: string;
  bucket: string;
  source: TaskSource;
  source_link: string;
  priority: TaskPriority;
  owner_id: string;
  due_date: string;
}

export const EMPTY_TASK: TaskFormValues = {
  title: "",
  description: "",
  raw_content: "",
  bucket: "Other",
  source: "manual",
  source_link: "",
  priority: "medium",
  owner_id: "",
  due_date: "",
};

export default function TaskForm({
  initial,
  submitLabel = "Create task",
}: {
  initial: TaskFormValues;
  submitLabel?: string;
}) {
  const router = useRouter();
  const { db, update } = useDB();
  const [v, setV] = useState<TaskFormValues>(initial);
  const [newBucket, setNewBucket] = useState("");
  const [error, setError] = useState("");

  useEffect(() => setV(initial), [initial]);

  function set<K extends keyof TaskFormValues>(k: K, val: TaskFormValues[K]) {
    setV((p) => ({ ...p, [k]: val }));
  }

  function addBucket() {
    const name = newBucket.trim();
    if (!name) return;
    update((d) => ({ ...d, buckets: d.buckets.includes(name) ? d.buckets : [...d.buckets, name] }));
    set("bucket", name);
    setNewBucket("");
  }

  function submit() {
    if (!v.title.trim()) {
      setError("Title is required.");
      return;
    }
    setError("");
    const task: Task = {
      id: uid(),
      title: v.title.trim(),
      description: v.description.trim(),
      raw_content: v.raw_content,
      bucket: v.bucket,
      source: v.source,
      source_link: v.source_link.trim(),
      priority: v.priority,
      owner_id: v.owner_id || null,
      due_date: v.due_date || null,
      status: "open",
      created_at: new Date().toISOString(),
      resolved_at: null,
    };
    update((d) => {
      let next = { ...d, tasks: [task, ...d.tasks] };
      if (task.owner_id) {
        const name = memberName(d, task.owner_id);
        next = addRemark(next, task.id, `Assigned to ${name ?? "owner"} at creation`, "assignment");
      }
      return next;
    });
    router.push(`/tasks/${task.id}`);
  }

  if (!db) return null;

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <Field label="Title *">
        <input
          value={v.title}
          onChange={(e) => set("title", e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="One-line summary of the escalation"
        />
      </Field>
      <Field label="Description">
        <textarea
          value={v.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Bucket">
          <select
            value={v.bucket}
            onChange={(e) => set("bucket", e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            {db.buckets.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
            {!db.buckets.includes(v.bucket) && <option value={v.bucket}>{v.bucket}</option>}
          </select>
          <div className="mt-2 flex gap-2">
            <input
              value={newBucket}
              onChange={(e) => setNewBucket(e.target.value)}
              placeholder="Add a new bucket…"
              className="flex-1 rounded border border-slate-300 px-3 py-1.5 text-xs"
            />
            <button
              onClick={addBucket}
              disabled={!newBucket.trim()}
              className="rounded border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </Field>
        <Field label="Owner">
          <select
            value={v.owner_id}
            onChange={(e) => set("owner_id", e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Unassigned</option>
            {db.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">Add teammates on the Team page.</p>
        </Field>
        <Field label="Source">
          <select
            value={v.source}
            onChange={(e) => set("source", e.target.value as TaskSource)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="gmail">Gmail</option>
            <option value="slack">Slack</option>
            <option value="gsheet">G-Sheet</option>
            <option value="manual">Manual</option>
          </select>
        </Field>
        <Field label="Source link (mail / thread / sheet URL)">
          <input
            value={v.source_link}
            onChange={(e) => set("source_link", e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="https://…"
          />
        </Field>
        <Field label="Priority">
          <select
            value={v.priority}
            onChange={(e) => set("priority", e.target.value as TaskPriority)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </Field>
        <Field label="Due date">
          <input
            type="date"
            value={v.due_date}
            onChange={(e) => set("due_date", e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </Field>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={submit}
        className="rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
      >
        {submitLabel}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
