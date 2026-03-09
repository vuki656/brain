import { describe, expect, it } from "bun:test"

import { makeCard, makeProjects, makeSubtask } from "../../shared/test-utils"
import {
    immutableAddSubtask,
    immutableDeleteSubtask,
    immutableSpliceCard,
    immutableToggleSubtask,
    immutableUpdateCard,
} from "./card-mutations"

describe("immutableSpliceCard", () => {
    it("should remove a card without mutating the original", () => {
        const projects = makeProjects()
        const result = immutableSpliceCard({
            cardIndex: 1,
            deleteCount: 1,
            projectIndex: 0,
            projects,
        })

        expect(result[0].cards).toHaveLength(1)
        expect(result[0].cards[0].id).toBe("a1")
        expect(projects[0].cards).toHaveLength(2)
    })

    it("should insert a card at the specified position", () => {
        const projects = makeProjects()
        const newCard = makeCard({ id: "new1", title: "Inserted" })
        const result = immutableSpliceCard({
            cardIndex: 1,
            deleteCount: 0,
            insertCards: [newCard],
            projectIndex: 0,
            projects,
        })

        expect(result[0].cards).toHaveLength(3)
        expect(result[0].cards[1].id).toBe("new1")
        expect(result[0].cards[2].id).toBe("a2")
    })

    it("should replace a card when deleteCount is 1 and insert is provided", () => {
        const projects = makeProjects()
        const replacement = makeCard({ id: "r1", title: "Replaced" })
        const result = immutableSpliceCard({
            cardIndex: 0,
            deleteCount: 1,
            insertCards: [replacement],
            projectIndex: 0,
            projects,
        })

        expect(result[0].cards).toHaveLength(2)
        expect(result[0].cards[0].id).toBe("r1")
        expect(result[0].cards[1].id).toBe("a2")
    })

    it("should not modify other projects", () => {
        const projects = makeProjects()
        const result = immutableSpliceCard({
            cardIndex: 0,
            deleteCount: 1,
            projectIndex: 0,
            projects,
        })

        expect(result[1]).toBe(projects[1])
    })

    it("should insert a card at position 0", () => {
        const projects = makeProjects()
        const newCard = makeCard({ id: "front", title: "Front" })
        const result = immutableSpliceCard({
            cardIndex: 0,
            deleteCount: 0,
            insertCards: [newCard],
            projectIndex: 0,
            projects,
        })

        expect(result[0].cards).toHaveLength(3)
        expect(result[0].cards[0].id).toBe("front")
        expect(result[0].cards[1].id).toBe("a1")
    })

    it("should insert a card at the end", () => {
        const projects = makeProjects()
        const newCard = makeCard({ id: "last", title: "Last" })
        const result = immutableSpliceCard({
            cardIndex: 2,
            deleteCount: 0,
            insertCards: [newCard],
            projectIndex: 0,
            projects,
        })

        expect(result[0].cards).toHaveLength(3)
        expect(result[0].cards[2].id).toBe("last")
    })

    it("should handle splice on empty project", () => {
        const projects = [{ cards: [] as ReturnType<typeof makeCard>[], title: "Empty" }]
        const newCard = makeCard({ id: "first", title: "First" })
        const result = immutableSpliceCard({
            cardIndex: 0,
            deleteCount: 0,
            insertCards: [newCard],
            projectIndex: 0,
            projects,
        })

        expect(result[0].cards).toHaveLength(1)
        expect(result[0].cards[0].id).toBe("first")
    })

    it("should insert multiple cards at once", () => {
        const projects = makeProjects()
        const cardA = makeCard({ id: "m1", title: "Multi 1" })
        const cardB = makeCard({ id: "m2", title: "Multi 2" })
        const result = immutableSpliceCard({
            cardIndex: 1,
            deleteCount: 0,
            insertCards: [cardA, cardB],
            projectIndex: 0,
            projects,
        })

        expect(result[0].cards).toHaveLength(4)
        expect(result[0].cards[1].id).toBe("m1")
        expect(result[0].cards[2].id).toBe("m2")
        expect(result[0].cards[3].id).toBe("a2")
    })

    it("should handle large deleteCount gracefully", () => {
        const projects = makeProjects()
        const result = immutableSpliceCard({
            cardIndex: 0,
            deleteCount: 100,
            projectIndex: 0,
            projects,
        })

        expect(result[0].cards).toHaveLength(0)
    })
})

