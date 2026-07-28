# Incident Recovery Standard

## 1. Trigger conditions

Use this procedure when Codex, VS Code, a build, or a long-running task:

- stops unexpectedly;
- becomes blank or unresponsive;
- repeats the same operation;
- consumes abnormal resources;
- corrupts its visible session;
- reports an extension-host or process failure.

## 2. Immediate response

1. Stop issuing new work.
2. Save open files.
3. Preserve the current repository state.
4. Capture the exact error and time.
5. Avoid uninstalling or deleting data immediately.
6. Determine whether the failure is:
   - service/network;
   - extension host;
   - Codex process;
   - authentication;
   - configuration;
   - memory/storage;
   - project command.

## 3. Least-destructive recovery order

Use only the steps required:

1. Restart the affected Codex process or panel.
2. Restart the VS Code Extension Host.
3. Reload the VS Code window.
4. Restart VS Code.
5. Re-authenticate if evidence points to authentication.
6. Inspect logs or developer console.
7. Disable conflicting or failing unused extensions.
8. Reinstall only as a final targeted step.

Do not clear Codex data or delete configuration before preserving and inspecting it.

## 4. Repeated crash rule

If Codex crashes twice in a short period:

- stop intensive work;
- record the error;
- inspect running extensions and Codex logs;
- check system resources;
- verify configuration;
- resume with a small test task, not the previous multi-hour task.

## 5. Resume protocol

When recovered:

1. verify the editor and Codex input are responsive;
2. inspect Git status;
3. identify the last confirmed completed change;
4. run one focused validation;
5. resume from the next unfinished step;
6. do not restart a full repository audit.

## 6. Incident record

For recurring failures, record:

- date/time;
- Codex and VS Code versions;
- active task;
- approximate duration;
- visible message;
- recovery action;
- whether files or tokens were affected;
- recurrence.

This makes patterns diagnosable instead of speculative.
