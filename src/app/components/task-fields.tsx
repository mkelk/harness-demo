import {
  PRIORITY_LABELS,
  type SubmittedValues,
  type TaskInputErrors,
} from "@/lib/tasks/validate";

const PRIORITY_OPTIONS: ReadonlyArray<[string, string]> = [
  ["1", PRIORITY_LABELS[1]],
  ["2", PRIORITY_LABELS[2]],
  ["3", PRIORITY_LABELS[3]],
];

const controlClass = "rounded border border-zinc-300 px-2 py-1";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-red-700">
      {message}
    </p>
  );
}

/** What the List select needs to know about a list. */
export type ListOption = { id: number; name: string };

/**
 * The labelled Title, Notes, Due, Priority and List controls shared by the
 * add and edit forms. Plain markup with no server imports, so it renders
 * inside `"use client"` forms. `idPrefix` keeps the ids unique per form;
 * `lists` fills the List select after the "No list" option.
 */
export function TaskFields({
  idPrefix,
  values,
  errors,
  lists,
}: {
  idPrefix: string;
  values: SubmittedValues;
  errors: TaskInputErrors | undefined;
  lists: ListOption[];
}) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${idPrefix}-title`} className="text-sm font-medium">
          Title
        </label>
        <input
          id={`${idPrefix}-title`}
          name="title"
          type="text"
          placeholder="What needs doing?"
          defaultValue={values.title}
          className={controlClass}
        />
        <FieldError message={errors?.title} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${idPrefix}-notes`} className="text-sm font-medium">
          Notes
        </label>
        <textarea
          id={`${idPrefix}-notes`}
          name="notes"
          rows={2}
          defaultValue={values.notes}
          className={controlClass}
        />
        <FieldError message={errors?.notes} />
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${idPrefix}-dueOn`} className="text-sm font-medium">
            Due
          </label>
          <input
            id={`${idPrefix}-dueOn`}
            name="dueOn"
            type="date"
            defaultValue={values.dueOn}
            className={controlClass}
          />
          <FieldError message={errors?.dueOn} />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`${idPrefix}-priority`}
            className="text-sm font-medium"
          >
            Priority
          </label>
          <select
            id={`${idPrefix}-priority`}
            name="priority"
            defaultValue={values.priority}
            className={controlClass}
          >
            {PRIORITY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <FieldError message={errors?.priority} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${idPrefix}-listId`} className="text-sm font-medium">
            List
          </label>
          <select
            id={`${idPrefix}-listId`}
            name="listId"
            defaultValue={values.listId}
            className={controlClass}
          >
            <option value="">No list</option>
            {lists.map((list) => (
              <option key={list.id} value={String(list.id)}>
                {list.name}
              </option>
            ))}
          </select>
          <FieldError message={errors?.listId} />
        </div>
      </div>
    </>
  );
}
