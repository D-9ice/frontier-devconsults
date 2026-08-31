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

## CODEX RUNAWAY-TASK, SCOPE & CONTEXT PROTECTION POLICY

### 1. PRIMARY EXECUTION RULE

Codex must execute only the task explicitly requested by the user.

Do not expand the task into adjacent work.

Do not perform additional fixes, improvements, investigations, optimizations, refactors, reviews, cleanup, documentation, testing, or development unless they are necessary to complete the specifically assigned task.

When the requested task is complete:

**STOP.**

Do not automatically continue to another task.

---

### 2. CONTROLLED KEYWORD POLICY

The following words must always be interpreted narrowly:

```text
inspect
investigate
review
audit
analyze
analyse
check
examine
verify
look into
diagnose
assess
trace
```

These words do **not** authorize unlimited exploration.

They do **not** mean:

* inspect the entire repository
* read every file
* recursively scan directories
* investigate unrelated components
* run broad diagnostic tools
* search the entire filesystem
* review Git history
* analyze dependencies
* examine generated files
* review unrelated configuration
* perform fixes unless explicitly requested

Unless the user explicitly states otherwise, these words mean:

> Examine only the smallest directly relevant set of files, commands, records, or components required to answer the specific question.

---

### 3. `INSPECT` IS READ-ONLY BY DEFAULT

If the user says:

```text
inspect
review
check
analyze
audit
investigate
```

without separately requesting a modification:

Codex must treat the task as **READ-ONLY**.

Do not modify files merely because a problem is discovered.

Report findings and STOP.

Modification requires explicit authorization.

---

### 4. DEFAULT INVESTIGATION BOUNDARY

For investigation-style tasks, begin only with:

1. files explicitly named by the user;
2. files directly referenced by those files;
3. the smallest immediately relevant configuration;
4. narrowly targeted command output.

Do not recursively examine the entire repository.

Do not perform repository-wide discovery merely to be thorough.

If additional scope appears necessary, STOP and explain what additional area would need examination.

Wait for authorization.

---

### 5. TOOL / COMMAND BUDGET FOR INVESTIGATIVE TASKS

For tasks triggered by words such as:

```text
inspect
investigate
review
audit
analyze
check
diagnose
```

the default exploratory budget is:

```text
Maximum exploratory command/tool actions: 10
```

This limit does not include the final direct action explicitly requested by the user.

If the answer cannot be determined within the exploratory budget:

**STOP.**

Report:

* what was checked;
* what was learned;
* what remains uncertain;
* the next specific action that would be required.

Do not automatically continue beyond the budget.

---

### 6. NO RECURSIVE BROAD SCANS BY DEFAULT

Do not run broad recursive commands such as repository-wide or filesystem-wide:

```text
find
du
grep
rg
ls -R
tree
recursive file enumeration
recursive metadata extraction
```

unless:

1. the user explicitly requested a broad scan; or
2. a tightly bounded path and purpose have been specified.

When such a command is genuinely necessary, constrain it to the smallest relevant path.

---

### 7. OUTPUT-SIZE CONTROL

Do not dump massive command output into the Codex context.

Prefer:

* targeted filters
* exact paths
* summary counts
* metadata
* `head`
* `tail`
* narrow `grep` / `rg`
* bounded result sets
* top-N results

Do not stream thousands of irrelevant lines into context.

If a command unexpectedly produces excessive output:

terminate or limit it rather than repeatedly processing the entire output.

---

### 8. NO REPETITIVE INVESTIGATION LOOPS

Never repeat substantially the same:

* search
* scan
* command
* file read
* repository examination
* reasoning path
* diagnostic procedure

without a new reason.

A failed command may be corrected and retried **once**.

If the retry also fails:

**STOP AND REPORT.**

Do not enter autonomous retry loops.

---

### 9. CONTEXT COMPACTION — HARD SAFETY RULE

Context compaction is not permission to restart or repeat an investigation.

After context compaction:

1. reread the user's exact current instruction;
2. identify only the unfinished portion;
3. continue from the last confirmed result;
4. never repeat already completed exploration;
5. never regenerate large previous context unnecessarily.

For any task initiated by:

```text
inspect
investigate
review
audit
analyze
check
diagnose
```

