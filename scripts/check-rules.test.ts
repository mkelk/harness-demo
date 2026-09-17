import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Repo rules from AGENTS.md: `process.env` is read only in src/lib/env.ts and
// `node:sqlite` is imported only under src/lib/db/.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");

function sourceFiles(): string[] {
  return readdirSync(SRC, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && /\.tsx?$/.test(e.name))
    .map((e) => relative(ROOT, join(e.parentPath, e.name)).split(sep).join("/"))
    .sort();
}

const read = (file: string) => readFileSync(join(ROOT, file), "utf8");

describe("repository rules", () => {
  it("reads process.env only in src/lib/env.ts", () => {
    const offenders = sourceFiles().filter(
      (file) => file !== "src/lib/env.ts" && read(file).includes("process.env"),
    );
    expect(offenders).toEqual([]);
  });

  it("imports node:sqlite only under src/lib/db/", () => {
    const offenders = sourceFiles().filter(
      (file) =>
        !file.startsWith("src/lib/db/") &&
        /from\s+["']node:sqlite["']|require\(\s*["']node:sqlite["']\s*\)/.test(
          read(file),
        ),
    );
    expect(offenders).toEqual([]);
  });
});
