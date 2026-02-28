import { describe, expect, it } from "bun:test"

import { generateId, toDateString } from "../shared"
import { parseBoard, serializeBoard } from "./parser"

const TODAY_STRING = toDateString(new Date())

const SAMPLE_BOARD = `---

kanban-plugin: vuki-kanban

---

## Backlog

- [ ] Update billing dashboard @id:aaa111
- [ ] Schedule weekly standup @today @id:bbb222
- [ ] Design system tokens !important @{2026-02-25} @id:ccc333
- [x] Send monthly report @id:ddd444

## In Progress

- [ ] Review open pull requests @today !important @id:eee555
- [x] Address code review feedback @{2026-02-18} @id:fff666


%% kanban:settings
\`\`\`json
{"collapsed-columns":["Completed"]}
\`\`\`
%%`

const SAMPLE_BOARD_NO_IDS = `---

kanban-plugin: vuki-kanban

---

## Backlog

- [ ] Update billing dashboard
- [ ] Schedule weekly standup @today

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

describe("parseBoard", () => {
    it("should parse columns from headings", () => {
        const board = parseBoard(SAMPLE_BOARD)

        expect(board.columns).toHaveLength(2)
        expect(board.columns[0].title).toBe("Backlog")
        expect(board.columns[1].title).toBe("In Progress")
    })

    it("should parse card completion state", () => {
        const board = parseBoard(SAMPLE_BOARD)
        const general = board.columns[0]

        expect(general.cards[0].completed).toBe(false)
        expect(general.cards[3].completed).toBe(true)
    })

    it("should parse @today token as today's date", () => {
        const board = parseBoard(SAMPLE_BOARD)

        expect(board.columns[0].cards[1].date).toBe(TODAY_STRING)
        expect(board.columns[0].cards[1].title).toBe("Schedule weekly standup")
        expect(board.columns[1].cards[0].date).toBe(TODAY_STRING)
    })

    it("should parse priority tokens", () => {
        const board = parseBoard(SAMPLE_BOARD)

        expect(board.columns[0].cards[2].priority).toBe("important")
        expect(board.columns[0].cards[2].title).toBe("Design system tokens")
        expect(board.columns[1].cards[0].priority).toBe("important")
    })

    it("should parse date tokens", () => {
        const board = parseBoard(SAMPLE_BOARD)

        expect(board.columns[0].cards[2].date).toBe("2026-02-25")
        expect(board.columns[1].cards[1].date).toBe("2026-02-18")
    })

    it("should parse @id token", () => {
        const board = parseBoard(SAMPLE_BOARD)

        expect(board.columns[0].cards[0].id).toBe("aaa111")
        expect(board.columns[0].cards[1].id).toBe("bbb222")
        expect(board.columns[1].cards[0].id).toBe("eee555")
    })

    it("should generate id when missing", () => {
        const board = parseBoard(SAMPLE_BOARD_NO_IDS)

        expect(board.columns[0].cards[0].id).toMatch(/^[\da-z]{6}$/)
        expect(board.columns[0].cards[1].id).toMatch(/^[\da-z]{6}$/)
        expect(board.columns[0].cards[0].id).not.toBe(board.columns[0].cards[1].id)
    })

    it("should parse collapsed columns from settings", () => {
        const board = parseBoard(SAMPLE_BOARD)

        expect(board.settings.collapsedColumns).toEqual(["Completed"])
    })

    it("should parse today order record from settings", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## General

- [ ] Task one @id:abc123

%% kanban:settings
\`\`\`json
{"today-order":{"today":["abc123","def456"],"overdue":["ghi789"]}}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.settings.todayOrder).toEqual({
            overdue: ["ghi789"],
            today: ["abc123", "def456"],
        })
    })

    it("should parse column colors from settings", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## General

- [ ] Task one @id:abc123

%% kanban:settings
\`\`\`json
{"column-colors":{"Backlog":"var(--color-red)","In Progress":"var(--color-green)"}}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.settings.columnColors).toEqual({
            Backlog: "var(--color-red)",
            "In Progress": "var(--color-green)",
        })
    })

    it("should parse linked notes", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Backlog

- [ ] [[Raspberry Pi setup notes]] @id:abc123
- [ ] Regular task @id:def456

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.columns[0].cards[0].linkedNote).toBe("Raspberry Pi setup notes")
        expect(board.columns[0].cards[0].title).toBe("")
        expect(board.columns[0].cards[1].linkedNote).toBeNull()
    })

    it("should handle cards with @all without treating it as a token", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## General

- [ ] Reorganize team chat channels (to avoid tagging @all) @id:abc123

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)
        const card = board.columns[0].cards[0]

        expect(card.title).toContain("@all")
        expect(card.date).toBeNull()
    })

    it("should handle empty columns", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Empty Column

## Another Empty

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.columns).toHaveLength(2)
        expect(board.columns[0].cards).toEqual([])
        expect(board.columns[1].cards).toEqual([])
    })

    it("should parse a card with all tokens combined", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] [[MyNote]] @today !important @{2026-03-01} @id:xyz789

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)
        const card = board.columns[0].cards[0]

        expect(card.linkedNote).toBe("MyNote")
        expect(card.priority).toBe("important")
        expect(card.date).toBe("2026-03-01")
        expect(card.id).toBe("xyz789")
    })

    it("should handle malformed settings gracefully", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] Task @id:abc123

%% kanban:settings
\`\`\`json
{not valid json}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.columns).toHaveLength(1)
        expect(board.settings.collapsedColumns).toEqual([])
        expect(board.settings.todayOrder).toEqual({})
        expect(board.settings.columnColors).toEqual({})
    })

    it("should handle markdown with no columns", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.columns).toEqual([])
    })
})

describe("serializeBoard", () => {
    it("should produce valid frontmatter", () => {
        const board = parseBoard(SAMPLE_BOARD)
        const serialized = serializeBoard(board)

        expect(serialized).toContain("kanban-plugin: vuki-kanban")
        expect(serialized.startsWith("---\n")).toBe(true)
    })

    it("should serialize cards with tokens in canonical order including id", () => {
        const board = parseBoard(SAMPLE_BOARD)
        const serialized = serializeBoard(board)

        expect(serialized).toContain("- [ ] Schedule weekly standup @today @id:bbb222")
        expect(serialized).toContain(
            "- [ ] Design system tokens !important @{2026-02-25} @id:ccc333",
        )
        expect(serialized).toContain("- [ ] Review open pull requests @today !important @id:eee555")
        expect(serialized).not.toContain(`@today @{${TODAY_STRING}}`)
    })

    it("should serialize settings block", () => {
        const board = parseBoard(SAMPLE_BOARD)
        const serialized = serializeBoard(board)

        expect(serialized).toContain("%% kanban:settings")
        expect(serialized).toContain('"collapsed-columns":["Completed"]')
        expect(serialized).toContain("%%")
    })

    it("should serialize today order record in settings", () => {
        const board = parseBoard(SAMPLE_BOARD)

        board.settings.todayOrder = { overdue: ["aaa111"], today: ["eee555", "bbb222"] }

        const serialized = serializeBoard(board)

        expect(serialized).toContain(
            '"today-order":{"overdue":["aaa111"],"today":["eee555","bbb222"]}',
        )
    })

    it("should serialize column colors in settings", () => {
        const board = parseBoard(SAMPLE_BOARD)

        board.settings.columnColors = { General: "var(--color-red)" }

        const serialized = serializeBoard(board)

        expect(serialized).toContain('"column-colors":{"General":"var(--color-red)"}')
    })

    it("should not include column-colors key when columnColors is empty", () => {
        const board = parseBoard(SAMPLE_BOARD)

        board.settings.columnColors = {}

        const serialized = serializeBoard(board)

        expect(serialized).not.toContain("column-colors")
    })

    it("should not include today-order key when todayOrder is empty", () => {
        const board = parseBoard(SAMPLE_BOARD)

        board.settings.todayOrder = {}

        const serialized = serializeBoard(board)

        expect(serialized).not.toContain("today-order")
    })
})

describe("descriptions", () => {
    it("should parse a card with a single-line description", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] Task one @id:abc123
  This is a description

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.columns[0].cards[0].description).toBe("This is a description")
    })

    it("should parse a card with a multi-line description", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] Task one @id:abc123
  Line one
  Line two
  Line three

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.columns[0].cards[0].description).toBe("Line one\nLine two\nLine three")
    })

    it("should return null description for cards without descriptions", () => {
        const board = parseBoard(SAMPLE_BOARD)

        expect(board.columns[0].cards[0].description).toBeNull()
    })

    it("should stop description at next card line", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] Task one @id:abc123
  Description for task one
- [ ] Task two @id:def456

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.columns[0].cards[0].description).toBe("Description for task one")
        expect(board.columns[0].cards[1].description).toBeNull()
    })

    it("should stop description at column heading", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col One

- [ ] Task @id:abc123
  Some description

## Col Two

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.columns[0].cards[0].description).toBe("Some description")
    })

    it("should not parse tokens inside descriptions", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] Task @id:abc123
  Contains @today and !important tokens

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.columns[0].cards[0].description).toBe("Contains @today and !important tokens")
        expect(board.columns[0].cards[0].date).toBeNull()
    })

    it("should serialize card with description as indented lines", () => {
        const board = parseBoard(SAMPLE_BOARD)

        board.columns[0].cards[0].description = "My description\nSecond line"

        const serialized = serializeBoard(board)

        expect(serialized).toContain(
            "- [ ] Update billing dashboard @id:aaa111\n  My description\n  Second line",
        )
    })

    it("should round-trip cards with descriptions", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] Task one @id:abc123
  First description
  With two lines
- [ ] Task two @id:def456
- [x] Task three @id:ghi789
  Completed description

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)
        const serialized = serializeBoard(board)
        const reparsed = parseBoard(serialized)

        expect(reparsed.columns[0].cards[0].description).toBe("First description\nWith two lines")
        expect(reparsed.columns[0].cards[1].description).toBeNull()
        expect(reparsed.columns[0].cards[2].description).toBe("Completed description")
    })
})

describe("parseCard edge cases", () => {
    it("should keep malformed date @{invalid} in title", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] Fix bug @{invalid} @id:abc123

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.columns[0].cards[0].date).toBeNull()
        expect(board.columns[0].cards[0].title).toContain("@{invalid}")
    })

    it("should accept impossible calendar date as string passthrough", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] Fix bug @{2026-13-45} @id:abc123

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.columns[0].cards[0].date).toBe("2026-13-45")
    })

    it("should capture first linked note and remove all from title", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] [[First Note]] and [[Second Note]] @id:abc123

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.columns[0].cards[0].linkedNote).toBe("First Note")
        expect(board.columns[0].cards[0].title).not.toContain("[[")
    })

    it("should handle empty title after all tokens stripped", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] Do stuff @today !important @id:abc123

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.columns[0].cards[0].title).toBe("Do stuff")
        expect(board.columns[0].cards[0].date).toBe(TODAY_STRING)
        expect(board.columns[0].cards[0].priority).toBe("important")
        expect(board.columns[0].cards[0].id).toBe("abc123")
    })

    it("should let explicit @{date} overwrite @today", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] Task @today @{2026-03-01} @id:abc123

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.columns[0].cards[0].date).toBe("2026-03-01")
    })

    it("should not parse @id: at start of card line (regex requires leading whitespace)", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] @id:xyz789 Some task

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.columns[0].cards[0].id).not.toBe("xyz789")
        expect(board.columns[0].cards[0].id).toMatch(/^[\da-z]{6}$/)
        expect(board.columns[0].cards[0].title).toContain("@id:xyz789")
    })
})

describe("description edge cases", () => {
    it("should stop description at empty/whitespace-only line", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] Task @id:abc123
  Description line

- [ ] Next task @id:def456

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.columns[0].cards[0].description).toBe("Description line")
    })

    it("should stop description at indented checkbox line", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] Task @id:abc123
  Description here
  - [ ] Subtask
- [ ] Other @id:def456

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.columns[0].cards[0].description).toBe("Description here")
    })
})

describe("frontmatter edge cases", () => {
    it("should return empty board when missing closing ---", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

## Col

- [ ] Task @id:abc123

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.columns).toEqual([])
    })
})

describe("round-trip edge cases", () => {
    it("should survive round-trip for card with all tokens AND description", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] [[MyNote]] @today !important @{2026-03-01} @id:xyz789
  Some detailed description
  Spanning multiple lines

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)
        const serialized = serializeBoard(board)
        const reparsed = parseBoard(serialized)
        const card = reparsed.columns[0].cards[0]

        expect(card.linkedNote).toBe("MyNote")
        expect(card.priority).toBe("important")
        expect(card.date).toBe("2026-03-01")
        expect(card.id).toBe("xyz789")
        expect(card.description).toBe("Some detailed description\nSpanning multiple lines")
    })
})

describe("generateId", () => {
    it("should produce 6-char alphanumeric strings with no collisions across 100 calls", () => {
        const ids = new Set<string>()

        for (let index = 0; index < 100; index++) {
            const id = generateId()

            expect(id).toMatch(/^[\da-z]{6}$/)
            ids.add(id)
        }

        expect(ids.size).toBe(100)
    })
})

describe("round-trip", () => {
    it("should preserve board content through parse and serialize", () => {
        const board = parseBoard(SAMPLE_BOARD)
        const serialized = serializeBoard(board)
        const reparsed = parseBoard(serialized)

        expect(reparsed.columns).toHaveLength(board.columns.length)

        for (let columnIndex = 0; columnIndex < board.columns.length; columnIndex++) {
            const originalColumn = board.columns[columnIndex]
            const reparsedColumn = reparsed.columns[columnIndex]

            expect(reparsedColumn.title).toBe(originalColumn.title)
            expect(reparsedColumn.cards).toHaveLength(originalColumn.cards.length)

            for (let cardIndex = 0; cardIndex < originalColumn.cards.length; cardIndex++) {
                const originalCard = originalColumn.cards[cardIndex]
                const reparsedCard = reparsedColumn.cards[cardIndex]

                expect(reparsedCard.title).toBe(originalCard.title)
                expect(reparsedCard.completed).toBe(originalCard.completed)
                expect(reparsedCard.priority).toBe(originalCard.priority)
                expect(reparsedCard.date).toBe(originalCard.date)
                expect(reparsedCard.linkedNote).toBe(originalCard.linkedNote)
                expect(reparsedCard.id).toBe(originalCard.id)
                expect(reparsedCard.description).toBe(originalCard.description)
            }
        }

        expect(reparsed.settings.collapsedColumns).toEqual(board.settings.collapsedColumns)
    })

    it("should be idempotent on second serialize", () => {
        const board = parseBoard(SAMPLE_BOARD)
        const firstSerialize = serializeBoard(board)
        const secondSerialize = serializeBoard(parseBoard(firstSerialize))

        expect(secondSerialize).toBe(firstSerialize)
    })
})
