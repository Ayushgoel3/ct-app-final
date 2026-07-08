"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import { uid, useDB } from "@/lib/store";

export default function TeamPage() {
  const { db, update } = useDB();
  const [name, setName] = useState("");

  function addMember() {
    const n = name.trim();
    if (!n) return;
    update((d) => ({ ...d, members: [...d.members, { id: uid(), name: n }] }));
    setName("");
  }

  function removeMember(id: string) {
    if (!confirm("Remove this member? Their tasks become unassigned.")) return;
    update((d) => ({
      ...d,
      members: d.members.filter((m) => m.id !== id),
      tasks: d.tasks.map((t) => (t.owner_id === id ? { ...t, owner_id: null } : t)),
      me: d.me === id ? null : d.me,
    }));
  }

  if (!db)
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-4xl p-6 text-slate-400">Loading…</main>
      </>
    );

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="text-xl font-bold">Team</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add your teammates here, then assign escalations to them.
        </p>

        <div className="mt-4 flex max-w-md gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMember()}
            placeholder="Teammate name (e.g. Shruti Agrawal)"
            className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            onClick={addMember}
            disabled={!name.trim()}
            className="rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-40"
          >
            Add member
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5">Member</th>
                <th className="px-4 py-2.5 text-right">Open</th>
                <th className="px-4 py-2.5 text-right">In progress</th>
                <th className="px-4 py-2.5 text-right">Resolved</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {db.members.map((m) => {
                const mine = db.tasks.filter((t) => t.owner_id === m.id);
                const n = (s: string) => mine.filter((t) => t.status === s).length;
                return (
                  <tr key={m.id} className="border-t border-slate-100">
                    <td className="px-4 py-2.5 font-medium">
                      {m.name}
                      {db.me === m.id && (
                        <span className="ml-2 rounded bg-sky-100 px-1.5 py-0.5 text-xs text-sky-700">
                          you
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">{n("open")}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{n("in_progress")}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{n("resolved")}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => removeMember(m.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        remove
                      </button>
                    </td>
                  </tr>
                );
              })}
              {db.members.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No members yet — add the team above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Note: in this version data is stored in the browser (localStorage) — each person sees
          their own copy. The Supabase version shares one database across the whole team.
        </p>
      </main>
    </>
  );
}
