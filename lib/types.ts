export type TaskStatus = "open" | "in_progress" | "resolved" | "closed";
export type TaskSource = "gmail" | "slack" | "gsheet" | "manual";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface Member {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  raw_content: string;
  bucket: string;
  source: TaskSource;
  source_link: string;
  status: TaskStatus;
  priority: TaskPriority;
  owner_id: string | null;
  due_date: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface Remark {
  id: string;
  task_id: string;
  author: string;
  body: string;
  kind: string; // remark | status_change | assignment | reply_sent
  created_at: string;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const SOURCE_LABELS: Record<TaskSource, string> = {
  gmail: "Gmail",
  slack: "Slack",
  gsheet: "G-Sheet",
  manual: "Manual",
};
