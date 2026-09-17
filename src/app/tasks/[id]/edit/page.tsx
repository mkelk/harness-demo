import { notFound } from "next/navigation";
import { EditTaskForm } from "@/app/components/edit-task-form";
import { getDb } from "@/lib/db";
import { getTask } from "@/lib/tasks/repository";

// Always read the task from the database, never prerender.
export const dynamic = "force-dynamic";

function parseId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) notFound();
  const task = getTask(getDb(), id);
  if (task === null) notFound();

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Edit task</h1>
      <div className="mt-6">
        <EditTaskForm task={task} />
      </div>
    </main>
  );
}
