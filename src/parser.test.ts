import { describe, expect, it } from "vitest";

import { parseBoard, serializeBoard } from "./parser";

const SAMPLE_BOARD = `---

kanban-plugin: vuki-kanban

---

## General

- [ ] Review payments in bank app @id:aaa111
- [ ] Call grandma @today @id:bbb222
- [ ] Style guide !important @{2026-02-25} @id:ccc333
- [x] Send AG Invoice @id:ddd444

## Ancient

- [ ] Review ognjens PRs @today !important @id:eee555
- [x] Review marc comments @{2026-02-18} @id:fff666


%% kanban:settings
\`\`\`json
{"collapsed-columns":["Medforall"]}
\`\`\`
%%`;

const SAMPLE_BOARD_NO_IDS = `---

kanban-plugin: vuki-kanban

---

## General

- [ ] Review payments in bank app
- [ ] Call grandma @today

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`;

const DASHBOARD_ORIGINAL = `---

kanban-plugin: board

---

## General

- [ ] Review payments in bank app
- [ ] Call grandma
- [ ] [[Openclaw news summary on RPI]]
- [ ] Custom kanban plugin
- [x] Send AG Invocie
- [x] ABC Email
- [x] [[Research claude plugin for auto compact as you go]]


## Ancient

- [ ] Review ognjens PRs and tickets
- [ ] Make a post in merlin channel to update UI regarding market change once PR is merged
- [ ] [[Strict mode research]]
- [ ] Play around with bun
- [ ] Improve PR review flow
- [ ] Play casino games
- [x] Review BOB structure
- [x] Ping onion so he can give you his tasks
- [x] Ask for das0 token
- [x] Make ticket for errors
- [x] !IMP! Review marc comments @{2026-02-18}
- [x] Ask QA to test bug @{2026-02-18}
- [x] Market change PR comments @{2026-02-17}
- [x] Repro promo bug and fix
- [x] Promo bug
- [x] Onion msg


## Serenity

- [ ] Review tickets on clickup @{2026-02-18}
- [ ] Openapi
- [ ] New app setup with register
- [ ] Google SSO for login to clickup
- [x] Post a status update for this month


## Medforall

- [x] [[how are emar single calendars gonna have week slider]]
- [x] Refine and polish create emar
- [x] Create eMAR flow
- [x] Fix deployed enterprise apps in azure


## Ignit

- [ ] Style guide
- [ ] Refine company goals
- [x] Update timesheet with descriptions


## SheepAI

- [ ] Add zagreb winter to web
- [ ] Ask claude whats a better way to organize discord (to avoid tagging @all)
- [x] Add logo moving bar & founders


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
        expect(board.columns[0].title).toBe("General");
        expect(board.columns[1].title).toBe("Ancient");
    });

    it("should parse card completion state", () => {
        const board = parseBoard(SAMPLE_BOARD);
        const general = board.columns[0];

        expect(general.cards[0].completed).toBe(false);
        expect(general.cards[3].completed).toBe(true);
    });

    it("should parse @today token", () => {
        const board = parseBoard(SAMPLE_BOARD);

        expect(board.columns[0].cards[1].today).toBe(true);
        expect(board.columns[0].cards[1].title).toBe("Call grandma");
        expect(board.columns[1].cards[0].today).toBe(true);
    });

    it("should parse priority tokens", () => {
        const board = parseBoard(SAMPLE_BOARD);

        expect(board.columns[0].cards[2].priority).toBe("important");
        expect(board.columns[0].cards[2].title).toBe("Style guide");
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

        expect(board.settings.collapsedColumns).toEqual(["Medforall"]);
    });

    it("should parse today order from settings", () => {
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

        expect(board.settings.todayOrder).toEqual(["abc123", "def456"]);
    });

    it("should stop parsing at archive separator", () => {
        const board = parseBoard(DASHBOARD_ORIGINAL);

        expect(board.columns.map((column) => column.title)).toEqual([
            "General",
            "Ancient",
            "Serenity",
            "Medforall",
            "Ignit",
            "SheepAI",
        ]);
    });

    it("should parse linked notes", () => {
        const board = parseBoard(DASHBOARD_ORIGINAL);
        const general = board.columns[0];

        expect(general.cards[2].linkedNote).toBe("Openclaw news summary on RPI");
        expect(general.cards[2].title).toBe("");
    });

    it("should parse dates from old format", () => {
        const board = parseBoard(DASHBOARD_ORIGINAL);
        const ancient = board.columns[1];

        const reviewMarc = ancient.cards.find((card) => card.title.includes("Review marc comments"));

        expect(reviewMarc?.date).toBe("2026-02-18");
    });

    it("should handle cards with @all without treating it as a token", () => {
        const board = parseBoard(DASHBOARD_ORIGINAL);
        const sheepAI = board.columns[5];
        const discordCard = sheepAI.cards[1];

        expect(discordCard.title).toContain("@all");
        expect(discordCard.today).toBe(false);
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

        expect(serialized).toContain("- [ ] Call grandma @today @id:bbb222");
        expect(serialized).toContain("- [ ] Style guide !important @{2026-02-25} @id:ccc333");
        expect(serialized).toContain("- [ ] Review ognjens PRs @today !important @id:eee555");
    });

    it("should serialize settings block", () => {
        const board = parseBoard(SAMPLE_BOARD);
        const serialized = serializeBoard(board);

        expect(serialized).toContain("%% kanban:settings");
        expect(serialized).toContain('"collapsed-columns":["Medforall"]');
        expect(serialized).toContain("%%");
    });

    it("should serialize today order in settings", () => {
        const board = parseBoard(SAMPLE_BOARD);

        board.settings.todayOrder = ["eee555", "bbb222"];

        const serialized = serializeBoard(board);

        expect(serialized).toContain('"today-order":["eee555","bbb222"]');
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
                expect(reparsedCard.today).toBe(originalCard.today);
                expect(reparsedCard.priority).toBe(originalCard.priority);
                expect(reparsedCard.date).toBe(originalCard.date);
                expect(reparsedCard.linkedNote).toBe(originalCard.linkedNote);
                expect(reparsedCard.id).toBe(originalCard.id);
            }
        }

        expect(reparsed.settings.collapsedColumns).toEqual(board.settings.collapsedColumns);
    });

    it("should be idempotent on second serialize", () => {
        const board = parseBoard(SAMPLE_BOARD);
        const firstSerialize = serializeBoard(board);
        const secondSerialize = serializeBoard(parseBoard(firstSerialize));

        expect(secondSerialize).toBe(firstSerialize);
    });
});
