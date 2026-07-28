# Frontier Codex Engineering Standard

A reusable repository template for disciplined, efficient work with OpenAI Codex and other coding agents.

## Purpose

This standard is designed to prevent:

- repeated repository-wide audits;
- uncontrolled scope expansion;
- unnecessary file reopening;
- token-heavy analysis loops;
- unrelated refactoring;
- excessive cache, log, and temporary-file growth;
- long-running tasks without checkpoints or stop conditions.

## Canonical instruction file

`AGENTS.md` is the authoritative Codex instruction file. Keep it at the repository root.

The additional documents in `docs/` provide detailed engineering standards. `AGENTS.md` deliberately stays concise enough to be loaded on every task while linking to deeper guidance only when needed.

## Repository contents

```text
.
├── AGENTS.md
├── README.md
├── PROJECT_PROFILE.md
├── CHANGELOG.md
├── .gitignore
├── .codex/
│   └── README.md
├── docs/
│   ├── 01-SCOPE-AND-EXECUTION.md
│   ├── 02-FILE-ACCESS-AND-CONTEXT.md
│   ├── 03-CODING-AND-CHANGE-STANDARDS.md
│   ├── 04-TESTING-AND-VALIDATION.md
│   ├── 05-GIT-AND-SAFETY.md
│   ├── 06-PERFORMANCE-AND-STORAGE.md
│   ├── 07-INCIDENT-RECOVERY.md
│   └── 08-MULTI-AGENT-WORKFLOW.md
└── templates/
    ├── TASK_BRIEF.md
    ├── EXECUTION_LOG.md
    └── PROJECT_PROFILE_TEMPLATE.md
```

## Installation in an existing project

Copy the contents of this repository into the root of the target project. Do not overwrite an existing `.gitignore`, `CHANGELOG.md`, or `PROJECT_PROFILE.md` without reviewing and merging them.

At minimum, copy:

```text
AGENTS.md
PROJECT_PROFILE.md
docs/
templates/
```

Then complete `PROJECT_PROFILE.md` with the project's actual commands, framework, protected files, and boundaries.

## Recommended use

1. Define one task in `templates/TASK_BRIEF.md`.
2. Give Codex the exact task and identify the allowed files.
3. Require a checkpoint before expanding scope.
4. Review the diff.
5. Run only the relevant tests.
6. Stop the task once the acceptance criteria pass.

## Core rule

> Do exactly the assigned work, only the assigned work, and stop when it is complete.
