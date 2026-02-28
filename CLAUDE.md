# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Repo-Specific Overrides

- Claude is allowed to commit and release in this repo (overrides the global "never commit" rule)
- When the user says "release": commit all changes, push to remote, then create a GitHub release
  tagging that commit (bump version, build, commit, push, `gh release create`)
- Always release automatically after completing a bug fix or feature (don't wait to be asked)

## Overview

Custom Obsidian Kanban plugin (`obsidian-vuki-kanban`) that reads/writes standard markdown files.
Triggered by `kanban-plugin: vuki-kanban` in frontmatter. Distributed via GitHub releases with a
built-in self-update mechanism.

## Commands

```bash
bun run build      # Type-check (tsc) then bundle (esbuild) for production
bun run dev        # esbuild watch mode for development
bun run test       # bun:test single run
bun run test:watch # bun:test watch mode
```

Run a single test file: `bun test src/parser.test.ts`

## Architecture

```
src/main.ts           → Plugin entry: registerView, monkey-patch WorkspaceLeaf for frontmatter detection, settings
src/view.ts           → KanbanView (extends TextFileView): bridges Obsidian file lifecycle to board rendering
src/board.ts          → All DOM rendering, event handlers, drag-drop (SortableJS), self-update mechanism
src/board-utils.ts    → Immutable board mutation helpers: immutableSpliceCard(), immutableUpdateCard()
src/parser.ts         → Pure functions: parseBoard(markdown) → Board, serializeBoard(board) → markdown
src/types.ts          → Type definitions: Card, Column, Board, Priority, ViewState, KanbanSettings
src/settings.ts       → Plugin settings tab (notePathPrefix)
styles.css            → All styling using Obsidian CSS variables for theme compatibility
```

**Test infrastructure:** `src/test-utils.ts` has factories (`makeCard`, `makeColumns`, `makeBoard`).
`src/test-mock-obsidian.ts` mocks the `obsidian` module via `bun:test`.

**Data flow:** Obsidian file → `parser.parseBoard()` → `Board` object → `board.renderBoard()` → DOM.
Mutations produce new `Board` objects (immutable updates) → `parser.serializeBoard()` → file save
via `requestSave()`.

**Markdown tokens** parsed from card lines (order-independent): `@today`, `!important`,
`@{YYYY-MM-DD}`, `@id:abc123`, `[[NoteName]]`.

## Key Patterns

- **No semantic HTML elements** for column headers/buttons — Obsidian injects styles on `h3`,
  `button`, etc. differently on mobile/tablet. Use `div` and `span` exclusively.
- **Immutable board mutations** — `immutableSpliceCard()` and `immutableUpdateCard()` in
  board-utils.ts. Never mutate Board directly.
- **Self-update** in board.ts downloads from GitHub releases (`vuki656/brain`), bypassing BRAT due
  to mobile API rate limit bugs. Uses `requestUrl` with cache-busting.
- **Monkey-patch** via `monkey-around` package intercepts `WorkspaceLeaf.setViewState` to
  auto-detect kanban files by frontmatter.
- **Parser tests** are the primary test surface — round-trip idempotency
  (`serializeBoard(parseBoard(raw))`) is critical.
- **Test data** — Always use randomized/fictional data in tests, never real data from actual notes.

## Release Workflow

**Always commit before releasing.** Do not stack multiple version bumps on a single commit.

1. Bump version in `manifest.json`, `package.json`, `versions.json`
2. `bun run build`
3. Commit the changes
4. `gh release create <version> main.js manifest.json styles.css --title "<version>" --notes "<description>"`

The self-update button in the plugin toolbar fetches `manifest.json` from
`/releases/latest/download/` to check versions, then downloads assets by tag.
