# Git and Safety Standard

## 1. Protect user work

Assume uncommitted changes are valuable.

Before editing, inspect relevant Git status.

Never discard changes merely because they are unrelated or inconvenient.

## 2. Prohibited by default

Do not run without explicit authorisation:

```text
git reset --hard
git clean -fd
git clean -fdx
git checkout -- .
git restore .
git push --force
git push --force-with-lease
```

Do not rewrite history, delete branches, or remove worktrees without approval.

## 3. Focused diffs

A task diff should contain only:

- requested implementation;
- necessary tests;
- necessary documentation;
- unavoidable lockfile changes caused by an approved dependency operation.

Remove accidental formatting or generated changes.

## 4. Commits

When asked to commit:

- use a concise imperative message;
- keep the commit task-focused;
- do not include secrets or temporary files;
- report the commit summary.

Do not commit automatically unless requested or project workflow explicitly requires it.

## 5. Secrets

Never display or commit:

- `.env` contents;
- API keys;
- private keys;
- passwords;
- access tokens;
- production connection strings;
- client secrets.

Use placeholders in examples.

## 6. Destructive filesystem operations

Before deleting, replacing, moving, or mass-renaming files:

1. list exact targets;
2. explain the reason;
3. describe reversibility or backup;
4. obtain approval.

## 7. Production safety

Do not deploy or operate on production by implication.

Production work must be explicitly named and authorised.

Confirm environment, target, and rollback method before execution.
