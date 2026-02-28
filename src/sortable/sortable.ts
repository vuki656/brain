// eslint-disable-next-line import-x/no-named-as-default -- SortableJS exports Sortable as both default and named
import Sortable, { type SortableEvent } from "sortablejs"

import { immutableSpliceCard } from "../card/card-mutations"
import type { BoardType } from "../shared/types"

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

        const sourceCardIndex = board.columns[fromColumnIndex].cards.findIndex((card) => {
            return card.id === draggedCardId
        })

        if (sourceCardIndex === -1) {
            return
        }

        const card = board.columns[fromColumnIndex].cards[sourceCardIndex]
        let newColumns = immutableSpliceCard({
            cardIndex: sourceCardIndex,
            columnIndex: fromColumnIndex,
            columns: board.columns,
            deleteCount: 1,
        })

        const targetCardElements = event.to.querySelectorAll<HTMLElement>(".kanban-card")
        let insertIndex = newColumns[toColumnIndex].cards.length

        for (let domIndex = 0; domIndex < targetCardElements.length; domIndex++) {
            if (targetCardElements[domIndex].dataset.cardId !== draggedCardId) {
                continue
            }

            const nextElement = targetCardElements[domIndex + 1] as HTMLElement | undefined

            if (nextElement) {
                const nextCardId = nextElement.dataset.cardId
                const nextDataIndex = newColumns[toColumnIndex].cards.findIndex((searchCard) => {
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
