export type Task = {
  id: number;
  title: string;
  notes: string;
  doneAt: string | null;
  createdAt: string;
  updatedAt: string;
};
export type TaskInput = { title: string; notes: string };
