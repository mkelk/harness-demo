import { getDb } from "@/lib/db";
import { listTasks } from "@/lib/tasks/repository";
import { AddTaskForm } from "./components/add-task-form";
import { TaskList } from "./components/task-list";

// The list is read from the database on every request, never prerendered.
export const dynamic = "force-dynamic";

export default function Home() {
  const { open, done } = listTasks(getDb());
  return (
    <main className="mx-auto max-w-2xl p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">harness-demo</h1>
        <p className="mt-1 text-sm text-zinc-600">
          A small task manager, built increment by increment with the dmtix
          method.
        </p>
      </header>
      <AddTaskForm />
      <TaskList open={open} done={done} />
    </main>
  );
}
