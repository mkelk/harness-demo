# harness-demo documentation

Tier 1. The living documentation of the harness-demo task manager: what it is, how it
works, how to run and test it. Start here, go to `_overview.md` for the full inventory,
then to the page that holds your concern. How the repo is _built_ (the dmtix method) is
in the repository README, not here; this folder describes the app as it is now.

## What it is

A single-user task manager: a Next.js 16 app (App Router, React server components and
server actions) persisting to one SQLite file through Node's built-in `node:sqlite`. No
external services. It runs with `pnpm dev` on port 3000 and stores data in `data/dev.db`.
On `/` you add a task (title, optional notes), see the open list newest first, mark a
task done, reopen it, and delete it; `/tasks/<id>/edit` changes its title and notes;
see `how/tasks.md`.

## Key numbers

| Thing                         | Value                                                           |
| ----------------------------- | --------------------------------------------------------------- |
| Dev server port               | 3000 (`pnpm dev`)                                               |
| E2E server port               | 3100 (`pnpm test:e2e`, fresh `data/e2e-<timestamp>.db` per run) |
| Database file                 | `DATABASE_PATH`, default `data/dev.db`                          |
| Test tiers                    | unit, component, integration, guards (Vitest); e2e (Playwright) |
| Coverage floor (`src/lib/**`) | 80% lines and functions, 70% branches                           |

## Document map

| Tier | Document                                                    | Read it when                                                                                 |
| ---- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1    | [README](README.md)                                         | you want the shape of the app in two minutes                                                 |
| 1    | [_overview](_overview.md)                                   | you want every page and every diagram listed                                                 |
| 2    | [setup](setup.md)                                           | you are installing, running or resetting the app                                             |
| 2    | [testing](testing.md)                                       | you are writing or running tests                                                             |
| 2    | [how/architecture](how/architecture.md)                     | you are about to change anything and need the module boundaries                              |
| 2    | [how/persistence](how/persistence.md)                       | you are adding a migration, opening the database, or writing an integration test             |
| 2    | [how/tasks](how/tasks.md)                                   | you are changing the task list or edit page, a form, a server action or a validation message |
| 3    | [data-model](data-model.md)                                 | you need a table, a column, a constraint or an ordering rule                                 |
| 2    | [standards/testing-strategy](standards/testing-strategy.md) | you need to know what each tier proves and the rules tests follow                            |
| -    | [_documentation_principles](_documentation_principles.md)   | you are writing documentation                                                                |

Pages the first increments add (configuration, troubleshooting) appear here and in
`_overview.md` when they land; a page not listed does not exist.
