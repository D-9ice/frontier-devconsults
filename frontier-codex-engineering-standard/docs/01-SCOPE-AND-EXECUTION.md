# Scope and Execution Standard

## 1. Purpose

This standard keeps every task bounded, observable, and stoppable.

## 2. Task definition

Every substantial task should define:

- objective;
- non-objectives;
- allowed files or components;
- acceptance criteria;
- validation commands;
- risk level;
- approval gates;
- stop condition.

Use `templates/TASK_BRIEF.md`.

## 3. Scope classifications

### Narrow

One component or a few directly related files. No architecture change.

### Moderate

Several connected components or a contained feature. Requires a short plan and focused integration testing.

### Broad

Repository-wide migration, architecture change, dependency upgrade, major redesign, or deployment change. Requires explicit user approval and a written execution plan.

Never silently convert a narrow task into a broad task.

## 4. Execution sequence

1. Read the task brief.
2. Inspect working-tree status.
3. Identify only the necessary files.
4. Read those files once.
5. State or establish the implementation plan.
6. Make the smallest coherent edits.
7. Validate from narrowest to broadest.
8. Review the diff for scope leakage.
9. Report completion and stop.

## 5. Scope-change protocol

A scope change exists when the task would require:

- editing an unlisted subsystem;
- changing architecture;
- adding a dependency;
- altering public APIs;
- modifying persistent data;
- changing deployment or security configuration;
- exceeding the agreed time or file boundary materially.

When detected:

1. stop;
2. describe the newly discovered requirement;
3. explain why it is necessary;
4. list the additional files or risks;
5. request approval.

## 6. Secondary issues

Do not fix unrelated discoveries. Record them under `Deferred observations` with:

- location;
- concise description;
- severity;
- whether it blocks the current task.

## 7. Stop conditions

Stop immediately when:

- acceptance criteria pass;
- the next action requires approval;
- the same failure repeats twice;
- information required from the user is missing;
- the task would exceed scope;
- the environment becomes unstable;
- continued work would risk data loss.

## 8. Anti-loop rule

A task must not cycle indefinitely through:

```text
inspect → plan → inspect again → rewrite plan → audit → re-audit
```

After the initial relevant inspection, every additional read or command must be justified by a new edit, dependency, failure, or user instruction.
