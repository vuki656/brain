import { afterEach, describe, expect, it, setSystemTime } from "bun:test"

import { toDateString } from "../../shared"
import { makeBoard, makeCard, makeTodayCard } from "../../shared/test-utils"

import {
    collectCardsByDateGroup,
    formatDateGroupLabel,
    formatDateGroupSubtitle,
    getDateForSection,
    isCardVisibleInTodayFilter,
    sortCardsByOrder,
} from "./today-view.utils"

describe("isCardVisibleInTodayFilter", () => {
    it("should return false for completed card with date", () => {
        expect(isCardVisibleInTodayFilter(makeCard({ completed: true, date: "2026-03-01" }))).toBe(
            false,
        )
    })

    it("should return false for completed card without date", () => {
        expect(isCardVisibleInTodayFilter(makeCard({ completed: true }))).toBe(false)
    })

    it("should return true for incomplete card with date", () => {
        expect(isCardVisibleInTodayFilter(makeCard({ date: "2026-03-01" }))).toBe(true)
    })

    it("should return false for incomplete card without date", () => {
        expect(isCardVisibleInTodayFilter(makeCard())).toBe(false)
    })
})

describe("sortCardsByOrder", () => {
    it("should return cards unchanged when savedOrder is empty", () => {
        const cards = [
            makeTodayCard({ card: { id: "aaa" } }),
            makeTodayCard({ card: { id: "bbb" } }),
        ]

        const result = sortCardsByOrder(cards, [])

        expect(result[0].card.id).toBe("aaa")
        expect(result[1].card.id).toBe("bbb")
    })

    it("should sort cards according to savedOrder", () => {
        const cards = [
            makeTodayCard({ card: { id: "aaa" } }),
            makeTodayCard({ card: { id: "bbb" } }),
            makeTodayCard({ card: { id: "ccc" } }),
        ]

        const result = sortCardsByOrder(cards, ["ccc", "aaa", "bbb"])

        expect(result[0].card.id).toBe("ccc")
        expect(result[1].card.id).toBe("aaa")
        expect(result[2].card.id).toBe("bbb")
    })

    it("should place cards not in savedOrder after ordered ones", () => {
        const cards = [
            makeTodayCard({ card: { id: "aaa" } }),
            makeTodayCard({ card: { id: "bbb" } }),
            makeTodayCard({ card: { id: "ccc" } }),
        ]

        const result = sortCardsByOrder(cards, ["ccc"])

        expect(result[0].card.id).toBe("ccc")
        expect(
            result.slice(1).map((todayCard) => {
                return todayCard.card.id
            }),
        ).toContain("aaa")
        expect(
            result.slice(1).map((todayCard) => {
                return todayCard.card.id
            }),
        ).toContain("bbb")
    })

    it("should handle all cards missing from savedOrder", () => {
        const cards = [
            makeTodayCard({ card: { id: "aaa" } }),
            makeTodayCard({ card: { id: "bbb" } }),
        ]

        const result = sortCardsByOrder(cards, ["zzz", "yyy"])

        expect(result).toHaveLength(2)
        expect(result[0].card.id).toBe("aaa")
        expect(result[1].card.id).toBe("bbb")
    })

    it("should not mutate input array", () => {
        const cards = [
            makeTodayCard({ card: { id: "bbb" } }),
            makeTodayCard({ card: { id: "aaa" } }),
        ]
        const original = [...cards]

        sortCardsByOrder(cards, ["aaa", "bbb"])

        expect(cards[0].card.id).toBe(original[0].card.id)
        expect(cards[1].card.id).toBe(original[1].card.id)
    })
})

describe("formatDateGroupLabel", () => {
    afterEach(() => {
        setSystemTime()
    })

    it("should return 'Tomorrow' for +1 day", () => {
        setSystemTime(new Date(2026, 1, 22))

        expect(formatDateGroupLabel("2026-02-23")).toBe("Tomorrow")
    })

    it("should return 'In N days' for 2-7 days future", () => {
        setSystemTime(new Date(2026, 1, 22))

        expect(formatDateGroupLabel("2026-02-25")).toBe("In 3 days")
    })

    it("should return formatted date for >7 days away", () => {
        setSystemTime(new Date(2026, 1, 22))
        const result = formatDateGroupLabel("2026-03-15")

        expect(result).toContain("Mar")
        expect(result).toContain("15")
    })

    it("should return 'In N days' for past dates (negative N, only called for future in practice)", () => {
        setSystemTime(new Date(2026, 1, 22))
        const result = formatDateGroupLabel("2026-02-10")

        expect(result).toBe("In -12 days")
    })
})

