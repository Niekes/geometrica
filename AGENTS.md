# AGENTS.md

<!-- fallow:setup-hooks:start -->

## Fallow checks

Use fallow for code-quality, cleanup, and setup tasks in this repository. Fallow checks the changed code before each `git commit`; pushes are gated by the CI audit job. Other agents run the check themselves: `fallow audit --format json --quiet --explain --gate-marker agent`. If the verdict is `fail`, fix the reported findings before you try again. A JSON runtime error such as `{ "error": true, ... }` does not block.

Audit defaults to `gate=new-only`: only findings introduced by the current changeset affect the verdict. Inherited findings on touched files are reported under `attribution` and annotated with `introduced: false`, but do not block the commit. Set `[audit] gate = "all"` in `fallow.toml` to gate every finding in changed files.

For non-skill agents, treat the task map below as the local onboarding source: run the listed fallow command before destructive edits, before commits, and before pull request handoff.

## Fallow task map

| When the agent is about to...                          | Run                                                                                                                                           |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| delete an "unused" export or file                       | `fallow dead-code --trace <file>:<export>`                                                                                                    |
| prove a TypeScript symbol's exact consumers before refactoring | `fallow dead-code --type-aware --symbol-impact <file>:<export-or-class.method>`                                                         |
| find how one module reaches another                     | `fallow trace --path <from> <to>` (Reports `reachable: false` instead of failing when no import path exists; type-only hops are reported, not skipped.) |
| delete an "unused" dependency                           | `fallow dead-code --trace-dependency <name>`                                                                                                    |
| migrate a dependency                                     | `fallow trace --dependency <name> --sites` (Counts each imported name, follows one hop through project wrappers, and counts each use that it cannot resolve.) |
| commit or open a PR                                      | `fallow audit --base <ref>`                                                                                                                    |
| read a diff before approving it                         | `fallow review --base <ref> --brief` (orientation, never gates: deterministic and always exit 0, unlike the audit row)                        |
| prioritize refactoring                                   | `fallow health --hotspots --targets`                                                                                                           |
| ask who owns code                                        | `fallow health --ownership`                                                                                                                    |
| check untested-but-reachable code                        | `fallow health --coverage-gaps`                                                                                                                |
| consolidate duplication                                  | `fallow dupes --trace dup:<fingerprint>`                                                                                                        |
| find feature flags                                       | `fallow flags`                                                                                                                                  |
| check which architecture rules apply to a file before changing it | `fallow guard <files>`                                                                                                                  |
| check import cycles, boundaries and policy rules after changing code | `fallow architecture`                                                                                                           |
| surface security candidates                              | `fallow security`                                                                                                                               |
| understand a finding                                     | `fallow explain <issue-type>`                                                                                                                    |
| scope a monorepo                                         | `--workspace <glob> / --changed-workspaces <ref>` (global flags, prefix any command)                                                          |

<!-- fallow:setup-hooks:end -->

## Git hooks

The pre-commit hook is generated by fallow and lives in `.git/hooks/` — it is
not part of the repository. Recreate it in a fresh clone with:

```bash
npm run hooks:install
```

## The quality gate

Geometrica enforces its guardrails with `npm run lint`, which runs in CI and in
the Git pre-commit hook.

```bash
npm run lint           # ESLint, then the fallow gates
npm run lint:fallow    # dead code, architecture, health (coverage gaps), duplication
npm run coverage       # tests with coverage thresholds (95/85/95)
```

## The architecture

Dependencies point inwards only. The zones are declared in `.fallowrc.jsonc`
and a violation fails the build.

| Zone          | Files                    | May import                                        |
| ------------- | ------------------------ | ------------------------------------------------- |
| `types`       | `src/types/**`           | (nothing internal)                                |
| `config`      | `src/config/**`          | `types`                                           |
| `lib`         | `src/lib/**`             | `lib`, `config`, `types`                          |
| `composables` | `src/composables/**`     | `composables`, `lib`, `config`, `types`           |
| `components`  | `src/components/**`      | `components`, `composables`, `lib`, `config`, `types` |
| `views`       | `src/views/**`           | all app zones                                     |
| `tests`       | `src/lib/__tests__/**`, `src/components/__tests__/**`, `src/composables/__tests__/**` | all zones |

Two consequences worth remembering:

- **The engine never reaches into the UI.** `src/lib` holds the renderer, the
  path parser and the URL state; it knows nothing about Vue components.
- **Public exports of `lib` and `composables` are tested.** The
  `coverage-gaps` rule reports an export that no test can reach; coverage
  thresholds live in `vitest.config.ts` and include `src/lib/**` and
  `src/composables/**` only.

## Adding a feature

1. Place new modules into the matching zone (see the table above).
2. Public functions in `lib` and `composables` need a test in the matching
   `__tests__` folder.
3. Run `npm run lint` and `npm run coverage` before committing; the
   pre-commit hook runs `fallow audit` on the changeset.

## Building UI

Whatever a component can do, a component does:

- **daisyUI first.** Use the daisyUI class in the template before writing
  Tailwind utilities, and tune it with daisyUI's own modifiers (`-xs`,
  `collapse-arrow`, `tabs-box`), not with overrides against it. Using daisyUI
  as documented is never a duplicate, even across files.
- **Repeated markup within one template becomes a `v-for`.**
- **A convention of our own that appears twice becomes a Vue component**
  (accessibility wiring, icon sizes, behaviour), e.g. `BaseIconButton`. No
  component only forwards a class.

## Releasing

There is no release pipeline. `master` deploys to GitHub Pages through
`.github/workflows/deploy.yml` on every push; CI (`.github/workflows/ci.yml`)
must be green for the merge.
