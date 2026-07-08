"use client";

import Nav from "@/components/Nav";
import TaskForm, { EMPTY_TASK } from "@/components/TaskForm";

export default function NewTaskPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-xl font-bold">Create a task</h1>
        <p className="mt-1 text-sm text-slate-500">
          Log anything that needs an owner and a timeline — escalations, follow-ups, RCAs.
        </p>
        <div className="mt-4">
          <TaskForm initial={EMPTY_TASK} />
        </div>
      </main>
    </>
  );
}
