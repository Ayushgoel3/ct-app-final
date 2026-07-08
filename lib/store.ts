"use client";

import { useEffect, useState } from "react";
import { Member, Remark, Task } from "./types";

export interface DB {
  tasks: Task[];
  remarks: Remark[];
  members: Member[];
  buckets: string[];
  me: string | null; // member id of "who am I"
}

const KEY = "ct-app-db-v1";
export const EVT = "ct-app:data-changed";

const DEFAULT_BUCKETS = [
  "Ops Escalation",
  "CEO Escalation",
  "Debit",
  "Invoice",
  "Weight Dispute",
  "RTO",
  "Seller Return",
  "Other",
];

function emptyDB(): DB {
  return { tasks: [], remarks: [], members: [], buckets: [...DEFAULT_BUCKETS], me: null };
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

export function loadDB(): DB {
  if (typeof window === "undefined") return emptyDB();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyDB();
    const db = JSON.parse(raw) as DB;
    if (!db.buckets || db.buckets.length === 0) db.buckets = [...DEFAULT_BUCKETS];
    return { ...emptyDB(), ...db };
  } catch {
    return emptyDB();
  }
}

export function saveDB(db: DB) {
  localStorage.setItem(KEY, JSON.stringify(db));
  window.dispatchEvent(new Event(EVT));
}

/** React hook: live view of the DB + an update function. */
export function useDB() {
  const [db, setDb] = useState<DB | null>(null);

  useEffect(() => {
    const refresh = () => setDb(loadDB());
    refresh();
    window.addEventListener(EVT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  function update(fn: (db: DB) => DB) {
    saveDB(fn(loadDB()));
  }

  return { db, update };
}

export function memberName(db: DB, id: string | null): string | null {
  if (!id) return null;
  return db.members.find((m) => m.id === id)?.name ?? null;
}

export function myName(db: DB): string {
  return memberName(db, db.me) ?? "Someone";
}

export function addRemark(
  db: DB,
  taskId: string,
  body: string,
  kind: string
): DB {
  const remark: Remark = {
    id: uid(),
    task_id: taskId,
    author: myName(db),
    body,
    kind,
    created_at: new Date().toISOString(),
  };
  return { ...db, remarks: [...db.remarks, remark] };
}
