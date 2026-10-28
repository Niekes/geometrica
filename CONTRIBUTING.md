# Contributing to Geometrica

Thanks for your interest in contributing! This document describes the
development workflow and the quality gates every change has to pass.

## Prerequisites

- Node.js `^22.18.0 || ^24.11.0 || >=26.0.0`

## Getting started

```bash
npm install
npm run dev        # start the dev server
```

To let an AI agent drive your local app, follow the agent guide the dev server
serves at <http://localhost:5173/geometrica/agent/>.

## Everyday commands

| Command                 | What it does                                                        |
| ----------------------- | ------------------------------------------------------------------- |
| `npm run dev`           | Start the Vite dev server                                           |
| `npm run test`          | Run the unit tests once                                             |
| `npm run test:watch`    | Run the tests in watch mode                                         |
| `npm run coverage`      | Run the tests with coverage thresholds (statements 95, branches 85, functions 95, lines 95) |
| `npm run type-check`    | Type-check the whole project with vue-tsc                           |
| `npm run lint`          | ESLint plus the fallow gates (dead code, architecture, health, duplication) |
| `npm run lint:fix`      | ESLint with auto-fix                                                |
| `npm run build`         | Build the production bundle                                         |

## The quality gate

`npm run lint` is the whole gate, and it runs in CI. It fails on:

- ESLint errors (Vue 3 strongly-recommended + TypeScript rules)
- unused files, exports, types or class members
- private types leaking through public signatures
- unresolved or unlisted dependencies
- import cycles and architecture boundary violations (zones live in `.fallowrc.jsonc`)
- untested public exports of `src/lib` and `src/composables`
- code duplication

The Git pre-commit hook runs `fallow audit` on your changeset: findings your
changes introduce block the commit, inherited findings on touched files do
not. Skip it for a single WIP commit with `git commit --no-verify`.

## Architecture in short

Dependencies point inwards: `types` → `config` → `lib` → `composables` →
`components` → `views`. The engine (`src/lib`) never imports Vue components;
components never import views. Every analysed file belongs to a zone, so a
new module cannot be dropped into `src/` without being placed consciously.
Details live in `AGENTS.md` and `docs/adr/`.

## Writing tests

- Engine and composables are unit-tested in the `__tests__` folder next to
  the module; the renderer is verified by parsing its SVG output and checking
  the elements and attributes.
- New public exports in `src/lib` or `src/composables` need a test — the
  `coverage-gaps` gate reports them otherwise.
- Component wiring is covered by the HomeView component test; presentational
  components are verified through the running app.

## Committing

Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, ...). The CI
workflow runs type-check, lint and the test matrix (Node 22 and 24) on every
push and pull request; `master` additionally updates the health and coverage
badges and deploys to GitHub Pages.
