# Overview

Document inventory and diagram inventory for `docs/current/`. If a document is not listed
here, it does not exist as living documentation (`_documentation_principles.md`).
`pnpm docs:check` fails an unlisted page.

## Documents

| Document                                                    | Tier | Description                                                                                                                                        |
| ----------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| [_documentation_principles](_documentation_principles.md)   | -    | How and why these docs are written; the shape checks and the diagram procedure                                                                     |
| [_overview](_overview.md)                                   | -    | This document: inventory, diagrams, last update                                                                                                    |
| [README](README.md)                                         | 1    | What the app is, key numbers, document map                                                                                                         |
| [setup](setup.md)                                           | 2    | Prerequisites, install, run, test, reset the database                                                                                              |
| [testing](testing.md)                                       | 2    | The five test tiers, their commands, where each runs during a dmtix run                                                                            |
| [how/architecture](how/architecture.md)                     | 2    | The module boundaries: routes and actions, the domain and persistence layer, the SQLite file, and the repo guards                                  |
| [how/persistence](how/persistence.md)                       | 2    | How the SQLite file is opened, PRAGMAs, the migration ledger and runner, `getDb` for the app and `createTestDb` for tests                          |
| [how/tasks](how/tasks.md)                                   | 2    | The task list and edit pages and their forms: server actions, validation messages, ordering, revalidation and redirect, the 404 rule, the e2e flow |
| [data-model](data-model.md)                                 | 3    | The `tasks` and `schema_migrations` tables column by column, the index, the ordering rules, the migration ledger                                   |
| [standards/testing-strategy](standards/testing-strategy.md) | 2    | What each tier proves, the temp-database rule, test-first, and the guard tests that hold the docs                                                  |

## Diagrams

Rendered SVGs live in `diagrams/`, one per `<!-- diagram: <id> -->` Mermaid block in any
page under `docs/current/`. `pnpm docs:check` fails when a stamp no longer matches the
Mermaid block; the procedure is `_documentation_principles.md` → **Diagrams first**.

| Id             | Lives in              | Shows                                                                                                                                                                                                                                                                             |
| -------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `architecture` | `how/architecture.md` | the browser, the App Router routes and server actions, `src/lib`, the SQLite file, and the test tiers around them                                                                                                                                                                 |
| `persistence`  | `how/persistence.md`  | `openDatabase`: ensure directory, PRAGMAs, `applyMigrations` against `schema_migrations`, the handle; `getDb` and `createTestDb` as callers                                                                                                                                       |
| `data-model`   | `data-model.md`       | ER view of `tasks` and `schema_migrations` with their columns and constraints                                                                                                                                                                                                     |
| `task-flow`    | `how/tasks.md`        | form submit, server action, `formDataToRaw` and `parseTaskInput`, errors back to the form or the repository write; the row forms into `toggleTask` and `removeTask`; the edit form into `saveTask` and `redirect("/")`; `revalidatePath("/")` and the page re-reading `listTasks` |

**Last documentation update:** 2026-09-17 (epic Task list, tick xgu: how/tasks covers the edit page, saveTask and redirect-after-save; the task-flow diagram gained the edit branch).
