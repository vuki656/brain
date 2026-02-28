import { describe, expect, it } from "bun:test";

import { migrateContent } from "./migration";

const OLD_FORMAT_SIMPLE = `---

kanban-plugin: board

---

## Backlog

- [ ] Task one
- [x] Task two

%% kanban:settings
\`\`\`
{"kanban-plugin":"board","show-checkboxes":true}
\`\`\`
%%`;

const OLD_FORMAT_WITH_IMP = `---

kanban-plugin: board

---

## In Progress

- [ ] !IMP! Important unchecked task
- [x] !IMP! Important checked task
- [ ] Normal task

%% kanban:settings
\`\`\`
{}
\`\`\`
%%`;

const OLD_FORMAT_WITH_ARCHIVE = `---

kanban-plugin: board

---

## Backlog

- [ ] Active task

***

## Archive

- [x] Archived task

%% kanban:settings
\`\`\`
{"kanban-plugin":"board","show-checkboxes":true}
\`\`\`
%%`;

const OLD_FORMAT_WITH_ARCHIVE_NO_SETTINGS = `---

kanban-plugin: board

---

## Backlog

- [ ] Active task

***

## Archive

- [x] Archived task`;

const VUKI_KANBAN_FORMAT = `---

kanban-plugin: vuki-kanban

---

## Col

- [ ] Task @id:abc123

%% kanban:settings
\`\`\`json
{}
\`\`\`
%%`;

const NON_KANBAN_FORMAT = `---

title: Regular note

---

Some content here.`;

describe("migrateContent", () => {
    it("should replace kanban-plugin: board with kanban-plugin: vuki-kanban", () => {
        const result = migrateContent(OLD_FORMAT_SIMPLE);

        expect(result).not.toBeNull();
        expect(result).toContain("kanban-plugin: vuki-kanban");
        expect(result).not.toContain("kanban-plugin: board");
    });

    it("should remove !IMP! prefix from unchecked card lines", () => {
        const result = migrateContent(OLD_FORMAT_WITH_IMP);

        expect(result).not.toBeNull();
        expect(result).toContain("- [ ] Important unchecked task");
        expect(result).not.toContain("!IMP!");
    });

    it("should remove !IMP! prefix from checked card lines", () => {
        const result = migrateContent(OLD_FORMAT_WITH_IMP);

        expect(result).not.toBeNull();
        expect(result).toContain("- [x] Important checked task");
    });

    it("should preserve lines without !IMP! prefix", () => {
        const result = migrateContent(OLD_FORMAT_WITH_IMP);

        expect(result).not.toBeNull();
        expect(result).toContain("- [ ] Normal task");
    });

    it("should strip archive section and rebuild settings with existing settings block", () => {
        const result = migrateContent(OLD_FORMAT_WITH_ARCHIVE);

        expect(result).not.toBeNull();
        expect(result).not.toContain("***");
        expect(result).not.toContain("Archive");
        expect(result).not.toContain("Archived task");
        expect(result).toContain("- [ ] Active task");
        expect(result).toContain(`"collapsed-columns":[]`);
    });

    it("should strip archive section and rebuild settings without settings block", () => {
        const result = migrateContent(OLD_FORMAT_WITH_ARCHIVE_NO_SETTINGS);

        expect(result).not.toBeNull();
        expect(result).not.toContain("***");
        expect(result).not.toContain("Archive");
        expect(result).toContain("%% kanban:settings");
        expect(result).toContain("{}");
    });

    it("should return null for content not using old format", () => {
        const result = migrateContent(NON_KANBAN_FORMAT);

        expect(result).toBeNull();
    });

    it("should return null for content already using vuki-kanban", () => {
        const result = migrateContent(VUKI_KANBAN_FORMAT);

        expect(result).toBeNull();
    });

    it("should preserve non-archive content unchanged", () => {
        const result = migrateContent(OLD_FORMAT_SIMPLE);

        expect(result).not.toBeNull();
        expect(result).toContain("## Backlog");
        expect(result).toContain("- [ ] Task one");
        expect(result).toContain("- [x] Task two");
    });
});
