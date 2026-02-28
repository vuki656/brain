import { describe, expect, it } from "bun:test"

import { makeCard, makeColumns } from "../../shared/test-utils"

import { immutableSpliceCard, immutableUpdateCard } from "./card-mutations"

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
