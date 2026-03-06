// eslint-disable-next-line import-x/no-named-as-default -- SortableJS exports Sortable as both default and named
import type Sortable from "sortablejs"
import type { SortableEvent } from "sortablejs"

import type { BoardType } from "../../shared"
import { immutableSpliceCard } from "../card"

type MutationHandlerType = (board: BoardType) => void

export function createCardSortableOptions(
    onEnd: (event: SortableEvent) => void,
    group?: string,
): Sortable.Options {
    return {
        animation: 150,
        dragClass: "kanban-card--drag",
        fallbackClass: "kanban-card--dragging",
        fallbackOnBody: true,
        forceFallback: true,
        ghostClass: "kanban-card--ghost",
        group: group ?? "kanban-cards",
        handle: ".kanban-card__drag-handle",
        onEnd,
    }
}

export function createProjectCardMoveHandler(
    board: BoardType,
    onMutation: MutationHandlerType,
): (event: SortableEvent) => void {
    return (event: SortableEvent) => {
        const fromProjectIndex = Number(event.from.dataset.projectIndex)
        const toProjectIndex = Number(event.to.dataset.projectIndex)
        const draggedCardId = event.item.dataset.cardId

        if (!draggedCardId) {
            return
        }

        const sourceProject = board.projects[fromProjectIndex]

        if (!sourceProject) {
            return
        }

        const sourceCardIndex = sourceProject.cards.findIndex((card) => {
            return card.id === draggedCardId
        })

        if (sourceCardIndex === -1) {
            return
        }

        const card = sourceProject.cards[sourceCardIndex]

        if (!card) {
            return
        }

        let newProjects = immutableSpliceCard({
            cardIndex: sourceCardIndex,
            deleteCount: 1,
            projectIndex: fromProjectIndex,
            projects: board.projects,
        })

        const targetCardElements = event.to.querySelectorAll<HTMLElement>(".kanban-card")
        const targetProject = newProjects[toProjectIndex]

        if (!targetProject) {
            return
        }

        let insertIndex = 0

        for (let domIndex = 0; domIndex < targetCardElements.length; domIndex++) {
            const currentElement = targetCardElements[domIndex]

            if (!currentElement) {
                continue
            }

            if (currentElement.dataset.cardId !== draggedCardId) {
                continue
            }

            const previousElement = targetCardElements[domIndex - 1] as HTMLElement | undefined

            if (previousElement) {
                const previousCardId = previousElement.dataset.cardId
                const previousDataIndex = targetProject.cards.findIndex((searchCard) => {
                    return searchCard.id === previousCardId
                })

                if (previousDataIndex !== -1) {
                    insertIndex = previousDataIndex + 1
                }
            }

            break
        }

        newProjects = immutableSpliceCard({
            cardIndex: insertIndex,
            deleteCount: 0,
            insertCards: [card],
            projectIndex: toProjectIndex,
            projects: newProjects,
        })

        onMutation({ ...board, projects: newProjects })
    }
}
