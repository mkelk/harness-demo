#!/usr/bin/env node
/**
 * `pnpm docs:check` — the guard behind docs/current/_documentation_principles.md.
 *
 * Two things can silently rot in living documentation, and this script fails
 * on both:
 *
 * 1. Diagram drift. Mermaid in the Markdown is the source of truth; the
 *    diagram-design skill renders an SVG next to it. Every block tagged
 *    `<!-- diagram: <id> -->` must have `docs/current/diagrams/<id>.svg`, and a
 *    stamp `<id>.sha` (SHA-256 of the Mermaid block) proving the SVG was drawn
 *    from the Mermaid that is in the Markdown now. Hashes, not mtimes, so a
 *    clone or a merge cannot fool it. `--stamp` writes stamps after rendering.
 *
 * 2. Page shape. Every page under docs/current/ is listed in _overview.md;
 *    every how-it-works page (how/*.md) opens with a diagram and carries a
 *    "## Key entry points" table whose file paths exist.
 *
 * Exit codes: 0 clean, 1 findings. `--strict` also fails on a diagram whose
 * SVG is missing (in-worktree runs allow missing renders, because rendering is
 * orchestrator work at epic close-out; the close-out gate runs with --strict).
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const DOCS_DIR = join(ROOT, "docs", "current");

const BLOCK_RE =
  /<!--\s*diagram:\s*([A-Za-z0-9][A-Za-z0-9._-]*)\s*-->\s*```mermaid\r?\n([\s\S]*?)```/g;

export function diagramBlocks(markdown) {
  const blocks = new Map();
  for (const m of markdown.matchAll(BLOCK_RE))
    if (!blocks.has(m[1])) blocks.set(m[1], m[2]);
  return blocks;
}

export function blockHash(body) {
  const normalised = body
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .join("\n")
    .trim();
  return createHash("sha256").update(normalised).digest("hex");
}

export function markdownSources(docsDir) {
  return readdirSync(docsDir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) =>
      relative(docsDir, join(e.parentPath, e.name)).split(sep).join("/"),
    )
    .filter((n) => !n.startsWith("diagrams/"))
    .sort();
}

/** Diagram checks: [{id, source, status: 'ok'|'missing'|'stale'}] */
export function checkDiagrams(docsDir, { stamp = false } = {}) {
  const out = [];
  for (const name of markdownSources(docsDir)) {
    const md = readFileSync(join(docsDir, name), "utf8");
    for (const [id, body] of diagramBlocks(md)) {
      const svg = join(docsDir, "diagrams", `${id}.svg`);
      const sha = join(docsDir, "diagrams", `${id}.sha`);
      const hash = blockHash(body);
      const hasSvg = existsSync(svg);
      if (stamp && hasSvg) writeFileSync(sha, `${hash}\n`);
      const stored = existsSync(sha)
        ? readFileSync(sha, "utf8").trim()
        : undefined;
      out.push({
        id,
        source: name,
        status: !hasSvg ? "missing" : stored === hash ? "ok" : "stale",
      });
    }
  }
  return out;
}

/** Shape checks: [{source, problem}] */
export function checkShape(docsDir) {
  const problems = [];
  const sources = markdownSources(docsDir);
  const overviewPath = join(docsDir, "_overview.md");
  const overview = existsSync(overviewPath)
    ? readFileSync(overviewPath, "utf8")
    : "";
  if (!overview) problems.push({ source: "_overview.md", problem: "missing" });

  for (const name of sources) {
    const md = readFileSync(join(docsDir, name), "utf8");
    const stem = name.replace(/\.md$/, "");
    if (
      overview &&
      name !== "_overview.md" &&
      !overview.includes(`(${name})`)
    ) {
      problems.push({ source: name, problem: "not listed in _overview.md" });
    }
    if (!/^# .+/m.test(md))
      problems.push({ source: name, problem: "no H1 title" });
    if (md.split("\n").length > 650)
      problems.push({ source: name, problem: "over 650 lines: split it" });

    if (stem.startsWith("how/")) {
      const firstHeading = md.search(/^## /m);
      const head = firstHeading === -1 ? md : md.slice(0, firstHeading);
      if (!/<!--\s*diagram:/.test(head)) {
        problems.push({
          source: name,
          problem: "how-it-works page does not open with a tagged diagram",
        });
      }
      const entryStart = md.search(/^## Key entry points\s*$/m);
      if (entryStart === -1) {
        problems.push({
          source: name,
          problem: "no '## Key entry points' table",
        });
      } else {
        const rest = md.slice(entryStart + "## Key entry points".length);
        const next = rest.search(/^## /m);
        const section = next === -1 ? rest : rest.slice(0, next);
        for (const p of section.matchAll(
          /`((?:src|scripts|e2e|docs|\.tick|\.devmeta)\/[^`\s]+)`/g,
        )) {
          if (!existsSync(join(ROOT, p[1])))
            problems.push({
              source: name,
              problem: `entry point path does not exist: ${p[1]}`,
            });
        }
      }
    }
  }
  return problems;
}

export function run(argv, docsDir = DOCS_DIR, log = console.log) {
  const stamp = argv.includes("--stamp");
  const strict = argv.includes("--strict");
  let failures = 0;

  const diagrams = checkDiagrams(docsDir, { stamp });
  for (const d of diagrams) {
    const bad = d.status === "stale" || (d.status === "missing" && strict);
    if (bad) failures++;
    log(
      `  ${bad ? "FAIL" : d.status === "missing" ? "warn" : "ok  "}  diagram ${d.status.padEnd(7)} ${d.id}  (${d.source})`,
    );
  }
  const shape = checkShape(docsDir);
  for (const s of shape) {
    failures++;
    log(`  FAIL  shape ${s.source}: ${s.problem}`);
  }
  if (failures === 0) {
    log(
      `docs:check: ${diagrams.length} diagram(s), ${shape.length} shape problem(s) — clean.`,
    );
    return 0;
  }
  log(`docs:check: ${failures} problem(s).`);
  log(
    "Diagrams: re-render with the diagram-design skill (/diagram-design:import-mermaid), then `pnpm docs:check --stamp`.",
  );
  return 1;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  process.exit(run(process.argv.slice(2)));
}
