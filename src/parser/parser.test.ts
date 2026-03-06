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
{"collapsed-projects":["Completed"]}
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
    it("should parse projects from headings", () => {
        const board = parseBoard(SAMPLE_BOARD)

        expect(board.projects).toHaveLength(2)
        expect(board.projects[0].title).toBe("Backlog")
        expect(board.projects[1].title).toBe("In Progress")
    })

    it("should parse card completion state", () => {
        const board = parseBoard(SAMPLE_BOARD)
        const general = board.projects[0]

        expect(general.cards[0].completed).toBe(false)
        expect(general.cards[3].completed).toBe(true)
    })

    it("should parse @today token as today's date", () => {
        const board = parseBoard(SAMPLE_BOARD)

        expect(board.projects[0].cards[1].date).toBe(TODAY_STRING)
        expect(board.projects[0].cards[1].title).toBe("Schedule weekly standup")
        expect(board.projects[1].cards[0].date).toBe(TODAY_STRING)
    })

    it("should parse priority tokens", () => {
        const board = parseBoard(SAMPLE_BOARD)

        expect(board.projects[0].cards[2].priority).toBe("important")
        expect(board.projects[0].cards[2].title).toBe("Design system tokens")
        expect(board.projects[1].cards[0].priority).toBe("important")
    })

    it("should parse date tokens", () => {
        const board = parseBoard(SAMPLE_BOARD)

        expect(board.projects[0].cards[2].date).toBe("2026-02-25")
        expect(board.projects[1].cards[1].date).toBe("2026-02-18")
    })

    it("should parse @id token", () => {
        const board = parseBoard(SAMPLE_BOARD)

        expect(board.projects[0].cards[0].id).toBe("aaa111")
        expect(board.projects[0].cards[1].id).toBe("bbb222")
        expect(board.projects[1].cards[0].id).toBe("eee555")
    })

    it("should generate id when missing", () => {
        const board = parseBoard(SAMPLE_BOARD_NO_IDS)

        expect(board.projects[0].cards[0].id).toMatch(/^[\da-z]{6}$/)
        expect(board.projects[0].cards[1].id).toMatch(/^[\da-z]{6}$/)
        expect(board.projects[0].cards[0].id).not.toBe(board.projects[0].cards[1].id)
    })

    it("should parse collapsed projects from settings", () => {
        const board = parseBoard(SAMPLE_BOARD)

        expect(board.settings.collapsedProjects).toEqual(["Completed"])
    })

    it("should parse archived projects from settings", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## General

- [ ] Task one @id:abc123

%% kanban:settings
\`\`\`json
{"archived-projects":["Done","Later"]}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.settings.archivedProjects).toEqual(["Done", "Later"])
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

    it("should parse project colors from settings", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## General

- [ ] Task one @id:abc123

%% kanban:settings
\`\`\`json
{"project-colors":{"Backlog":"var(--color-red)","In Progress":"var(--color-green)"}}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.settings.projectColors).toEqual({
            Backlog: "var(--color-red)",
            "In Progress": "var(--color-green)",
        })
    })

    it("should parse project icons from settings", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## General

- [ ] Task one @id:abc123

%% kanban:settings
\`\`\`json
{"project-icons":{"Backlog":"rocket","In Progress":"code"}}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.settings.projectIcons).toEqual({
            Backlog: "rocket",
            "In Progress": "code",
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

        expect(board.projects[0].cards[0].linkedNote).toBe("Raspberry Pi setup notes")
        expect(board.projects[0].cards[0].title).toBe("")
        expect(board.projects[0].cards[1].linkedNote).toBeNull()
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
        const card = board.projects[0].cards[0]

        expect(card.title).toContain("@all")
        expect(card.date).toBeNull()
    })

    it("should handle empty projects", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Empty Project

## Another Empty

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.projects).toHaveLength(2)
        expect(board.projects[0].cards).toEqual([])
        expect(board.projects[1].cards).toEqual([])
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
        const card = board.projects[0].cards[0]

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

        expect(board.projects).toHaveLength(1)
        expect(board.settings.archivedProjects).toEqual([])
        expect(board.settings.collapsedProjects).toEqual([])
        expect(board.settings.projectColors).toEqual({})
        expect(board.settings.projectIcons).toEqual({})
        expect(board.settings.todayOrder).toEqual({})
    })

    it("should handle markdown with no projects", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.projects).toEqual([])
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
        expect(serialized).toContain('"collapsed-projects":["Completed"]')
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

    it("should serialize project colors in settings", () => {
        const board = parseBoard(SAMPLE_BOARD)

        board.settings.projectColors = { General: "var(--color-red)" }

        const serialized = serializeBoard(board)

        expect(serialized).toContain('"project-colors":{"General":"var(--color-red)"}')
    })

    it("should serialize project icons in settings", () => {
        const board = parseBoard(SAMPLE_BOARD)

        board.settings.projectIcons = { Backlog: "rocket" }

        const serialized = serializeBoard(board)

        expect(serialized).toContain('"project-icons":{"Backlog":"rocket"}')
    })

    it("should not include project-icons key when projectIcons is empty", () => {
        const board = parseBoard(SAMPLE_BOARD)

        board.settings.projectIcons = {}

        const serialized = serializeBoard(board)

        expect(serialized).not.toContain("project-icons")
    })

    it("should not include project-colors key when projectColors is empty", () => {
        const board = parseBoard(SAMPLE_BOARD)

        board.settings.projectColors = {}

        const serialized = serializeBoard(board)

        expect(serialized).not.toContain("project-colors")
    })

    it("should serialize archived projects in settings", () => {
        const board = parseBoard(SAMPLE_BOARD)

        board.settings.archivedProjects = ["Done", "Later"]

        const serialized = serializeBoard(board)

        expect(serialized).toContain('"archived-projects":["Done","Later"]')
    })

    it("should not include archived-projects key when archivedProjects is empty", () => {
        const board = parseBoard(SAMPLE_BOARD)

        board.settings.archivedProjects = []

        const serialized = serializeBoard(board)

        expect(serialized).not.toContain("archived-projects")
    })

    it("should round-trip archived projects through parse and serialize", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Backlog

- [ ] Task one @id:abc123

## Done

- [x] Task two @id:def456

%% kanban:settings
\`\`\`json
{"archived-projects":["Done"]}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.settings.archivedProjects).toEqual(["Done"])

        const serialized = serializeBoard(board)
        const reparsed = parseBoard(serialized)

        expect(reparsed.settings.archivedProjects).toEqual(["Done"])
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

        expect(board.projects[0].cards[0].description).toBe("This is a description")
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

        expect(board.projects[0].cards[0].description).toBe("Line one\nLine two\nLine three")
    })

    it("should return null description for cards without descriptions", () => {
        const board = parseBoard(SAMPLE_BOARD)

        expect(board.projects[0].cards[0].description).toBeNull()
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

        expect(board.projects[0].cards[0].description).toBe("Description for task one")
        expect(board.projects[0].cards[1].description).toBeNull()
    })

    it("should stop description at project heading", () => {
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

        expect(board.projects[0].cards[0].description).toBe("Some description")
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

        expect(board.projects[0].cards[0].description).toBe("Contains @today and !important tokens")
        expect(board.projects[0].cards[0].date).toBeNull()
    })

    it("should serialize card with description as indented lines", () => {
        const board = parseBoard(SAMPLE_BOARD)

        board.projects[0].cards[0].description = "My description\nSecond line"

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

        expect(reparsed.projects[0].cards[0].description).toBe("First description\nWith two lines")
        expect(reparsed.projects[0].cards[1].description).toBeNull()
        expect(reparsed.projects[0].cards[2].description).toBe("Completed description")
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

        expect(board.projects[0].cards[0].date).toBeNull()
        expect(board.projects[0].cards[0].title).toContain("@{invalid}")
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

        expect(board.projects[0].cards[0].date).toBe("2026-13-45")
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

        expect(board.projects[0].cards[0].linkedNote).toBe("First Note")
        expect(board.projects[0].cards[0].title).not.toContain("[[")
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

        expect(board.projects[0].cards[0].title).toBe("Do stuff")
        expect(board.projects[0].cards[0].date).toBe(TODAY_STRING)
        expect(board.projects[0].cards[0].priority).toBe("important")
        expect(board.projects[0].cards[0].id).toBe("abc123")
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

        expect(board.projects[0].cards[0].date).toBe("2026-03-01")
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

        expect(board.projects[0].cards[0].id).not.toBe("xyz789")
        expect(board.projects[0].cards[0].id).toMatch(/^[\da-z]{6}$/)
        expect(board.projects[0].cards[0].title).toContain("@id:xyz789")
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

        expect(board.projects[0].cards[0].description).toBe("Description line")
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

        expect(board.projects[0].cards[0].description).toBe("Description here")
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

        expect(board.projects).toEqual([])
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
        const card = reparsed.projects[0].cards[0]

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

describe("blocked status", () => {
    it("should parse card with !blocked(reason)", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] Deploy API changes !blocked(waiting on staging environment) @id:abc123

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)
        const card = board.projects[0].cards[0]

        expect(card.blockedReason).toBe("waiting on staging environment")
        expect(card.title).toBe("Deploy API changes")
    })

    it("should parse card without blocked as null", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] Regular task @id:abc123

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)

        expect(board.projects[0].cards[0].blockedReason).toBeNull()
    })

    it("should parse card with both !important and !blocked(reason)", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] Critical fix !important !blocked(waiting on security review) @id:abc123

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)
        const card = board.projects[0].cards[0]

        expect(card.priority).toBe("important")
        expect(card.blockedReason).toBe("waiting on security review")
        expect(card.title).toBe("Critical fix")
    })

    it("should round-trip blocked cards through parse and serialize", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] Task one !important !blocked(need database migration) @id:abc123
- [ ] Task two @id:def456

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)
        const serialized = serializeBoard(board)
        const reparsed = parseBoard(serialized)

        expect(reparsed.projects[0].cards[0].blockedReason).toBe("need database migration")
        expect(reparsed.projects[0].cards[0].priority).toBe("important")
        expect(reparsed.projects[0].cards[1].blockedReason).toBeNull()

        const secondSerialize = serializeBoard(reparsed)

        expect(secondSerialize).toBe(serialized)
    })

    it("should handle blocked reason with special characters", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] Complex task !blocked(waiting on: API keys, certificates) @id:abc123

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`

        const board = parseBoard(markdown)
        const card = board.projects[0].cards[0]

        expect(card.blockedReason).toBe("waiting on: API keys, certificates")
        expect(card.title).toBe("Complex task")

        const serialized = serializeBoard(board)

        expect(serialized).toContain("!blocked(waiting on: API keys, certificates)")
    })
})

