# File Access and Context Standard

## 1. Principle

Repository access must be need-to-know, not curiosity-driven.

## 2. Context ledger

For substantial work, maintain a small logical ledger:

| File | Reason opened | State |
|---|---|---|
| `path/file.ts` | Direct task target | `CONTEXT_COMPLETE` |
| `path/config.ts` | Direct dependency | `MODIFIED` |
| `path/test.ts` | Focused validation | `VALIDATED` |

This need not be written to disk unless the task is long-running.

## 3. File states

- `UNSEEN`: not required yet.
- `CONTEXT_COMPLETE`: read and understood; do not reread unless justified.
- `MODIFIED`: changed during the task.
- `VALIDATED`: directly checked after change.
- `DEFERRED`: relevant issue outside scope.
- `BLOCKED`: cannot proceed without input or approval.

## 4. Search rules

Use targeted searches:

- exact symbol name;
- exact route;
- exact component;
- exact configuration key;
- known error message;
- direct import/reference.

Avoid unrestricted recursive content dumps.

Bound command output where possible.

## 5. Large files

Do not read a large file from beginning to end when only one section is relevant.

Use line ranges, symbol search, or structural navigation.

Read the whole file only when global context is genuinely necessary.

## 6. Generated and third-party content

Do not inspect or edit dependency and generated directories unless the task explicitly concerns them.

Prefer source configuration over generated output.

## 7. Binary and media assets

Do not regenerate or alter logos, photographs, PDFs, fonts, videos, databases, or archives without explicit approval.

Treat branded assets as immutable unless the task specifically targets them.

## 8. Context invalidation

A `CONTEXT_COMPLETE` file should be reread only when:

- it changed;
- an edit changed its interface;
- a failing test points to it;
- a direct dependency was misunderstood;
- the user changed requirements.

“Being extra sure” is not sufficient justification.

## 9. Session continuity

At checkpoints, retain a concise state summary containing:

- task objective;
- completed files;
- current file;
- next action;
- blockers;
- validations already passed.

Do not rebuild the entire repository map after a restart when this state is available.
