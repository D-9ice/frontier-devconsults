# Multi-Agent Workflow Standard

## 1. Purpose

Use multiple agents only when separation reduces risk or time. Do not create multiple agents merely to duplicate analysis.

## 2. Roles

### Planner/Architect

- defines the implementation boundary;
- identifies affected interfaces;
- produces a concise plan;
- does not write production code unless assigned.

### Builder

- implements the approved plan;
- edits only assigned files;
- performs focused self-validation;
- does not redesign the architecture.

### Reviewer

- reviews only the task diff and directly affected interfaces;
- does not re-audit the entire repository;
- reports concrete defects, not speculative preferences.

### Tester

- executes the agreed validation ladder;
- isolates introduced failures;
- does not modify production code unless explicitly reassigned.

## 3. No duplicate work

Two agents must not independently scan the whole repository for the same task.

Share:

- task brief;
- affected file list;
- architectural decisions;
- completed validations;
- known blockers.

## 4. Handoffs

Every handoff must state:

- completed work;
- changed files;
- decisions made;
- unresolved risks;
- exact next action;
- tests already run.

The receiving agent must not repeat completed analysis without a concrete reason.

## 5. Consensus

Consensus is required for high-risk decisions only, such as:

- security design;
- destructive migrations;
- breaking API changes;
- production deployment;
- major architecture change.

Routine implementation does not need multiple agents repeating the same review.

## 6. Conflict resolution

When agents disagree:

1. identify the exact technical decision;
2. present evidence and trade-offs;
3. defer to project requirements and user direction;
4. request user decision when the conflict changes scope or risk.

## 7. Stop condition

Each agent stops at the end of its assigned role. It does not begin the next role automatically.
