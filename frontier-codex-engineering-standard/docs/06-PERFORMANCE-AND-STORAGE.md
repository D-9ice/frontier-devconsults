# Performance and Storage Standard

## 1. Objective

Prevent development tooling and coding agents from wasting SSD space, memory, CPU, network data, or tokens.

## 2. Repository exclusions

Search, watch, index, and agent operations should exclude generated and cache directories such as:

```text
node_modules
.next
dist
build
coverage
.cache
.gradle
.dart_tool
Pods
DerivedData
logs
tmp
backups
archives
```

Keep project-specific exclusions in `.gitignore`, editor settings, and tool configuration where supported.

## 3. Agent workload limits

For any one task:

- avoid repeated repository indexing;
- avoid repeated full dependency analysis;
- avoid opening unchanged files repeatedly;
- avoid producing duplicate summaries;
- avoid unattended multi-hour auditing;
- use checkpoints for work over 30 minutes;
- stop after two identical failures.

## 4. Cache policy

Caches are disposable only when the corresponding tool can safely regenerate them.

Before deleting a cache:

- measure its size;
- identify its owner;
- confirm it contains no source work;
- close the owning application when appropriate;
- delete only the confirmed cache path.

Never delete unknown `.codex`, IDE, package-manager, Docker, or build directories blindly.

## 5. Storage-health target

For a small system drive used for software development, maintain a meaningful free-space margin for:

- macOS swap;
- temporary files;
- builds;
- package installations;
- browser and IDE caches;
- updates.

Treat persistent low free space as an operational risk, but do not assume every agent crash is caused by storage.

## 6. Cleanup sequence

Use an audit-first process:

1. measure free space;
2. identify largest top-level directories;
3. measure development caches;
4. remove unused applications/extensions;
5. prune tool caches safely;
6. remeasure;
7. stop when the target margin is reached.

## 7. Logs

Bound log size and retention.

Do not create verbose logs for normal operation.

Rotate or remove stale logs only after confirming they are not needed for an active incident.

## 8. Build artefacts

Do not retain obsolete builds when they are reproducible and not required for release or rollback.

Never remove deployment artefacts that are the only recoverable copy.
