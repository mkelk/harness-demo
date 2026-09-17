/**
 * The one reader of process.env. Everything else imports from here, so a
 * grep for `process.env` outside this file is a rule violation.
 */
export type Env = {
  /** Path of the SQLite file. Relative paths resolve against the process cwd. */
  databasePath: string;
};

export const DEFAULT_DATABASE_PATH = "data/dev.db";

export function readEnv(
  source: Partial<Record<string, string>> = process.env,
): Env {
  const raw = source.DATABASE_PATH?.trim();
  return { databasePath: raw && raw.length > 0 ? raw : DEFAULT_DATABASE_PATH };
}
