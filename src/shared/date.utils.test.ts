import { afterEach, beforeEach, describe, expect, it, setSystemTime } from "bun:test"

import {
    formatDate,
    getDayDifference,
    getNextMonday,
    getTomorrowDate,
    toDateString,
} from "./date.utils"

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

describe("getTomorrowDate", () => {
    afterEach(() => {
        setSystemTime()
    })

    it("should return tomorrow's date", () => {
        setSystemTime(new Date(2026, 1, 22))
        const result = getTomorrowDate()

        expect(toDateString(result)).toBe("2026-02-23")
    })

    it("should handle month boundary", () => {
        setSystemTime(new Date(2026, 1, 28))
        const result = getTomorrowDate()

        expect(toDateString(result)).toBe("2026-03-01")
    })

    it("should handle year boundary", () => {
        setSystemTime(new Date(2025, 11, 31))
        const result = getTomorrowDate()

        expect(toDateString(result)).toBe("2026-01-01")
    })
})

describe("getDayDifference", () => {
    beforeEach(() => {
        setSystemTime(new Date(2026, 1, 22))
    })

    afterEach(() => {
        setSystemTime()
    })

    it("should return 0 for today", () => {
        expect(getDayDifference("2026-02-22")).toBe(0)
    })

    it("should return 1 for tomorrow", () => {
        expect(getDayDifference("2026-02-23")).toBe(1)
    })

    it("should return -1 for yesterday", () => {
        expect(getDayDifference("2026-02-21")).toBe(-1)
    })

    it("should return negative for past dates", () => {
        expect(getDayDifference("2026-02-19")).toBe(-3)
    })

    it("should return positive for future dates", () => {
        expect(getDayDifference("2026-02-25")).toBe(3)
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
