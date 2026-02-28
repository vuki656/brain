import { describe, expect, it } from "vitest";

import { toDateString } from "./board-utils";
import { parseBoard, serializeBoard } from "./parser";

const TODAY_STRING = toDateString(new Date());

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
%%`;

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
%%`;

const DASHBOARD_ORIGINAL = `---

kanban-plugin: board

---

## Backlog

- [ ] Update billing dashboard
- [ ] Schedule weekly standup
- [ ] [[Raspberry Pi setup notes]]
- [ ] Build custom plugin
- [x] Send monthly report
- [x] Reply to vendor email
- [x] [[Research auto-compaction strategies]]


## In Progress

- [ ] Review open pull requests
- [ ] Post changelog update in team channel after deploy
- [ ] [[Strict mode research]]
- [ ] Experiment with new bundler
- [ ] Improve code review workflow
- [ ] Try load testing tool
- [x] Review project structure
- [x] Sync with teammate on task handoff
- [x] Request staging API token
- [x] Create bug report ticket
- [x] !IMP! Address code review feedback @{2026-02-18}
- [x] Ask QA to verify fix @{2026-02-18}
- [x] Respond to deploy PR comments @{2026-02-17}
- [x] Reproduce and fix promo bug
- [x] Investigate promo bug
- [x] Follow up on team message


## Project Alpha

- [ ] Triage tickets in tracker @{2026-02-18}
- [ ] Set up OpenAPI spec
- [ ] Scaffold new app with auth
- [ ] Configure SSO for project tracker
- [x] Post monthly status update


## Project Beta

- [x] [[Calendar widget week slider design]]
- [x] Polish record creation flow
- [x] Build record creation flow
- [x] Fix cloud deployment config


## Project Gamma

- [ ] Create style guide
- [ ] Define team objectives
- [x] Update timesheet entries


## Project Delta

- [ ] Add winter event to website
- [ ] Reorganize team chat channels (to avoid tagging @all)
- [x] Add logo carousel and team section


***

## Archive

- [x] test

%% kanban:settings
\`\`\`
{"kanban-plugin":"board","list-collapse":[false,false,false,false,false],"show-checkboxes":true,"hide-tags-in-title":false,"hide-tags-display":false,"hide-date-in-title":false,"hide-date-display":false,"show-relative-date":false,"prepend-archive-date":false,"prepend-archive-separator":" ","link-date-to-daily-note":false,"mark-cards-complete":true,"new-card-insertion-method":"append","show-add-list":false,"show-archive-all":true}
\`\`\`
%%`;