describe("formatDateGroupSubtitle", () => {
    afterEach(() => {
        setSystemTime()
    })

    it("should return empty string for 'today' key", () => {
        expect(formatDateGroupSubtitle("today")).toBe("")
    })

    it("should return empty string for 'overdue' key", () => {
        expect(formatDateGroupSubtitle("overdue")).toBe("")
    })

    it("should return weekday+date string for 1-7 days future", () => {
        setSystemTime(new Date(2026, 1, 22))
        const result = formatDateGroupSubtitle("2026-02-25")

        expect(result).toContain("Wed")
        expect(result).toContain("Feb")
        expect(result).toContain("25")
    })

    it("should return empty string for >7 days future", () => {
        setSystemTime(new Date(2026, 1, 22))

        expect(formatDateGroupSubtitle("2026-03-15")).toBe("")
    })
})

describe("collectCardsByDateGroup", () => {
    afterEach(() => {
        setSystemTime()
    })

    it("should always include 'Today' group even when empty", () => {
        setSystemTime(new Date(2026, 1, 22))
        const board = makeBoard({
            columns: [{ cards: [], title: "Col" }],
        })

        const groups = collectCardsByDateGroup(board)
        const todayGroup = groups.find((group) => {
            return group.dateKey === "today"
        })

        expect(todayGroup).toBeDefined()
        expect(todayGroup!.cards).toHaveLength(0)
    })

    it("should group today's cards into 'Today'", () => {
        setSystemTime(new Date(2026, 1, 22))
        const board = makeBoard({
            columns: [
                {
                    cards: [makeCard({ date: "2026-02-22", id: "t1" })],
                    title: "Col",
                },
            ],
        })

        const groups = collectCardsByDateGroup(board)
        const todayGroup = groups.find((group) => {
            return group.dateKey === "today"
        })

        expect(todayGroup!.cards).toHaveLength(1)
        expect(todayGroup!.cards[0].card.id).toBe("t1")
    })

    it("should group overdue cards into 'Overdue' before 'Today'", () => {
        setSystemTime(new Date(2026, 1, 22))
        const board = makeBoard({
            columns: [
                {
                    cards: [
                        makeCard({ date: "2026-02-20", id: "od1" }),
                        makeCard({ date: "2026-02-22", id: "t1" }),
                    ],
                    title: "Col",
                },
            ],
        })

        const groups = collectCardsByDateGroup(board)

        expect(groups[0].dateKey).toBe("overdue")
        expect(groups[0].cards[0].card.id).toBe("od1")
        expect(groups[1].dateKey).toBe("today")
    })

    it("should not include 'Overdue' group when no overdue cards", () => {
        setSystemTime(new Date(2026, 1, 22))
        const board = makeBoard({
            columns: [
                {
                    cards: [makeCard({ date: "2026-02-22", id: "t1" })],
                    title: "Col",
                },
            ],
        })

        const groups = collectCardsByDateGroup(board)

        expect(groups[0].dateKey).toBe("today")
        expect(
            groups.find((group) => {
                return group.dateKey === "overdue"
            }),
        ).toBeUndefined()
    })

    it("should group future cards by date sorted chronologically", () => {
        setSystemTime(new Date(2026, 1, 22))
        const board = makeBoard({
            columns: [
                {
                    cards: [
                        makeCard({ date: "2026-02-25", id: "f2" }),
                        makeCard({ date: "2026-02-24", id: "f1" }),
                    ],
                    title: "Col",
                },
            ],
        })

        const groups = collectCardsByDateGroup(board)
        const futureGroups = groups.filter((group) => {
            return group.dateKey !== "today" && group.dateKey !== "overdue"
        })

        expect(futureGroups).toHaveLength(2)
        expect(futureGroups[0].dateKey).toBe("2026-02-24")
        expect(futureGroups[1].dateKey).toBe("2026-02-25")
    })

    it("should apply savedOrder sorting within groups", () => {
        setSystemTime(new Date(2026, 1, 22))
        const board = makeBoard({
            columns: [
                {
                    cards: [
                        makeCard({ date: "2026-02-22", id: "t1" }),
                        makeCard({ date: "2026-02-22", id: "t2" }),
                    ],
                    title: "Col",
                },
            ],
            settings: {
                collapsedColumns: [],
                columnColors: {},
                todayOrder: { today: ["t2", "t1"] },
            },
        })

        const groups = collectCardsByDateGroup(board)
        const todayGroup = groups.find((group) => {
            return group.dateKey === "today"
        })

        expect(todayGroup!.cards[0].card.id).toBe("t2")
        expect(todayGroup!.cards[1].card.id).toBe("t1")
    })

    it("should exclude completed cards", () => {
        setSystemTime(new Date(2026, 1, 22))
        const board = makeBoard({
            columns: [
                {
                    cards: [
                        makeCard({ completed: true, date: "2026-02-22", id: "done" }),
                        makeCard({ date: "2026-02-22", id: "open" }),
                    ],
                    title: "Col",
                },
            ],
        })

        const groups = collectCardsByDateGroup(board)
        const todayGroup = groups.find((group) => {
            return group.dateKey === "today"
        })

        expect(todayGroup!.cards).toHaveLength(1)
        expect(todayGroup!.cards[0].card.id).toBe("open")
    })

    it("should exclude cards without dates", () => {
        setSystemTime(new Date(2026, 1, 22))
        const board = makeBoard({
            columns: [
                {
                    cards: [
                        makeCard({ id: "nodate" }),
                        makeCard({ date: "2026-02-22", id: "hasdate" }),
                    ],
                    title: "Col",
                },
            ],
        })

        const groups = collectCardsByDateGroup(board)
        const allCards = groups.flatMap((group) => {
            return group.cards
        })

        expect(allCards).toHaveLength(1)
        expect(allCards[0].card.id).toBe("hasdate")
    })

    it("should preserve columnIndex, cardIndex, and columnTitle in TodayCard", () => {
        setSystemTime(new Date(2026, 1, 22))
        const board = makeBoard({
            columns: [
                { cards: [makeCard({ id: "skip" })], title: "First" },
                { cards: [makeCard({ date: "2026-02-22", id: "target" })], title: "Second" },
            ],
        })

        const groups = collectCardsByDateGroup(board)
        const todayGroup = groups.find((group) => {
            return group.dateKey === "today"
        })
        const todayCard = todayGroup!.cards[0]

        expect(todayCard.columnIndex).toBe(1)
        expect(todayCard.cardIndex).toBe(0)
        expect(todayCard.columnTitle).toBe("Second")
    })

    it("should handle multiple columns with mixed dates", () => {
        setSystemTime(new Date(2026, 1, 22))
        const board = makeBoard({
            columns: [
                {
                    cards: [
                        makeCard({ date: "2026-02-22", id: "a1" }),
                        makeCard({ date: "2026-02-20", id: "a2" }),
                    ],
                    title: "Col A",
                },
                {
                    cards: [
                        makeCard({ date: "2026-02-22", id: "b1" }),
                        makeCard({ date: "2026-02-25", id: "b2" }),
                    ],
                    title: "Col B",
                },
            ],
        })

        const groups = collectCardsByDateGroup(board)

        const overdueGroup = groups.find((group) => {
            return group.dateKey === "overdue"
        })
        const todayGroup = groups.find((group) => {
            return group.dateKey === "today"
        })
        const futureGroup = groups.find((group) => {
            return group.dateKey === "2026-02-25"
        })

        expect(overdueGroup!.cards).toHaveLength(1)
        expect(todayGroup!.cards).toHaveLength(2)
        expect(futureGroup!.cards).toHaveLength(1)
    })
})

describe("getDateForSection", () => {
    afterEach(() => {
        setSystemTime()
    })

    it("should return today's date string for 'today'", () => {
        setSystemTime(new Date(2026, 1, 22))

        expect(getDateForSection("today")).toBe(toDateString(new Date()))
    })

    it("should return null for 'overdue'", () => {
        expect(getDateForSection("overdue")).toBeNull()
    })

    it("should return dateKey itself for date strings", () => {
        expect(getDateForSection("2026-03-15")).toBe("2026-03-15")
    })
})
