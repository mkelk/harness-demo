import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { blockHash, checkDiagrams, checkShape, run } from "./check-docs.mjs";

function fixture(files: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), "docs-"));
  mkdirSync(join(dir, "diagrams"), { recursive: true });
  mkdirSync(join(dir, "how"), { recursive: true });
  for (const [name, body] of Object.entries(files))
    writeFileSync(join(dir, name), body);
  return dir;
}

const page = (id: string) =>
  `# A page\n\nIntro.\n\n<!-- diagram: ${id} -->\n\`\`\`mermaid\nflowchart LR\n  a --> b\n\`\`\`\n\n## Key entry points\n\n| Concern | Where |\n|---|---|\n| env | \`src/lib/env.ts\` |\n`;

describe("checkDiagrams", () => {
  it("reports missing, stale and ok", () => {
    const dir = fixture({
      "_overview.md": "# O\n\n[a](how/a.md) [b](how/b.md) [c](how/c.md)\n",
      "how/a.md": page("a"),
      "how/b.md": page("b"),
      "how/c.md": page("c"),
    });
    writeFileSync(join(dir, "diagrams/b.svg"), "<svg/>");
    writeFileSync(join(dir, "diagrams/b.sha"), "wrong\n");
    writeFileSync(join(dir, "diagrams/c.svg"), "<svg/>");
    writeFileSync(
      join(dir, "diagrams/c.sha"),
      blockHash("flowchart LR\n  a --> b\n") + "\n",
    );
    const byId = Object.fromEntries(
      checkDiagrams(dir).map((d) => [d.id, d.status]),
    );
    expect(byId).toEqual({ a: "missing", b: "stale", c: "ok" });
  });

  it("--stamp repairs a stale stamp", () => {
    const dir = fixture({
      "_overview.md": "# O\n\n[a](how/a.md)\n",
      "how/a.md": page("a"),
    });
    writeFileSync(join(dir, "diagrams/a.svg"), "<svg/>");
    expect(checkDiagrams(dir, { stamp: true })[0].status).toBe("ok");
  });
});

describe("checkShape", () => {
  it("flags unlisted pages and how pages without diagram or entry points", () => {
    const dir = fixture({
      "_overview.md": "# O\n\n[a](how/a.md)\n",
      "how/a.md": page("a"),
      "how/bare.md": "# Bare\n\nNo diagram.\n\n## Something\n",
      "loose.md": "# Loose\n",
    });
    const problems = checkShape(dir).map((p) => `${p.source}: ${p.problem}`);
    expect(problems).toContain("how/bare.md: not listed in _overview.md");
    expect(problems).toContain(
      "how/bare.md: how-it-works page does not open with a tagged diagram",
    );
    expect(problems).toContain("how/bare.md: no '## Key entry points' table");
    expect(problems).toContain("loose.md: not listed in _overview.md");
    expect(problems.filter((p) => p.startsWith("how/a.md"))).toEqual([]);
  });
});

describe("run", () => {
  it("is lenient about missing renders unless --strict", () => {
    const dir = fixture({
      "_overview.md": "# O\n\n[a](how/a.md)\n",
      "how/a.md": page("a"),
    });
    const quiet = () => {};
    expect(run([], dir, quiet)).toBe(0);
    expect(run(["--strict"], dir, quiet)).toBe(1);
  });
});