describe("parseBoard", () => {
    it("should parse columns from headings", () => {
        const board = parseBoard(SAMPLE_BOARD);

        expect(board.columns).toHaveLength(2);
        expect(board.columns[0].title).toBe("Backlog");
        expect(board.columns[1].title).toBe("In Progress");
    });

    it("should parse card completion state", () => {
        const board = parseBoard(SAMPLE_BOARD);
        const general = board.columns[0];

        expect(general.cards[0].completed).toBe(false);
        expect(general.cards[3].completed).toBe(true);
    });

    it("should parse @today token as today's date", () => {
        const board = parseBoard(SAMPLE_BOARD);

        expect(board.columns[0].cards[1].date).toBe(TODAY_STRING);
        expect(board.columns[0].cards[1].title).toBe("Schedule weekly standup");
        expect(board.columns[1].cards[0].date).toBe(TODAY_STRING);
    });

    it("should parse priority tokens", () => {
        const board = parseBoard(SAMPLE_BOARD);

        expect(board.columns[0].cards[2].priority).toBe("important");
        expect(board.columns[0].cards[2].title).toBe("Design system tokens");
        expect(board.columns[1].cards[0].priority).toBe("important");
    });

    it("should parse date tokens", () => {
        const board = parseBoard(SAMPLE_BOARD);

        expect(board.columns[0].cards[2].date).toBe("2026-02-25");
        expect(board.columns[1].cards[1].date).toBe("2026-02-18");
    });

    it("should parse @id token", () => {
        const board = parseBoard(SAMPLE_BOARD);

        expect(board.columns[0].cards[0].id).toBe("aaa111");
        expect(board.columns[0].cards[1].id).toBe("bbb222");
        expect(board.columns[1].cards[0].id).toBe("eee555");
    });

    it("should generate id when missing", () => {
        const board = parseBoard(SAMPLE_BOARD_NO_IDS);

        expect(board.columns[0].cards[0].id).toMatch(/^[a-z0-9]{6}$/);
        expect(board.columns[0].cards[1].id).toMatch(/^[a-z0-9]{6}$/);
        expect(board.columns[0].cards[0].id).not.toBe(board.columns[0].cards[1].id);
    });

    it("should parse collapsed columns from settings", () => {
        const board = parseBoard(SAMPLE_BOARD);

        expect(board.settings.collapsedColumns).toEqual(["Completed"]);
    });

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
%%`;

        const board = parseBoard(markdown);

        expect(board.settings.todayOrder).toEqual({
            today: ["abc123", "def456"],
            overdue: ["ghi789"],
        });
    });

    it("should migrate old array today order to record format", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## General

- [ ] Task one @id:abc123

%% kanban:settings
\`\`\`json
{"today-order":["abc123","def456"]}
\`\`\`
%%`;

        const board = parseBoard(markdown);

        expect(board.settings.todayOrder).toEqual({ today: ["abc123", "def456"] });
    });

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
%%`;

        const board = parseBoard(markdown);

        expect(board.settings.columnColors).toEqual({
            Backlog: "var(--color-red)",
            "In Progress": "var(--color-green)",
        });
    });

    it("should stop parsing at archive separator", () => {
        const board = parseBoard(DASHBOARD_ORIGINAL);

        expect(board.columns.map((column) => column.title)).toEqual([
            "Backlog",
            "In Progress",
            "Project Alpha",
            "Project Beta",
            "Project Gamma",
            "Project Delta",
        ]);
    });

    it("should parse linked notes", () => {
        const board = parseBoard(DASHBOARD_ORIGINAL);
        const general = board.columns[0];

        expect(general.cards[2].linkedNote).toBe("Raspberry Pi setup notes");
        expect(general.cards[2].title).toBe("");
    });

    it("should parse dates from old format", () => {
        const board = parseBoard(DASHBOARD_ORIGINAL);
        const inProgress = board.columns[1];

        const reviewFeedback = inProgress.cards.find((card) => card.title.includes("Address code review feedback"));

        expect(reviewFeedback?.date).toBe("2026-02-18");
    });

    it("should handle cards with @all without treating it as a token", () => {
        const board = parseBoard(DASHBOARD_ORIGINAL);
        const projectDelta = board.columns[5];
        const chatCard = projectDelta.cards[1];

        expect(chatCard.title).toContain("@all");
        expect(chatCard.date).toBeNull();
    });

    it("should parse archived cards after *** separator", () => {
        const board = parseBoard(DASHBOARD_ORIGINAL);

        expect(board.archivedCards).toHaveLength(1);
        expect(board.archivedCards[0].title).toBe("test");
        expect(board.archivedCards[0].completed).toBe(true);
    });

    it("should return empty archivedCards when no archive section exists", () => {
        const board = parseBoard(SAMPLE_BOARD);

        expect(board.archivedCards).toEqual([]);
    });

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
%%`;

        const board = parseBoard(markdown);

        expect(board.columns).toHaveLength(2);
        expect(board.columns[0].cards).toEqual([]);
        expect(board.columns[1].cards).toEqual([]);
    });

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
%%`;

        const board = parseBoard(markdown);
        const card = board.columns[0].cards[0];

        expect(card.linkedNote).toBe("MyNote");
        expect(card.priority).toBe("important");
        expect(card.date).toBe("2026-03-01");
        expect(card.id).toBe("xyz789");
    });

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
%%`;

        const board = parseBoard(markdown);

        expect(board.columns).toHaveLength(1);
        expect(board.settings.collapsedColumns).toEqual([]);
        expect(board.settings.todayOrder).toEqual({});
        expect(board.settings.columnColors).toEqual({});
    });

    it("should handle markdown with no columns", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`;

        const board = parseBoard(markdown);

        expect(board.columns).toEqual([]);
        expect(board.archivedCards).toEqual([]);
    });
});

describe("serializeBoard", () => {
    it("should produce valid frontmatter", () => {
        const board = parseBoard(SAMPLE_BOARD);
        const serialized = serializeBoard(board);

        expect(serialized).toContain("kanban-plugin: vuki-kanban");
        expect(serialized.startsWith("---\n")).toBe(true);
    });

    it("should serialize cards with tokens in canonical order including id", () => {
        const board = parseBoard(SAMPLE_BOARD);
        const serialized = serializeBoard(board);

        expect(serialized).toContain("- [ ] Schedule weekly standup @today @id:bbb222");
        expect(serialized).toContain("- [ ] Design system tokens !important @{2026-02-25} @id:ccc333");
        expect(serialized).toContain("- [ ] Review open pull requests @today !important @id:eee555");
        expect(serialized).not.toContain(`@today @{${TODAY_STRING}}`);
    });

    it("should serialize settings block", () => {
        const board = parseBoard(SAMPLE_BOARD);
        const serialized = serializeBoard(board);

        expect(serialized).toContain("%% kanban:settings");
        expect(serialized).toContain('"collapsed-columns":["Completed"]');
        expect(serialized).toContain("%%");
    });

    it("should serialize archived cards after *** separator", () => {
        const board = parseBoard(DASHBOARD_ORIGINAL);
        const serialized = serializeBoard(board);

        expect(serialized).toContain("***");
        expect(serialized).toContain("- [x] test");
    });

    it("should not include *** when there are no archived cards", () => {
        const board = parseBoard(SAMPLE_BOARD);
        const serialized = serializeBoard(board);

        expect(serialized).not.toContain("***");
    });

    it("should serialize today order record in settings", () => {
        const board = parseBoard(SAMPLE_BOARD);

        board.settings.todayOrder = { today: ["eee555", "bbb222"], overdue: ["aaa111"] };

        const serialized = serializeBoard(board);

        expect(serialized).toContain('"today-order":{"today":["eee555","bbb222"],"overdue":["aaa111"]}');
    });

    it("should serialize column colors in settings", () => {
        const board = parseBoard(SAMPLE_BOARD);

        board.settings.columnColors = { General: "var(--color-red)" };

        const serialized = serializeBoard(board);

        expect(serialized).toContain('"column-colors":{"General":"var(--color-red)"}');
    });

    it("should not include column-colors key when columnColors is empty", () => {
        const board = parseBoard(SAMPLE_BOARD);

        board.settings.columnColors = {};

        const serialized = serializeBoard(board);

        expect(serialized).not.toContain("column-colors");
    });

    it("should not include today-order key when todayOrder is empty", () => {
        const board = parseBoard(SAMPLE_BOARD);

        board.settings.todayOrder = {};

        const serialized = serializeBoard(board);

        expect(serialized).not.toContain("today-order");
    });
});

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
%%`;

        const board = parseBoard(markdown);

        expect(board.columns[0].cards[0].description).toBe("This is a description");
    });

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
%%`;

        const board = parseBoard(markdown);

        expect(board.columns[0].cards[0].description).toBe("Line one\nLine two\nLine three");
    });

    it("should return null description for cards without descriptions", () => {
        const board = parseBoard(SAMPLE_BOARD);

        expect(board.columns[0].cards[0].description).toBeNull();
    });

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
%%`;

        const board = parseBoard(markdown);

        expect(board.columns[0].cards[0].description).toBe("Description for task one");
        expect(board.columns[0].cards[1].description).toBeNull();
    });

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
%%`;

        const board = parseBoard(markdown);

        expect(board.columns[0].cards[0].description).toBe("Some description");
    });

    it("should stop description at archive separator", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] Task @id:abc123
  Description here

***

- [x] Archived @id:def456

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`;

        const board = parseBoard(markdown);

        expect(board.columns[0].cards[0].description).toBe("Description here");
    });

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
%%`;

        const board = parseBoard(markdown);

        expect(board.columns[0].cards[0].description).toBe("Contains @today and !important tokens");
        expect(board.columns[0].cards[0].date).toBeNull();
    });

    it("should serialize card with description as indented lines", () => {
        const board = parseBoard(SAMPLE_BOARD);

        board.columns[0].cards[0].description = "My description\nSecond line";

        const serialized = serializeBoard(board);

        expect(serialized).toContain("- [ ] Update billing dashboard @id:aaa111\n  My description\n  Second line");
    });

    it("should parse descriptions on archived cards", () => {
        const markdown = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] Task @id:abc123

***

- [x] Archived task @id:def456
  Archived description

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`;

        const board = parseBoard(markdown);

        expect(board.archivedCards[0].description).toBe("Archived description");
    });

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
%%`;

        const board = parseBoard(markdown);
        const serialized = serializeBoard(board);
        const reparsed = parseBoard(serialized);

        expect(reparsed.columns[0].cards[0].description).toBe("First description\nWith two lines");
        expect(reparsed.columns[0].cards[1].description).toBeNull();
        expect(reparsed.columns[0].cards[2].description).toBe("Completed description");
    });
});

describe("round-trip", () => {
    it("should preserve board content through parse and serialize", () => {
        const board = parseBoard(SAMPLE_BOARD);
        const serialized = serializeBoard(board);
        const reparsed = parseBoard(serialized);

        expect(reparsed.columns).toHaveLength(board.columns.length);

        for (let columnIndex = 0; columnIndex < board.columns.length; columnIndex++) {
            const originalColumn = board.columns[columnIndex];
            const reparsedColumn = reparsed.columns[columnIndex];

            expect(reparsedColumn.title).toBe(originalColumn.title);
            expect(reparsedColumn.cards).toHaveLength(originalColumn.cards.length);

            for (let cardIndex = 0; cardIndex < originalColumn.cards.length; cardIndex++) {
                const originalCard = originalColumn.cards[cardIndex];
                const reparsedCard = reparsedColumn.cards[cardIndex];

                expect(reparsedCard.title).toBe(originalCard.title);
                expect(reparsedCard.completed).toBe(originalCard.completed);
                expect(reparsedCard.priority).toBe(originalCard.priority);
                expect(reparsedCard.date).toBe(originalCard.date);
                expect(reparsedCard.linkedNote).toBe(originalCard.linkedNote);
                expect(reparsedCard.id).toBe(originalCard.id);
                expect(reparsedCard.description).toBe(originalCard.description);
            }
        }

        expect(reparsed.settings.collapsedColumns).toEqual(board.settings.collapsedColumns);
    });

    it("should preserve archived cards through round-trip", () => {
        const board = parseBoard(DASHBOARD_ORIGINAL);
        const serialized = serializeBoard(board);
        const reparsed = parseBoard(serialized);

        expect(reparsed.archivedCards).toHaveLength(board.archivedCards.length);

        for (let index = 0; index < board.archivedCards.length; index++) {
            expect(reparsed.archivedCards[index].title).toBe(board.archivedCards[index].title);
            expect(reparsed.archivedCards[index].completed).toBe(board.archivedCards[index].completed);
            expect(reparsed.archivedCards[index].id).toBe(board.archivedCards[index].id);
        }
    });

    it("should be idempotent on second serialize", () => {
        const board = parseBoard(SAMPLE_BOARD);
        const firstSerialize = serializeBoard(board);
        const secondSerialize = serializeBoard(parseBoard(firstSerialize));

        expect(secondSerialize).toBe(firstSerialize);
    });
});