describe("immutableUpdateCard", () => {
    it("should update a card property without mutating the original", () => {
        const projects = makeProjects()
        const result = immutableUpdateCard({
            cardIndex: 0,
            projectIndex: 0,
            projects,
            update: { completed: true },
        })

        expect(result[0].cards[0].completed).toBe(true)
        expect(projects[0].cards[0].completed).toBe(false)
    })

    it("should update multiple properties at once", () => {
        const projects = makeProjects()
        const result = immutableUpdateCard({
            cardIndex: 0,
            projectIndex: 0,
            projects,
            update: {
                date: "2026-03-01",
                priority: "important",
            },
        })

        expect(result[0].cards[0].date).toBe("2026-03-01")
        expect(result[0].cards[0].priority).toBe("important")
    })

    it("should not modify other projects or cards", () => {
        const projects = makeProjects()
        const result = immutableUpdateCard({
            cardIndex: 0,
            projectIndex: 0,
            projects,
            update: { title: "Changed" },
        })

        expect(result[0].cards[1]).toBe(projects[0].cards[1])
        expect(result[1]).toBe(projects[1])
    })

    it("should handle empty partial update", () => {
        const projects = makeProjects()
        const result = immutableUpdateCard({
            cardIndex: 0,
            projectIndex: 0,
            projects,
            update: {},
        })

        expect(result[0].cards[0].title).toBe("First")
        expect(result[0].cards[0].id).toBe("a1")
    })

    it("should update card in second project", () => {
        const projects = makeProjects()
        const result = immutableUpdateCard({
            cardIndex: 0,
            projectIndex: 1,
            projects,
            update: { completed: false },
        })

        expect(result[1].cards[0].completed).toBe(false)
        expect(projects[1].cards[0].completed).toBe(true)
        expect(result[0]).toBe(projects[0])
    })
})

describe("immutableToggleSubtask", () => {
    it("should toggle a subtask from uncompleted to completed", () => {
        const subtasks = [makeSubtask({ id: "sub1" }), makeSubtask({ id: "sub2" })]
        const result = immutableToggleSubtask(subtasks, "sub1")

        expect(result[0].completed).toBe(true)
        expect(result[1].completed).toBe(false)
    })

    it("should toggle a subtask from completed to uncompleted", () => {
        const subtasks = [makeSubtask({ completed: true, id: "sub1" })]
        const result = immutableToggleSubtask(subtasks, "sub1")

        expect(result[0].completed).toBe(false)
    })

    it("should not mutate the original array", () => {
        const subtasks = [makeSubtask({ id: "sub1" })]
        const result = immutableToggleSubtask(subtasks, "sub1")

        expect(subtasks[0].completed).toBe(false)
        expect(result[0].completed).toBe(true)
    })
})

describe("immutableAddSubtask", () => {
    it("should append a new subtask to the end", () => {
        const subtasks = [makeSubtask({ id: "sub1" })]
        const newSubtask = makeSubtask({ id: "sub2", title: "New subtask" })
        const result = immutableAddSubtask(subtasks, newSubtask)

        expect(result).toHaveLength(2)
        expect(result[1].id).toBe("sub2")
        expect(result[1].title).toBe("New subtask")
    })

    it("should not mutate the original array", () => {
        const subtasks = [makeSubtask({ id: "sub1" })]
        const newSubtask = makeSubtask({ id: "sub2" })

        immutableAddSubtask(subtasks, newSubtask)

        expect(subtasks).toHaveLength(1)
    })
})

describe("immutableDeleteSubtask", () => {
    it("should remove the subtask with matching id", () => {
        const subtasks = [
            makeSubtask({ id: "sub1" }),
            makeSubtask({ id: "sub2" }),
            makeSubtask({ id: "sub3" }),
        ]
        const result = immutableDeleteSubtask(subtasks, "sub2")

        expect(result).toHaveLength(2)
        expect(result[0].id).toBe("sub1")
        expect(result[1].id).toBe("sub3")
    })

    it("should not mutate the original array", () => {
        const subtasks = [makeSubtask({ id: "sub1" }), makeSubtask({ id: "sub2" })]

        immutableDeleteSubtask(subtasks, "sub1")

        expect(subtasks).toHaveLength(2)
    })
})
