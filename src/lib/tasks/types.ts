/** 1 = High, 2 = Normal (the default), 3 = Low; see PRIORITY_LABELS. */
export type Priority = 1 | 2 | 3;

export type Task = {
  id: number;
  title: string;
  notes: string;
  /** A calendar date `YYYY-MM-DD`, or `null` when undated. */
  dueOn: string | null;
  priority: Priority;
  /** The owning list's id, or `null` for "No list". */
  listId: number | null;
  doneAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskInput = {
  title: string;
  notes: string;
  dueOn: string | null;
  priority: Priority;
  listId: number | null;
};