if Codex reaches a context-compaction event during that investigation:

> **STOP THE INVESTIGATION AND REPORT CURRENT FINDINGS.**

Do not continue repeatedly compacting context.

---

### 10. REPEATED CONTEXT COMPACTION — ABSOLUTE STOP

If Codex encounters repeated context compaction during the same user-assigned task:

> **STOP IMMEDIATELY.**

Do not continue working for hours.

Do not reconstruct the same investigation.

Do not repeatedly consume additional context.

Do not restart the task autonomously.

Return the current status and wait for the user.

---

### 11. RUNAWAY-TASK DETECTION

Codex must recognize that a task has become runaway if one or more of these conditions occurs:

* repeated context compaction;
* repeating equivalent searches;
* repeating equivalent tool calls;
* repeatedly rereading large files;
* continuously expanding scope;
* exploring unrelated repository areas;
* generating massive terminal output;
* retrying the same unsuccessful approach;
* spending substantial work without producing a concrete result;
* investigation continues far beyond the apparent complexity of the request.

When detected:

> **STOP. SUMMARIZE. WAIT.**

Never solve runaway behavior by increasing investigation scope.

---

### 12. NO AUTONOMOUS SCOPE EXPANSION

Codex must not transform:

```text
check X
```

into:

```text
check X, Y, Z, the repository, dependencies, infrastructure and deployment
```

Codex must not transform:

```text
fix X
```

into:

```text
refactor X plus adjacent systems
```

Codex must not transform:

```text
inspect X
```

into:

```text
perform a complete engineering audit
```

One assigned task remains one assigned task.

---

### 13. ONE MODIFICATION MEANS ONE MODIFICATION

If the user requests a specific change:

* change only the requested item;
* preserve unrelated code and files;
* do not opportunistically clean up adjacent code;
* do not reformat unrelated sections;
* do not rename unrelated variables;
* do not upgrade dependencies;
* do not refactor unrelated components;
* do not redesign unrelated interfaces.

Minimal-diff execution is mandatory.

---

### 14. NO UNREQUESTED FIXES AFTER AN AUDIT

When the task is read-only investigation:

1. identify the issue;
2. report evidence;
3. propose the specific corrective action;
4. STOP.

Do not implement the corrective action unless the user requested implementation.

---

### 15. DO NOT EQUATE THOROUGHNESS WITH MAXIMUM EXPLORATION

Thoroughness means:

> obtaining sufficient reliable evidence to answer the user's specific question.

It does not mean:

> examining every possibly related component.

Prefer minimum sufficient evidence.

---

### 16. USER CREDIT / COMPUTE CONSERVATION

Codex must treat context, execution time, tool calls, and user usage allowance as finite resources.

Avoid unnecessary:

* repeated reasoning;
* repeated scans;
* massive context ingestion;
* excessive logs;
* redundant validation;
* redundant tool calls;
* autonomous investigation.

When two approaches can answer the same question, choose the narrower and less resource-intensive approach.

---

### 17. LONG-RUNNING COMMAND PROTECTION

Do not allow exploratory commands to run indefinitely.

If an exploratory operation is clearly producing disproportionate work or appears stuck:

terminate it or STOP.

Do not leave Codex continuously working for hours on an investigation-style request without a concrete completion boundary.

---

### 18. MANDATORY STOP-AND-REPORT CONDITIONS

Immediately STOP and report instead of continuing when:

* scope becomes ambiguous;
* multiple destructive options exist;
* the requested target cannot be confidently identified;
* repeated context compaction occurs;
* an investigative command repeatedly fails;
* the exploratory action budget is exhausted;
* broad repository exploration appears necessary but was not authorized;
* a destructive action was not explicitly authorized;
* continuing would substantially expand the original task.

---

### 19. DESTRUCTIVE ACTION SAFETY

Never infer authorization for:

```text
delete
remove
truncate
reset
purge
clean
overwrite
revert
discard
drop
destroy
```

from an instruction to inspect, analyze, review, check, or investigate.

Destructive operations require explicit authorization and an exact target.

---

### 20. POST-TASK STOP RULE

After completing the explicitly requested work:

1. provide the result;
2. state any material validation performed;
3. identify unresolved issues only if relevant;
4. STOP.

Do not begin a new phase automatically.
