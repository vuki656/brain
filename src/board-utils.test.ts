import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { immutableSpliceCard, immutableUpdateCard, toDateString, getNextMonday, formatDate } from "./board-utils";
import { Column } from "./types";

function makeCard(overrides: Partial<{ title: string; completed: boolean; priority: "important" | null; date: string | null; linkedNote: string | null; id: string; description: string | null }> = {}) {
    return {
        title: overrides.title ?? "Test card",
        completed: overrides.completed ?? false,
        priority: overrides.priority ?? null,
        date: overrides.date ?? null,
        linkedNote: overrides.linkedNote ?? null,
        id: overrides.id ?? "abc123",
        description: overrides.description ?? null,
    };
}

function makeColumns(): Column[] {
    return [
        { title: "Todo", cards: [makeCard({ id: "a1", title: "First" }), makeCard({ id: "a2", title: "Second" })] },
        { title: "Done", cards: [makeCard({ id: "b1", title: "Third", completed: true })] },
    ];
}

describe("immutableSpliceCard", () => {
    it("should remove a card without mutating the original", () => {
        const columns = makeColumns();
        const result = immutableSpliceCard(columns, 0, 1, 1);

        expect(result[0].cards).toHaveLength(1);
        expect(result[0].cards[0].id).toBe("a1");
        expect(columns[0].cards).toHaveLength(2);
    });

    it("should insert a card at the specified position", () => {
        const columns = makeColumns();
        const newCard = makeCard({ id: "new1", title: "Inserted" });
        const result = immutableSpliceCard(columns, 0, 1, 0, newCard);

        expect(result[0].cards).toHaveLength(3);
        expect(result[0].cards[1].id).toBe("new1");
        expect(result[0].cards[2].id).toBe("a2");
    });

    it("should replace a card when deleteCount is 1 and insert is provided", () => {
        const columns = makeColumns();
        const replacement = makeCard({ id: "r1", title: "Replaced" });
        const result = immutableSpliceCard(columns, 0, 0, 1, replacement);

        expect(result[0].cards).toHaveLength(2);
        expect(result[0].cards[0].id).toBe("r1");
        expect(result[0].cards[1].id).toBe("a2");
    });

    it("should not modify other columns", () => {
        const columns = makeColumns();
        const result = immutableSpliceCard(columns, 0, 0, 1);

        expect(result[1]).toBe(columns[1]);
    });
});

describe("immutableUpdateCard", () => {
    it("should update a card property without mutating the original", () => {
        const columns = makeColumns();
        const result = immutableUpdateCard(columns, 0, 0, { completed: true });

        expect(result[0].cards[0].completed).toBe(true);
        expect(columns[0].cards[0].completed).toBe(false);
    });

    it("should update multiple properties at once", () => {
        const columns = makeColumns();
        const result = immutableUpdateCard(columns, 0, 0, { date: "2026-03-01", priority: "important" });

        expect(result[0].cards[0].date).toBe("2026-03-01");
        expect(result[0].cards[0].priority).toBe("important");
    });

    it("should not modify other columns or cards", () => {
        const columns = makeColumns();
        const result = immutableUpdateCard(columns, 0, 0, { title: "Changed" });

        expect(result[0].cards[1]).toBe(columns[0].cards[1]);
        expect(result[1]).toBe(columns[1]);
    });
});

describe("toDateString", () => {
    it("should format a date as YYYY-MM-DD", () => {
        expect(toDateString(new Date(2026, 0, 5))).toBe("2026-01-05");
    });

    it("should zero-pad single-digit months and days", () => {
        expect(toDateString(new Date(2026, 2, 9))).toBe("2026-03-09");
    });

    it("should not zero-pad double-digit months and days", () => {
        expect(toDateString(new Date(2026, 11, 25))).toBe("2026-12-25");
    });
});

describe("getNextMonday", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should return next Monday when today is Wednesday", () => {
        vi.setSystemTime(new Date(2026, 1, 18));
        const result = getNextMonday();

        expect(result.getDay()).toBe(1);
        expect(toDateString(result)).toBe("2026-02-23");
    });

    it("should return next Monday when today is Monday", () => {
        vi.setSystemTime(new Date(2026, 1, 23));
        const result = getNextMonday();

        expect(result.getDay()).toBe(1);
        expect(toDateString(result)).toBe("2026-03-02");
    });

    it("should return next Monday when today is Sunday", () => {
        vi.setSystemTime(new Date(2026, 1, 22));
        const result = getNextMonday();

        expect(result.getDay()).toBe(1);
        expect(toDateString(result)).toBe("2026-02-23");
    });
});

describe("formatDate", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 1, 22));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should return 'Today' for today's date", () => {
        expect(formatDate("2026-02-22")).toBe("Today");
    });

    it("should return 'Tomorrow' for tomorrow's date", () => {
        expect(formatDate("2026-02-23")).toBe("Tomorrow");
    });

    it("should return 'Yesterday' for yesterday's date", () => {
        expect(formatDate("2026-02-21")).toBe("Yesterday");
    });

    it("should return 'X days ago' for past dates", () => {
        expect(formatDate("2026-02-19")).toBe("3 days ago");
    });

    it("should return 'In X days' for near future dates", () => {
        expect(formatDate("2026-02-25")).toBe("In 3 days");
    });

    it("should return raw date string for dates more than 7 days away", () => {
        expect(formatDate("2026-03-15")).toBe("2026-03-15");
    });
});
