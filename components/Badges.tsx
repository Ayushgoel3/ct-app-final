import { SOURCE_LABELS, STATUS_LABELS, TaskPriority, TaskSource, TaskStatus } from "@/lib/types";

const BUCKET_COLORS: Record<string, string> = {
  "Ops Escalation": "bg-sky-100 text-sky-800 border-sky-200",
  "CEO Escalation": "bg-rose-100 text-rose-800 border-rose-200",
  Debit: "bg-amber-100 text-amber-800 border-amber-200",
  Invoice: "bg-violet-100 text-violet-800 border-violet-200",
  "Weight Dispute": "bg-teal-100 text-teal-800 border-teal-200",
  RTO: "bg-orange-100 text-orange-800 border-orange-200",
  "Seller Return": "bg-lime-100 text-lime-800 border-lime-200",
  Other: "bg-slate-100 text-slate-700 border-slate-200",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  open: "bg-red-50 text-red-700 border-red-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "text-slate-500",
  medium: "text-slate-700",
  high: "text-orange-600 font-semibold",
  critical: "text-red-600 font-bold",
};

const SOURCE_ICONS: Record<TaskSource, string> = {
  gmail: "✉️",
  slack: "💬",
  gsheet: "📊",
  manual: "📝",
};

export function BucketBadge({ bucket }: { bucket: string }) {
  const cls = BUCKET_COLORS[bucket] || BUCKET_COLORS.Other;
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {bucket}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityText({ priority }: { priority: TaskPriority }) {
  return <span className={`text-xs uppercase tracking-wide ${PRIORITY_COLORS[priority]}`}>{priority}</span>;
}

export function SourceTag({ source }: { source: TaskSource }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-600" title={SOURCE_LABELS[source]}>
      <span aria-hidden>{SOURCE_ICONS[source]}</span>
      {SOURCE_LABELS[source]}
    </span>
  );
}
