"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import TaskForm, { EMPTY_TASK, TaskFormValues } from "@/components/TaskForm";
import { parseEscalation } from "@/lib/parseEscalation";

export default function IngestPage() {
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<TaskFormValues | null>(null);

  function parse() {
    const p = parseEscalation(raw);
    setParsed({
      ...EMPTY_TASK,
      title: p.title,
      description: p.description,
      raw_content: raw,
      bucket: p.bucket,
      source: p.source,
      source_link: p.sourceLink,
      priority: p.priority,
    });
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        <div>
          <h1 className="text-xl font-bold">Ingest an escalation</h1>
          <p className="mt-1 text-sm text-slate-500">
            Paste the raw email, Slack message or sheet row. CT APP detects the bucket, priority and
            source — you review, adjust and save.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={8}
            placeholder={`From: seller-support@meesho.com\nSubject: URGENT — invoice mismatch for June freight\n\nTeam, XB invoice INV-2026-0630 is 4.2% above system computed amount…`}
            className="w-full rounded border border-slate-300 px-3 py-2 font-mono text-xs"
          />
          <button
            onClick={parse}
            disabled={!raw.trim()}
            className="mt-3 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-40"
          >
            Detect &amp; prefill →
          </button>
        </div>

        {parsed && (
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Review before saving
            </h2>
            <TaskForm initial={parsed} submitLabel="Save escalation" />
          </div>
        )}
      </main>
    </>
  );
}
