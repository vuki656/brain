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

Run a single test file: `bun test src/core/parser/parser.test.ts`

## Architecture

Three top-level groups under `src/`: `core/` (data layer), `ui/` (DOM rendering), `plugin/` (Obsidian
integration).

```
src/
  main.ts                              → Re-exports from plugin/plugin.ts (esbuild entry point)
  styles.css                           → All styling (copied to root by build.ts)

  core/                                → Data layer — types, utils, parsing
    shared/                            → Cross-cutting utilities and types
      types.ts                         → CardType, ColumnType, BoardType, KanbanSettingsType, ViewStateType
      plugin.types.ts                  → PluginSettingsType, DEFAULT_PLUGIN_SETTINGS, KANBAN_VIEW_TYPE
      constants.ts                     → COLUMN_COLORS, COLUMN_COLOR_LABELS, BRAT_REPO, PLUGIN_ID
      date.utils.ts                    → toDateString, getNextMonday, formatDate
      id.utils.ts                      → generateId
      test-utils.ts                    → makeCard, makeColumns, makeBoard, makeTodayCard
      test-mock-obsidian.ts            → Obsidian module mock (preloaded via bunfig.toml)
    parser/                            → parseBoard(markdown) → Board, serializeBoard(board) → markdown
      parser.ts
      parser.test.ts

  ui/                                  → All DOM rendering
    board/board.ts                     → renderBoard orchestrator + renderBoardColumns
    card/                              → Card rendering and mutations
      card.ts                          → createCardElement, createAddCardForm
      card-mutations.ts                → immutableSpliceCard, immutableUpdateCard
    column/                            → Column rendering
      column.ts                        → createColumnElement, createAddColumnButton
      column.utils.ts                  → getColumnColor
    toolbar/toolbar.ts                 → createToolbar, setButtonContent
    context-menu/context-menu.ts       → showCardContextMenu, showPriorityMenu
    quick-add/quick-add.ts             → openQuickAddDialog
    date-picker/date-picker.ts         → showDatePicker, showQuickAddDatePicker
    inline-edit/inline-edit.ts         → startInlineEdit
    sortable/sortable.ts               → createCardSortableOptions, createColumnCardMoveHandler
    today-view/                        → Today filter view
      today-view.ts                    → renderTodayView
      today-view.utils.ts              → collectCardsByDateGroup, sortCardsByOrder, formatDateGroupLabel, etc.

  plugin/                              → Obsidian integration
    plugin.ts                          → VukiKanbanPlugin: registerView, monkey-patch, settings
    view.ts                            → KanbanView (TextFileView): file lifecycle → board rendering
    settings.ts                        → Plugin settings tab (notePathPrefix)
    self-update/self-update.ts         → selfUpdate (GitHub release download)
```

**Data flow:** Obsidian file → `parser.parseBoard()` → `Board` object → `board.renderBoard()` → DOM.
Mutations produce new `Board` objects (immutable updates) → `parser.serializeBoard()` → file save
via `requestSave()`.

**Markdown tokens** parsed from card lines (order-independent): `@today`, `!important`,
`@{YYYY-MM-DD}`, `@id:abc123`, `[[NoteName]]`.

## Key Patterns

- **No semantic HTML elements** for column headers/buttons — Obsidian injects styles on `h3`,
  `button`, etc. differently on mobile/tablet. Use `div` and `span` exclusively.
- **Immutable board mutations** — `immutableSpliceCard()` and `immutableUpdateCard()` in
  `ui/card/card-mutations.ts`. Never mutate Board directly.
- **Self-update** in `plugin/self-update/self-update.ts` downloads from GitHub releases (`vuki656/brain`),
  bypassing BRAT due to mobile API rate limit bugs. Uses `requestUrl` with cache-busting.
- **Monkey-patch** via `monkey-around` package intercepts `WorkspaceLeaf.setViewState` to
  auto-detect kanban files by frontmatter.
- **Parser tests** are the primary test surface — round-trip idempotency
  (`serializeBoard(parseBoard(raw))`) is critical.
- **Test data** — Always use randomized/fictional data in tests, never real data from actual notes.
- **styles.css is a build output** — source lives at `src/styles.css`, copied to root by `build.ts`.
  Root `styles.css` is in `.gitignore`.

## Release Workflow

**Always commit before releasing.** Do not stack multiple version bumps on a single commit.

1. Bump version in `manifest.json`, `package.json`, `versions.json`
2. `bun run build`
3. Commit the changes
4. `gh release create <version> main.js manifest.json styles.css --title "<version>" --notes "<description>"`

The self-update button in the plugin toolbar fetches `manifest.json` from
`/releases/latest/download/` to check versions, then downloads assets by tag.
