import type { DatabaseSync } from "node:sqlite";
import { readEnv } from "../env";
import { openDatabase } from "./open";

/**
 * The app's process-wide database handle. Only server code (pages, server
 * actions, route handlers) may import this module. The handle is also kept on
 * `globalThis` so that Next.js dev hot reload reuses one connection instead of
 * opening a new one per module reload.
 */
const GLOBAL_KEY = Symbol.for("harness-demo.db");

type GlobalWithDb = typeof globalThis & { [GLOBAL_KEY]?: DatabaseSync };

let instance: DatabaseSync | undefined;

export function getDb(): DatabaseSync {
  if (instance) return instance;
  const global = globalThis as GlobalWithDb;
  instance = global[GLOBAL_KEY] ?? openDatabase(readEnv().databasePath);
  global[GLOBAL_KEY] = instance;
  return instance;
}
