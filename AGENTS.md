# AGENTS.md — Authoritative Agent Instructions

## 1. Mission

Complete the user's current task accurately, safely, and efficiently.

Do not invent additional objectives. Do not expand scope. Do not continue after the acceptance criteria are satisfied.

## 2. Instruction priority

Follow instructions in this order:

1. The user's current explicit instruction.
2. This `AGENTS.md`.
3. `PROJECT_PROFILE.md`.
4. The applicable document in `docs/`.
5. Existing project conventions visible in directly relevant files.

When instructions conflict, stop and ask the user instead of guessing.

## 3. Mandatory task boundary

Before changing anything, identify:

- the requested outcome;
- the permitted files or directories;
- the minimum dependencies that must be inspected;
- the acceptance criteria;
- the commands needed for focused validation.

Do not perform a repository-wide audit unless the user explicitly requests one.

Do not inspect unrelated folders merely to become familiar with the project.

## 4. Single-pass context rule

Read each relevant file once per task whenever practical.

After a file has been understood and has not changed, treat it as `CONTEXT_COMPLETE`.

Do not reopen, re-summarise, re-audit, or re-index a `CONTEXT_COMPLETE` file unless:

- it was modified;
- a newly discovered direct dependency makes rereading necessary;
- a test failure points back to it; or
- the user explicitly requests another review.

Never loop through the same files to “double-check” without a concrete new reason.

## 5. Minimal file access

Access only:

- files named by the user;
- files imported by, called by, or directly configuring the named files;
- tests directly covering the requested behaviour;
- build or configuration files strictly required for the change.

Do not recursively scan generated, dependency, cache, build, backup, archive, or media directories.

Typical directories to exclude unless directly required:

```text
.git
node_modules
.next
dist
build
coverage
.cache
.codex
.vscode
.idea
vendor
Pods
DerivedData
.gradle
.dart_tool
android/.gradle
ios/Pods
tmp
temp
logs
backups
archives
```

## 6. No uncontrolled scope expansion

Without explicit approval, do not:

- refactor unrelated code;
- modernise dependencies;
- rename or move files;
- alter architecture;
- change frameworks, databases, APIs, authentication, deployment, or build systems;
- fix unrelated warnings;
- apply formatting to unaffected files;
- rewrite working code for style;
- create optional features;
- delete files or data.

Record secondary issues as deferred observations. Do not switch tasks.

## 7. Planning discipline

For a small, clear task, proceed directly after a concise internal plan.

For a task affecting multiple components, state a short execution plan containing:

- affected files;
- intended edits;
- focused validation;
- stop condition.

Do not repeatedly rewrite the plan. Update it only when a concrete fact changes the implementation path.

For multi-hour or high-risk work, use an explicit task brief or execution plan before coding.

## 8. Edit discipline

Make the smallest coherent change that satisfies the request.

Preserve existing behaviour outside the requested change.

Follow the project's established patterns unless they are the subject of the task.

Do not introduce speculative abstractions.

Do not modify generated files manually unless the project explicitly requires it.

Do not produce large unrelated formatting diffs.

## 9. Validation discipline

Run the narrowest meaningful validation first:

1. syntax/type check for changed files;
2. directly relevant unit or component tests;
3. directly relevant integration test;
4. broader test suite only when justified or requested.

Do not repeatedly run the same successful command unless code or configuration affecting it has changed.

Do not run expensive full builds, full test suites, dependency installations, migrations, or deployment commands without necessity or user approval.

If a test fails for an unrelated pre-existing reason, report it distinctly and do not start repairing it without approval.

## 10. Token and time discipline

Treat tokens, wall-clock time, CPU, memory, network traffic, and SSD writes as limited resources.

Avoid:

- repeated summaries;
- repeated repository maps;
- speculative searches;
- redundant command output;
- reading huge files in full when a relevant section is enough;
- long-running commands without a clear purpose;
- regenerating identical artefacts.

Prefer targeted search, bounded output, and incremental validation.

## 11. Long-running task checkpoints

For work likely to exceed 30 minutes, pause at meaningful milestones and report:

- completed work;
- current file or component;
- remaining work;
- blockers or scope changes;
- whether continued execution is still within the original task.

Do not run unattended for hours while repeatedly auditing the same material.

## 12. Failure and stall rule

If progress stalls, a process crashes, or the same failure occurs twice:

1. stop the current loop;
2. preserve existing edits;
3. capture the exact error;
4. identify the smallest likely cause;
5. propose one next diagnostic or repair step;
6. wait for approval when the next step is destructive, broad, or expensive.

Never conceal a failed command or claim success without evidence.

## 13. Safety and approval gates

Obtain approval before:

- deleting or overwriting user data;
- resetting, cleaning, or force-updating Git;
- changing secrets or environment variables;
- running production migrations;
- deploying;
- installing or removing major dependencies;
- changing lockfiles for an unrelated reason;
- executing commands with broad system impact;
- modifying files outside the repository.

## 14. Git discipline

Before editing, inspect the relevant working-tree state without discarding changes.

Never erase or overwrite user changes.

Keep commits and diffs task-focused.

Do not use destructive commands such as `git reset --hard`, `git clean -fd`, forced checkout, or force push unless the user explicitly authorises the exact action.

## 15. Completion and stop condition

The task is complete only when:

- the requested behaviour is implemented;
- focused validation has passed, or limitations are clearly reported;
- no unrelated changes were introduced;
- the user receives a concise summary of changed files and validation.

After that, stop.

Do not conduct a final repository-wide audit. Do not search for more work. Do not begin an optional improvement.

## 16. Required completion format

Report only:

1. **Completed:** what was implemented.
2. **Changed:** files modified.
3. **Validated:** commands or checks run and their outcomes.
4. **Deferred/blocked:** only genuine unresolved items.

Keep the report concise.

## 17. Project-specific instructions

Read `PROJECT_PROFILE.md` before making substantial changes.

Detailed standards are available in `docs/`. Load only the document relevant to the current task; do not read every standards file automatically.
