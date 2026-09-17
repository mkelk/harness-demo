# Overview

Document inventory and diagram inventory for `docs/current/`. If a document is not listed
here, it does not exist as living documentation (`_documentation_principles.md`).
`pnpm docs:check` fails an unlisted page.

## Documents

| Document                                                    | Tier | Description                                                                                                       |
| ----------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------- |
| [_documentation_principles](_documentation_principles.md)   | -    | How and why these docs are written; the shape checks and the diagram procedure                                    |
| [_overview](_overview.md)                                   | -    | This document: inventory, diagrams, last update                                                                   |
| [README](README.md)                                         | 1    | What the app is, key numbers, document map                                                                        |
| [setup](setup.md)                                           | 2    | Prerequisites, install, run, test, reset the database                                                             |
| [testing](testing.md)                                       | 2    | The five test tiers, their commands, where each runs during a dmtix run                                           |
| [how/architecture](how/architecture.md)                     | 2    | The module boundaries: routes and actions, the domain and persistence layer, the SQLite file, and the repo guards |
| [standards/testing-strategy](standards/testing-strategy.md) | 2    | What each tier proves, the temp-database rule, test-first, and the guard tests that hold the docs                 |

## Diagrams

Rendered SVGs live in `diagrams/`, one per `<!-- diagram: <id> -->` Mermaid block in any
page under `docs/current/`. `pnpm docs:check` fails when a stamp no longer matches the
Mermaid block; the procedure is `_documentation_principles.md` → **Diagrams first**.

| Id             | Lives in              | Shows                                                                                                             |
| -------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `architecture` | `how/architecture.md` | the browser, the App Router routes and server actions, `src/lib`, the SQLite file, and the test tiers around them |

**Last documentation update:** 2026-09-17 (repository scaffold: principles, setup, testing, architecture).
