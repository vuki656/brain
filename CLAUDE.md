# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Repo-Specific Overrides

- Claude is allowed to commit and release in this repo (overrides the global "never commit" rule)
- To release, always use the `/release` skill — never run the release steps manually
- Always release automatically after completing a bug fix or feature (don't wait to be asked)

## Overview

Custom Obsidian Kanban plugin (`obsidian-vuki-kanban`) that reads/writes standard markdown files.
Triggered by `kanban-plugin: vuki-kanban` in frontmatter. Distributed via GitHub releases with a
built-in self-update mechanism.

## Commands

```bash
bun run build      # Type-check (tsc) then bundle with bun for production
bun run test       # bun:test single run
bun run test:watch # bun:test watch mode
```

Run a single test file: `bun test src/parser/parser.test.ts`

## Architecture

Four top-level groups under `src/`: `shared/` (cross-cutting types and utils), `parser/` (markdown
parsing), `ui/` (DOM rendering), `plugin/` (Obsidian integration). Each module has a barrel
`index.ts` — cross-module imports use the barrel (e.g., `from "../shared"`), internal imports stay
explicit (e.g., `from "./types"`). Test files are excluded from barrels.

```
src/
  main.ts                              → Re-exports from plugin/plugin.ts (bun entry point)
  styles.css                           → All styling (copied to root by build.ts)

  shared/                              → Cross-cutting utilities and types
    index.ts                           → Barrel (re-exports types, plugin.types, constants, date.utils, id.utils)
    types.ts                           → CardType, ProjectType, BoardType, KanbanSettingsType, ViewStateType
    plugin.types.ts                    → PluginSettingsType, DEFAULT_PLUGIN_SETTINGS, KANBAN_VIEW_TYPE
    constants.ts                       → PROJECT_COLORS, PROJECT_COLOR_LABELS, BRAT_REPO, PLUGIN_ID
    date.utils.ts                      → toDateString, getNextMonday, formatDate
    id.utils.ts                        → generateId
    test-utils.ts                      → makeCard, makeProjects, makeBoard, makeTodayCard (NOT in barrel)
    test-mock-obsidian.ts              → Obsidian module mock (preloaded via bunfig.toml, NOT in barrel)

  parser/                              → parseBoard(markdown) → Board, serializeBoard(board) → markdown
    index.ts                           → Barrel (re-exports parseBoard, serializeBoard)
    parser.ts
    parser.test.ts

  ui/                                  → All DOM rendering
    board/board.ts                     → renderBoard orchestrator + renderBoardProjects
    card/                              → Card rendering and mutations
      card.ts                          → createCardElement, createAddCardForm
      card-mutations.ts                → immutableSpliceCard, immutableUpdateCard
    project/                           → Project rendering
      project.ts                       → createProjectElement, createAddProjectButton
      project.utils.ts                 → getProjectColor
    toolbar/toolbar.ts                 → createToolbar, setButtonContent
    context-menu/context-menu.ts       → showCardContextMenu, showPriorityMenu
    quick-add/quick-add.ts             → openQuickAddDialog
    date-picker/date-picker.ts         → showDatePicker, showQuickAddDatePicker
    inline-edit/inline-edit.ts         → startInlineEdit
    sortable/sortable.ts               → createCardSortableOptions, createProjectCardMoveHandler
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

- **No semantic HTML elements** for project headers/buttons — Obsidian injects styles on `h3`,
  `button`, etc. differently on mobile/tablet. Use `div` and `span` exclusively.
- **Immutable board mutations** — `immutableSpliceCard()` and `immutableUpdateCard()` in
  `ui/card/card-mutations.ts`. Never mutate Board directly.
- **Self-update** in `plugin/self-update/self-update.ts` downloads from GitHub releases
  (`vuki656/brain`), bypassing BRAT due to mobile API rate limit bugs. Uses `requestUrl` with
  cache-busting.
- **Monkey-patch** via `monkey-around` package intercepts `WorkspaceLeaf.setViewState` to
  auto-detect kanban files by frontmatter.
- **Parser tests** are the primary test surface — round-trip idempotency
  (`serializeBoard(parseBoard(raw))`) is critical.
- **Test data** — Always use randomized/fictional data in tests, never real data from actual notes.
- **styles.css is a build output** — source lives at `src/styles.css`, copied to root by `build.ts`.
  Root `styles.css` is in `.gitignore`.

## Release Workflow

Use the `/release` skill for all releases. It handles validation, version bumping, building,
committing, pushing, and creating the GitHub release. See `.claude/skills/release/SKILL.md` for the
full flow.

The self-update button in the plugin toolbar fetches `manifest.json` from
`/releases/latest/download/` to check versions, then downloads assets by tag.
