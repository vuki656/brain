import { describe, expect, it } from "bun:test"

import { PROJECT_COLORS } from "../../shared"
import { makeBoard } from "../../shared/test-utils"
import { getProjectColor } from "./project.utils"

describe("getProjectColor", () => {
    it("should return custom color from board settings", () => {
        const board = makeBoard({
            settings: {
                collapsedProjects: [],
                projectColors: { Todo: "var(--color-red)" },
                projectIcons: {},
                ticketOrder: {},
            todayOrder: {},
            },
        })

        expect(getProjectColor("Todo", 0, board)).toBe("var(--color-red)")
    })

    it("should return default color by cycling PROJECT_COLORS when no custom color", () => {
        const board = makeBoard()

        expect(getProjectColor("Todo", 0, board)).toBe(PROJECT_COLORS[0])
        expect(getProjectColor("Done", 1, board)).toBe(PROJECT_COLORS[1])
    })

    it("should cycle correctly when index >= PROJECT_COLORS.length", () => {
        const board = makeBoard()

        expect(getProjectColor("Overflow", PROJECT_COLORS.length, board)).toBe(PROJECT_COLORS[0])
    })

    it("should cycle correctly within second cycle", () => {
        const board = makeBoard()

        expect(getProjectColor("Overflow2", PROJECT_COLORS.length + 1, board)).toBe(
            PROJECT_COLORS[1],
        )
    })
})
