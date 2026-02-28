import { describe, expect, it } from "bun:test"

import { COLUMN_COLORS } from "../../shared"
import { makeBoard } from "../../shared/test-utils"
import { getColumnColor } from "./column.utils"

describe("getColumnColor", () => {
    it("should return custom color from board settings", () => {
        const board = makeBoard({
            settings: {
                collapsedColumns: [],
                columnColors: { Todo: "var(--color-red)" },
                todayOrder: {},
            },
        })

        expect(getColumnColor("Todo", 0, board)).toBe("var(--color-red)")
    })

    it("should return default color by cycling COLUMN_COLORS when no custom color", () => {
        const board = makeBoard()

        expect(getColumnColor("Todo", 0, board)).toBe(COLUMN_COLORS[0])
        expect(getColumnColor("Done", 1, board)).toBe(COLUMN_COLORS[1])
    })

    it("should cycle correctly when index >= COLUMN_COLORS.length", () => {
        const board = makeBoard()

        expect(getColumnColor("Overflow", 8, board)).toBe(COLUMN_COLORS[0])
    })

    it("should cycle correctly within second cycle", () => {
        const board = makeBoard()

        expect(getColumnColor("Overflow2", 9, board)).toBe(COLUMN_COLORS[1])
    })
})
