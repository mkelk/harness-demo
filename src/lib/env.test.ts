import { describe, expect, it } from "vitest";
import { DEFAULT_DATABASE_PATH, readEnv } from "./env";

describe("readEnv", () => {
  it("falls back to the dev database when DATABASE_PATH is unset", () => {
    expect(readEnv({})).toEqual({ databasePath: DEFAULT_DATABASE_PATH });
  });

  it("treats a blank DATABASE_PATH as unset", () => {
    expect(readEnv({ DATABASE_PATH: "   " }).databasePath).toBe(
      DEFAULT_DATABASE_PATH,
    );
  });

  it("uses DATABASE_PATH when set", () => {
    expect(readEnv({ DATABASE_PATH: "/tmp/x.db" }).databasePath).toBe(
      "/tmp/x.db",
    );
  });
});
