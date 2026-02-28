import { afterEach, beforeEach, describe, expect, it, setSystemTime } from "bun:test"

import {
    formatDate,
    getNextMonday,
    immutableSpliceCard,
    immutableUpdateCard,
    toDateString,
} from "./board-utils"
import { makeCard, makeColumns } from "./test-utils"

describe("immutableSpliceCard", () => {
    it("should remove a card without mutating the original", () => {
        const columns = makeColumns()
        const result = immutableSpliceCard({
            cardIndex: 1,
            columnIndex: 0,
            columns,
            deleteCount: 1,
        })

        expect(result[0].cards).toHaveLength(1)
        expect(result[0].cards[0].id).toBe("a1")
        expect(columns[0].cards).toHaveLength(2)
    })

    it("should insert a card at the specified position", () => {
        const columns = makeColumns()
        const newCard = makeCard({ id: "new1", title: "Inserted" })
        const result = immutableSpliceCard({
            cardIndex: 1,
            columnIndex: 0,
            columns,
            deleteCount: 0,
            insertCards: [newCard],
        })

        expect(result[0].cards).toHaveLength(3)
        expect(result[0].cards[1].id).toBe("new1")
        expect(result[0].cards[2].id).toBe("a2")
    })

    it("should replace a card when deleteCount is 1 and insert is provided", () => {
        const columns = makeColumns()
        const replacement = makeCard({ id: "r1", title: "Replaced" })
        const result = immutableSpliceCard({
            cardIndex: 0,
            columnIndex: 0,
            columns,
            deleteCount: 1,
            insertCards: [replacement],
        })

        expect(result[0].cards).toHaveLength(2)
        expect(result[0].cards[0].id).toBe("r1")
        expect(result[0].cards[1].id).toBe("a2")
    })

    it("should not modify other columns", () => {
        const columns = makeColumns()
        const result = immutableSpliceCard({
            cardIndex: 0,
            columnIndex: 0,
            columns,
            deleteCount: 1,
        })

        expect(result[1]).toBe(columns[1])
    })

    it("should insert a card at position 0", () => {
        const columns = makeColumns()
        const newCard = makeCard({ id: "front", title: "Front" })
        const result = immutableSpliceCard({
            cardIndex: 0,
            columnIndex: 0,
            columns,
            deleteCount: 0,
            insertCards: [newCard],
        })

        expect(result[0].cards).toHaveLength(3)
        expect(result[0].cards[0].id).toBe("front")
        expect(result[0].cards[1].id).toBe("a1")
    })

    it("should insert a card at the end", () => {
        const columns = makeColumns()
        const newCard = makeCard({ id: "last", title: "Last" })
        const result = immutableSpliceCard({
            cardIndex: 2,
            columnIndex: 0,
            columns,
            deleteCount: 0,
            insertCards: [newCard],
        })

        expect(result[0].cards).toHaveLength(3)
        expect(result[0].cards[2].id).toBe("last")
    })

    it("should handle splice on empty column", () => {
        const columns = [{ cards: [] as ReturnType<typeof makeCard>[], title: "Empty" }]
        const newCard = makeCard({ id: "first", title: "First" })
        const result = immutableSpliceCard({
            cardIndex: 0,
            columnIndex: 0,
            columns,
            deleteCount: 0,
            insertCards: [newCard],
        })

        expect(result[0].cards).toHaveLength(1)
        expect(result[0].cards[0].id).toBe("first")
    })

    it("should insert multiple cards at once", () => {
        const columns = makeColumns()
        const cardA = makeCard({ id: "m1", title: "Multi 1" })
        const cardB = makeCard({ id: "m2", title: "Multi 2" })
        const result = immutableSpliceCard({
            cardIndex: 1,
            columnIndex: 0,
            columns,
            deleteCount: 0,
            insertCards: [cardA, cardB],
        })

        expect(result[0].cards).toHaveLength(4)
        expect(result[0].cards[1].id).toBe("m1")
        expect(result[0].cards[2].id).toBe("m2")
        expect(result[0].cards[3].id).toBe("a2")
    })

    it("should handle large deleteCount gracefully", () => {
        const columns = makeColumns()
        const result = immutableSpliceCard({
            cardIndex: 0,
            columnIndex: 0,
            columns,
            deleteCount: 100,
        })

        expect(result[0].cards).toHaveLength(0)
    })
})

