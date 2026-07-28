# Project-scoped Codex configuration

Codex supports project-scoped configuration under `.codex/config.toml`, but configuration keys and supported features can change between Codex releases.

For safety, this reusable template does **not** install an opinionated `config.toml` automatically.

Recommended approach:

1. Open Codex settings from the IDE.
2. Review the current official configuration reference.
3. Add only the keys required for this project.
4. Keep operational behaviour in the root `AGENTS.md`.
5. Never place secrets directly in a committed configuration file.

The root `AGENTS.md` is the canonical behavioural instruction file for this repository.
