import { Task } from "./types";

/** "3d 4h" style age from an ISO timestamp until now. */
export function pendingDuration(createdAt: string, until?: string): string {
  const start = new Date(createdAt).getTime();
  const end = until ? new Date(until).getTime() : Date.now();
  let mins = Math.max(0, Math.floor((end - start) / 60000));
  const days = Math.floor(mins / 1440);
  mins -= days * 1440;
  const hours = Math.floor(mins / 60);
  mins -= hours * 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function pendingMs(createdAt: string): number {
  return Date.now() - new Date(createdAt).getTime();
}

export function isOverdue(t: Task): boolean {
  if (t.status === "resolved" || t.status === "closed") return false;
  if (!t.due_date) return false;
  const due = new Date(t.due_date + "T23:59:59");
  return due.getTime() < Date.now();
}

export function isAging(t: Task, days = 3): boolean {
  if (t.status === "resolved" || t.status === "closed") return false;
  return pendingMs(t.created_at) > days * 24 * 60 * 60 * 1000;
}

export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
