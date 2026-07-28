# Coding and Change Standards

## 1. Minimal coherent change

Implement the smallest complete solution that satisfies the requirement.

Avoid both extremes:

- incomplete patching that leaves broken behaviour;
- unnecessary redesign beyond the task.

## 2. Existing conventions

Prefer current project conventions for:

- naming;
- directory structure;
- error handling;
- state management;
- API shape;
- styling;
- testing;
- logging.

Do not impose a new pattern simply because it is fashionable.

## 3. Working-code preservation

Do not refactor stable code unless:

- the requested change cannot be implemented safely without it;
- the user explicitly requested refactoring;
- a directly relevant defect requires it.

Explain any necessary refactor before performing a broad one.

## 4. Dependencies

Do not add or upgrade dependencies by default.

Before adding one, establish:

- why built-in or existing capabilities are insufficient;
- maintenance and security implications;
- bundle/runtime impact;
- compatibility;
- whether user approval is required.

Never run a blanket dependency upgrade as part of an unrelated task.

## 5. Public interfaces

Preserve public APIs, routes, database schemas, environment-variable names, and external integrations unless the task explicitly changes them.

Breaking changes require approval and migration notes.

## 6. Error handling

Errors must be:

- detected at the appropriate boundary;
- reported with actionable context;
- safe for users and logs;
- free of exposed secrets;
- consistent with project conventions.

Do not swallow errors merely to make tests pass.

## 7. Logging

Add logs only when operationally useful.

Never log passwords, tokens, private keys, payment data, personal data, or full environment values.

Avoid verbose logs in hot loops.

## 8. Comments and documentation

Document intent, constraints, and non-obvious trade-offs.

Do not narrate obvious syntax.

Update documentation only when the change affects documented behaviour.

## 9. Formatting

Format only changed files or changed regions unless the user requests a broader formatting pass.

Avoid diffs dominated by whitespace.

## 10. Temporary code

Do not leave:

- debug prints;
- commented-out implementations;
- test credentials;
- bypass flags;
- unexplained TODOs;
- temporary files.

Any intentionally deferred TODO must identify the reason and owner or follow-up condition.

## 11. Security baseline

Never:

- hard-code secrets;
- weaken authentication or authorisation;
- disable validation to bypass an error;
- expose internal error details to users;
- trust client-side checks for server-side security;
- execute untrusted input as code.

Security-sensitive changes require focused review and testing.
