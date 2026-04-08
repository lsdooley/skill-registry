# Skill Registry

Discover, install, and share reusable AI agent skills.

A community platform for discovering, publishing, and installing reusable AI agent skills. Architecturally inspired by [Journey](https://www.journeykits.ai), but with an inverted object model: **Skill** is the top-level publishable entity, not Kit.

## Object Model

- **Skill** — Top-level publishable unit. A focused, reusable AI capability delivered as a `skill.md` Markdown document.
- **Kit** — Optional grouping metadata bundling related skills.
- **Tool** — Optional dependency metadata (MCP server, terminal, API).
- **Shared Context** — Org-level credential/resource bindings.

## Status

Under development.