describe("immutableUpdateCard", () => {
    it("should update a card property without mutating the original", () => {
        const columns = makeColumns()
        const result = immutableUpdateCard({
            cardIndex: 0,
            columnIndex: 0,
            columns,
            update: { completed: true },
        })

        expect(result[0].cards[0].completed).toBe(true)
        expect(columns[0].cards[0].completed).toBe(false)
    })

    it("should update multiple properties at once", () => {
        const columns = makeColumns()
        const result = immutableUpdateCard({
            cardIndex: 0,
            columnIndex: 0,
            columns,
            update: {
                date: "2026-03-01",
                priority: "important",
            },
        })

        expect(result[0].cards[0].date).toBe("2026-03-01")
        expect(result[0].cards[0].priority).toBe("important")
    })

    it("should not modify other columns or cards", () => {
        const columns = makeColumns()
        const result = immutableUpdateCard({
            cardIndex: 0,
            columnIndex: 0,
            columns,
            update: { title: "Changed" },
        })

        expect(result[0].cards[1]).toBe(columns[0].cards[1])
        expect(result[1]).toBe(columns[1])
    })

    it("should handle empty partial update", () => {
        const columns = makeColumns()
        const result = immutableUpdateCard({
            cardIndex: 0,
            columnIndex: 0,
            columns,
            update: {},
        })

        expect(result[0].cards[0].title).toBe("First")
        expect(result[0].cards[0].id).toBe("a1")
    })

    it("should update card in second column", () => {
        const columns = makeColumns()
        const result = immutableUpdateCard({
            cardIndex: 0,
            columnIndex: 1,
            columns,
            update: { completed: false },
        })

        expect(result[1].cards[0].completed).toBe(false)
        expect(columns[1].cards[0].completed).toBe(true)
        expect(result[0]).toBe(columns[0])
    })
})

describe("toDateString", () => {
    it("should format a date as YYYY-MM-DD", () => {
        expect(toDateString(new Date(2026, 0, 5))).toBe("2026-01-05")
    })

    it("should zero-pad single-digit months and days", () => {
        expect(toDateString(new Date(2026, 2, 9))).toBe("2026-03-09")
    })

    it("should not zero-pad double-digit months and days", () => {
        expect(toDateString(new Date(2026, 11, 25))).toBe("2026-12-25")
    })

    it("should handle leap year Feb 29", () => {
        expect(toDateString(new Date(2024, 1, 29))).toBe("2024-02-29")
    })

    it("should handle year boundary Dec 31", () => {
        expect(toDateString(new Date(2025, 11, 31))).toBe("2025-12-31")
    })

    it("should handle year boundary Jan 1", () => {
        expect(toDateString(new Date(2026, 0, 1))).toBe("2026-01-01")
    })
})

describe("getNextMonday", () => {
    afterEach(() => {
        setSystemTime()
    })

    it("should return next Monday when today is Wednesday", () => {
        setSystemTime(new Date(2026, 1, 18))
        const result = getNextMonday()

        expect(result.getDay()).toBe(1)
        expect(toDateString(result)).toBe("2026-02-23")
    })

    it("should return next Monday when today is Monday", () => {
        setSystemTime(new Date(2026, 1, 23))
        const result = getNextMonday()

        expect(result.getDay()).toBe(1)
        expect(toDateString(result)).toBe("2026-03-02")
    })

    it("should return next Monday when today is Sunday", () => {
        setSystemTime(new Date(2026, 1, 22))
        const result = getNextMonday()

        expect(result.getDay()).toBe(1)
        expect(toDateString(result)).toBe("2026-02-23")
    })

    it("should return next Monday when today is Tuesday", () => {
        setSystemTime(new Date(2026, 1, 17))
        const result = getNextMonday()

        expect(result.getDay()).toBe(1)
        expect(toDateString(result)).toBe("2026-02-23")
    })

    it("should return next Monday when today is Thursday", () => {
        setSystemTime(new Date(2026, 1, 19))
        const result = getNextMonday()

        expect(result.getDay()).toBe(1)
        expect(toDateString(result)).toBe("2026-02-23")
    })

    it("should return next Monday when today is Friday", () => {
        setSystemTime(new Date(2026, 1, 20))
        const result = getNextMonday()

        expect(result.getDay()).toBe(1)
        expect(toDateString(result)).toBe("2026-02-23")
    })

    it("should return next Monday when today is Saturday", () => {
        setSystemTime(new Date(2026, 1, 21))
        const result = getNextMonday()

        expect(result.getDay()).toBe(1)
        expect(toDateString(result)).toBe("2026-02-23")
    })
})

describe("formatDate", () => {
    beforeEach(() => {
        setSystemTime(new Date(2026, 1, 22))
    })

    afterEach(() => {
        setSystemTime()
    })

    it("should return 'Today' for today's date", () => {
        expect(formatDate("2026-02-22")).toBe("Today")
    })

    it("should return 'Tomorrow' for tomorrow's date", () => {
        expect(formatDate("2026-02-23")).toBe("Tomorrow")
    })

    it("should return 'Yesterday' for yesterday's date", () => {
        expect(formatDate("2026-02-21")).toBe("Yesterday")
    })

    it("should return 'X days ago' for past dates", () => {
        expect(formatDate("2026-02-19")).toBe("3 days ago")
    })

    it("should return 'In X days' for near future dates", () => {
        expect(formatDate("2026-02-25")).toBe("In 3 days")
    })

    it("should return raw date string for dates more than 7 days away", () => {
        expect(formatDate("2026-03-15")).toBe("2026-03-15")
    })

    it("should return 'In 7 days' for exactly 7 days in the future", () => {
        expect(formatDate("2026-03-01")).toBe("In 7 days")
    })

    it("should return raw date string for exactly 8 days in the future", () => {
        expect(formatDate("2026-03-02")).toBe("2026-03-02")
    })

    it("should return 'X days ago' for far past dates", () => {
        expect(formatDate("2026-01-01")).toBe("52 days ago")
    })

    it("should return raw date string for far future dates", () => {
        expect(formatDate("2026-12-31")).toBe("2026-12-31")
    })
})
