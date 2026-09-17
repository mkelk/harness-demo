# Testing strategy

Tier 2. What each test tier proves, the rules every test follows, and the guard tests
that hold the repository's own conventions. The commands are in `testing.md`.

## What each tier proves

| Tier        | Proves                                                                                                              | Does not prove                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| unit        | a pure function's contract, edge cases, error cases                                                                 | anything about the database or the UI |
| component   | a component renders and reacts as specified, with server actions mocked                                             | that the action does the right thing  |
| integration | the persistence layer against a real SQLite file: migrations apply, queries return the right rows, constraints hold | the UI                                |
| guards      | the repo's own rules: docs listed, how-pages shaped, diagrams stamped                                               | the app                               |
| e2e         | a user can do the thing, through the real app and the real database                                                 | internal contracts                    |

A feature is done when it has a test at every tier that applies. A server action that
writes rows has an integration test for the repository function it calls and an e2e test
for the user path; the component test is optional if the e2e covers the interaction.

## Rules

- **Test-first.** The failing test is written before the code, and the tick's description
  lists the cases (input to expected output, including edge and error cases).
- **Real database, temp file.** Integration tests never mock SQLite; each test gets its
  own migrated temp file from `createTestDb()` and removes it. `data/dev.db` is never
  touched by a test.
- **No shared singletons in parallel tiers.** Anything that binds a port or a fixed path
  is e2e and runs post-merge.
- **Behavioural coverage, not line coverage.** The coverage floor on `src/lib/**` is a
  floor, not a target; a test that does not assert behaviour does not count.
- **Never lower a threshold or skip a test in a tick.** A failing gate is a finding,
  not an obstacle.
- **Sibling tests are yours.** A behaviour change greps the test tree for the old
  behaviour and fixes every test it breaks, in the same tick.

## Guard tests

| Guard                         | File                                                             | Holds                                                                                                                                                                      |
| ----------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| docs shape and diagram stamps | `scripts/check-docs.mjs`, tested by `scripts/check-docs.test.ts` | every page listed in `_overview.md`; `how/` pages open with a diagram and carry a key-entry-points table with real paths; every tagged Mermaid block has a fresh SVG stamp |
| type safety                   | `pnpm typecheck`                                                 | no `any` leaks across module boundaries                                                                                                                                    |
| lint                          | `pnpm lint` (eslint-config-next)                                 | React and Next.js rules                                                                                                                                                    |
