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

export function createColumnCardMoveHandler(
    board: BoardType,
    onMutation: MutationHandlerType,
): (event: SortableEvent) => void {
    return (event: SortableEvent) => {
        const fromColumnIndex = Number(event.from.dataset.columnIndex)
        const toColumnIndex = Number(event.to.dataset.columnIndex)
        const draggedCardId = event.item.dataset.cardId

        if (!draggedCardId) {
            return
        }

        const sourceColumn = board.columns[fromColumnIndex]

        if (!sourceColumn) {
            return
        }

        const sourceCardIndex = sourceColumn.cards.findIndex((card) => {
            return card.id === draggedCardId
        })

        if (sourceCardIndex === -1) {
            return
        }

        const card = sourceColumn.cards[sourceCardIndex]

        if (!card) {
            return
        }

        let newColumns = immutableSpliceCard({
            cardIndex: sourceCardIndex,
            columnIndex: fromColumnIndex,
            columns: board.columns,
            deleteCount: 1,
        })

        const targetCardElements = event.to.querySelectorAll<HTMLElement>(".kanban-card")
        const targetColumn = newColumns[toColumnIndex]

        if (!targetColumn) {
            return
        }

        let insertIndex = targetColumn.cards.length

        for (let domIndex = 0; domIndex < targetCardElements.length; domIndex++) {
            const currentElement = targetCardElements[domIndex]

            if (!currentElement) {
                continue
            }

            if (currentElement.dataset.cardId !== draggedCardId) {
                continue
            }

            const nextElement = targetCardElements[domIndex + 1] as HTMLElement | undefined

            if (nextElement) {
                const nextCardId = nextElement.dataset.cardId
                const nextDataIndex = targetColumn.cards.findIndex((searchCard) => {
                    return searchCard.id === nextCardId
                })

                if (nextDataIndex !== -1) {
                    insertIndex = nextDataIndex
                }
            }

            break
        }

        newColumns = immutableSpliceCard({
            cardIndex: insertIndex,
            columnIndex: toColumnIndex,
            columns: newColumns,
            deleteCount: 0,
            insertCards: [card],
        })

        onMutation({ ...board, columns: newColumns })
    }
}
