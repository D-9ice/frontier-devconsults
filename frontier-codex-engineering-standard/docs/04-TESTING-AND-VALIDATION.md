# Testing and Validation Standard

## 1. Validation objective

Prove the requested change works without consuming unnecessary time or resources.

## 2. Validation ladder

Use the lowest sufficient level first:

1. static/syntax check;
2. focused type check;
3. unit test for changed logic;
4. component or route test;
5. focused integration test;
6. production build;
7. full test suite.

Advance only when justified.

## 3. Test selection

Run tests directly covering:

- modified functions;
- modified components;
- affected route or API;
- altered configuration;
- regression risk introduced by the change.

Do not run every project test after a trivial, isolated edit unless project policy requires it.

## 4. Repeat-command rule

Do not rerun an unchanged successful validation.

Rerun only when:

- relevant code changed;
- configuration changed;
- the previous run was interrupted or inconclusive;
- the user requests confirmation.

## 5. Expensive commands

Obtain approval or clearly justify:

- full clean rebuilds;
- full end-to-end suites;
- dependency reinstallations;
- database migrations;
- production data operations;
- deployment;
- mobile simulator fleets;
- Docker image rebuilds;
- commands expected to run for a long time.

## 6. Failure classification

Classify failures as:

- **introduced:** caused by current edits;
- **related pre-existing:** within task area but existed before;
- **unrelated pre-existing:** outside task scope;
- **environmental:** toolchain, network, credentials, storage, or service issue;
- **inconclusive:** insufficient evidence.

Fix introduced failures. Report the others without silently expanding scope.

## 7. Evidence

Completion reports should include:

- command;
- result;
- relevant test count or outcome;
- any skipped validation and reason.

Never claim “fully tested” when only a partial check was run.

## 8. Manual validation

When automation is unavailable, state exact manual steps and expected results.

Do not present unperformed manual checks as completed.
