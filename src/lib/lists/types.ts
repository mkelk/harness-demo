export type List = {
  id: number;
  name: string;
  createdAt: string;
  /** Number of the list's tasks with `doneAt` null; computed on read. */
  openCount: number;
};
