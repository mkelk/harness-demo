import { notFound } from "next/navigation";
import { EditTaskForm } from "@/app/components/edit-task-form";
import { getDb } from "@/lib/db";
import { listLists } from "@/lib/lists/repository";
import { getTask } from "@/lib/tasks/repository";
import { parseTaskId } from "@/lib/tasks/validate";

// Always read the task from the database, never prerender.
export const dynamic = "force-dynamic";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = parseTaskId(rawId);
  if (id === null) notFound();
  const db = getDb();
  const task = getTask(db, id);
  if (task === null) notFound();
  const lists = listLists(db).map(({ id, name }) => ({ id, name }));

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Edit task</h1>
      <div className="mt-6">
        <EditTaskForm task={task} lists={lists} />
      </div>
    </main>
  );
}