describe("round-trip", () => {
    it("should preserve board content through parse and serialize", () => {
        const board = parseBoard(SAMPLE_BOARD)
        const serialized = serializeBoard(board)
        const reparsed = parseBoard(serialized)

        expect(reparsed.projects).toHaveLength(board.projects.length)

        for (let projectIndex = 0; projectIndex < board.projects.length; projectIndex++) {
            const originalProject = board.projects[projectIndex]
            const reparsedProject = reparsed.projects[projectIndex]

            expect(reparsedProject.title).toBe(originalProject.title)
            expect(reparsedProject.cards).toHaveLength(originalProject.cards.length)

            for (let cardIndex = 0; cardIndex < originalProject.cards.length; cardIndex++) {
                const originalCard = originalProject.cards[cardIndex]
                const reparsedCard = reparsedProject.cards[cardIndex]

                expect(reparsedCard.title).toBe(originalCard.title)
                expect(reparsedCard.completed).toBe(originalCard.completed)
                expect(reparsedCard.priority).toBe(originalCard.priority)
                expect(reparsedCard.blockedReason).toBe(originalCard.blockedReason)
                expect(reparsedCard.date).toBe(originalCard.date)
                expect(reparsedCard.linkedNote).toBe(originalCard.linkedNote)
                expect(reparsedCard.id).toBe(originalCard.id)
                expect(reparsedCard.description).toBe(originalCard.description)
            }
        }

        expect(reparsed.settings.collapsedProjects).toEqual(board.settings.collapsedProjects)
    })

    it("should be idempotent on second serialize", () => {
        const board = parseBoard(SAMPLE_BOARD)
        const firstSerialize = serializeBoard(board)
        const secondSerialize = serializeBoard(parseBoard(firstSerialize))

        expect(secondSerialize).toBe(firstSerialize)
    })
})
