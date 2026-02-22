# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Custom Obsidian Kanban plugin (`obsidian-vuki-kanban`) that reads/writes standard markdown files. Triggered by `kanban-plugin: vuki-kanban` in frontmatter. Distributed via GitHub releases with a built-in self-update mechanism.

## Commands

```bash
npm run build        # Type-check (tsc) then bundle (esbuild) for production
npm run dev          # esbuild watch mode for development
npm run test         # vitest single run
npm run test:watch   # vitest watch mode
```

Release workflow (always commit first, then release):
```bash
npm run build
gh release create <version> main.js manifest.json styles.css --title "<version>" --notes "<description>"
```

Bump version in three files before releasing: `manifest.json`, `package.json`, `versions.json`.

## Architecture

```
src/main.ts      → Plugin entry: registerView, monkey-patch WorkspaceLeaf for frontmatter detection, settings
src/view.ts      → KanbanView (extends TextFileView): bridges Obsidian file lifecycle to board rendering
src/board.ts     → All DOM rendering, event handlers, drag-drop (SortableJS), self-update mechanism
src/parser.ts    → Pure functions: parseBoard(markdown) → Board, serializeBoard(board) → markdown
src/types.ts     → Type definitions: Card, Column, Board, Priority, ViewState, KanbanSettings
src/settings.ts  → Plugin settings tab (notePathPrefix)
src/migration.ts → Converts old kanban-plugin:board format to vuki-kanban
styles.css       → All styling using Obsidian CSS variables for theme compatibility
```

**Data flow:** Obsidian file → `parser.parseBoard()` → `Board` object → `board.renderBoard()` → DOM. Mutations produce new `Board` objects (immutable updates) → `parser.serializeBoard()` → file save via `requestSave()`.

**Markdown tokens** parsed from card lines (order-independent): `@today`, `!important`, `@{YYYY-MM-DD}`, `@id:abc123`, `[[NoteName]]`.

## Key Patterns

- **No semantic HTML elements** for column headers/buttons — Obsidian injects styles on `h3`, `button`, etc. differently on mobile/tablet. Use `div` and `span` exclusively.
- **Immutable board mutations** — `immutableSpliceCard()` and `immutableUpdateCard()` in board.ts. Never mutate Board directly.
- **Self-update** in board.ts downloads from GitHub releases (`vuki656/brain`), bypassing BRAT due to mobile API rate limit bugs. Uses `requestUrl` with cache-busting.
- **Monkey-patch** via `monkey-around` package intercepts `WorkspaceLeaf.setViewState` to auto-detect kanban files by frontmatter.
- **Parser tests** are the primary test surface — round-trip idempotency (`serializeBoard(parseBoard(raw))`) is critical.

## Release Workflow

**Always commit before releasing.** Do not stack multiple version bumps on a single commit.

1. Bump version in `manifest.json`, `package.json`, `versions.json`
2. `npm run build`
3. Commit the changes
4. `gh release create <version> main.js manifest.json styles.css --title "<version>" --notes "<description>"`

The self-update button in the plugin toolbar fetches `manifest.json` from `/releases/latest/download/` to check versions, then downloads assets by tag.
