import { TaskPriority, TaskSource } from "./types";

export interface ParsedEscalation {
  title: string;
  bucket: string;
  priority: TaskPriority;
  source: TaskSource;
  sourceLink: string;
  description: string;
}

const BUCKET_RULES: Array<{ bucket: string; words: string[] }> = [
  { bucket: "CEO Escalation", words: ["ceo", "founder", "leadership", "vidit", "top priority from"] },
  { bucket: "Invoice", words: ["invoice", "billing", "gst", "tax note"] },
  { bucket: "Debit", words: ["debit", "recovery", "penalty", "deduction", "chargeback"] },
  { bucket: "Weight Dispute", words: ["weight", "volumetric", "dead weight"] },
  { bucket: "RTO", words: ["rto", "return to origin", "zrto"] },
  { bucket: "Seller Return", words: ["seller return", "return pickup", "reverse pickup"] },
  {
    bucket: "Ops Escalation",
    words: ["pickup", "delivery", "ndr", "otp", "shipment", "delayed", "not delivered", "fake attempt", "pod", "hub", "carrier", "delhivery", "xpressbees", "shadowfax"],
  },
];

function detectBucket(text: string): string {
  const lower = text.toLowerCase();
  for (const rule of BUCKET_RULES) {
    if (rule.words.some((w) => lower.includes(w))) return rule.bucket;
  }
  return "Other";
}

function detectPriority(text: string): TaskPriority {
  const lower = text.toLowerCase();
  if (lower.includes("ceo") || lower.includes("leadership")) return "critical";
  if (lower.includes("urgent") || lower.includes("asap") || lower.includes("immediately") || lower.includes("critical"))
    return "high";
  if (lower.includes("whenever") || lower.includes("low priority")) return "low";
  return "medium";
}

function detectSource(text: string): TaskSource {
  const lower = text.toLowerCase();
  if (/^from:/m.test(lower) || /^subject:/m.test(lower) || lower.includes("@") && lower.includes("subject")) return "gmail";
  if (lower.includes("slack.com/archives") || /#[a-z0-9_-]{3,}/.test(lower) || lower.includes("thread")) return "slack";
  if (lower.includes("docs.google.com/spreadsheets") || lower.includes("sheet")) return "gsheet";
  return "manual";
}

function detectTitle(text: string): string {
  const subject = text.match(/^subject:\s*(.+)$/im);
  if (subject && subject[1].trim()) return clip(subject[1].trim());
  const firstLine = text
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0 && !/^(from|to|cc|date):/i.test(l));
  return clip(firstLine || "Untitled escalation");
}

function detectLink(text: string): string {
  const m = text.match(/https?:\/\/\S+/);
  return m ? m[0].replace(/[>,.)\]]+$/, "") : "";
}

function clip(s: string, n = 120): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

/** Pure heuristic parse of a pasted email / Slack message / sheet row. */
export function parseEscalation(text: string): ParsedEscalation {
  return {
    title: detectTitle(text),
    bucket: detectBucket(text),
    priority: detectPriority(text),
    source: detectSource(text),
    sourceLink: detectLink(text),
    description: clip(text.replace(/\s+/g, " ").trim(), 300),
  };
}
