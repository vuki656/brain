// eslint-disable-next-line import-x/no-named-as-default -- SortableJS exports Sortable as both default and named
import Sortable, { type SortableEvent } from "sortablejs"

import { createAddColumnButton, createColumnElement } from "../column"
import { createCardSortableOptions, createColumnCardMoveHandler } from "../sortable"
import { renderTodayView } from "../today-view"
import { createToolbar } from "../toolbar"
import type { BoardColumnsOptionsType, RenderBoardOptionsType } from "./board.types"

function renderBoardColumns(options: BoardColumnsOptionsType): Sortable[] {
    const { board, container, onMutation, pluginSettings, vault, viewState } = options
    const boardElement = document.createElement("div")

    boardElement.className = "kanban-board"
    container.append(boardElement)

    for (let columnIndex = 0; columnIndex < board.columns.length; columnIndex++) {
        const column = board.columns[columnIndex]
        const columnElement = createColumnElement({
            board,
            column,
            columnIndex,
            onMutation,
            pluginSettings,
            vault,
            viewState,
        })

        boardElement.append(columnElement)
    }

    boardElement.append(createAddColumnButton(board, onMutation))

    const sortableInstances: Sortable[] = []

    const columnSortable = Sortable.create(boardElement, {
        animation: 150,
        draggable: ".kanban-column",
        fallbackClass: "kanban-column--dragging",
        fallbackOnBody: true,
        forceFallback: true,
        ghostClass: "kanban-column--ghost",
        handle: ".kanban-column__drag-handle",
        onEnd: (sortableEvent: SortableEvent) => {
            const { newIndex, oldIndex } = sortableEvent

            if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) {
                return
            }

            const newColumns = [...board.columns]
            const [moved] = newColumns.splice(oldIndex, 1)

            newColumns.splice(newIndex, 0, moved)
            onMutation({ ...board, columns: newColumns })
        },
    })

    sortableInstances.push(columnSortable)

    const cardLists = boardElement.querySelectorAll<HTMLElement>(".kanban-column__cards")

    for (const cardList of Array.from(cardLists)) {
        const instance = Sortable.create(
            cardList,
            createCardSortableOptions(createColumnCardMoveHandler(board, onMutation)),
        )

        sortableInstances.push(instance)
    }

    return sortableInstances
}

function renderBoard(options: RenderBoardOptionsType): Sortable[] {
    const {
        app,
        board,
        container,
        onMutation,
        onViewStateChange,
        pluginSettings,
        vault,
        viewState,
    } = options
    const previousBoard = container.querySelector(".kanban-board")
    const savedScrollLeft = previousBoard ? previousBoard.scrollLeft : 0

    const previousTodayList = container.querySelector(".kanban-today")
    const savedTodayScroll = previousTodayList ? previousTodayList.scrollTop : 0

    const previousColumnsPanel = container.querySelector(".kanban-today-layout__columns")
    const savedColumnsPanelScroll = previousColumnsPanel ? previousColumnsPanel.scrollTop : 0

    container.empty()

    if (viewState.hideCompletedActive) {
        container.dataset.hideCompleted = "true"
    } else {
        delete container.dataset.hideCompleted
    }

    const toolbar = createToolbar({ app, board, onMutation, onViewStateChange, viewState })

    container.append(toolbar)

    if (viewState.todayFilterActive) {
        const sortableInstances = renderTodayView({
            board,
            container,
            onMutation,
            pluginSettings,
            vault,
            viewState,
        })
        const newTodayList = container.querySelector(".kanban-today")
        const newColumnsPanel = container.querySelector(".kanban-today-layout__columns")

        if (newTodayList) {
            newTodayList.scrollTop = savedTodayScroll
        }

        if (newColumnsPanel) {
            newColumnsPanel.scrollTop = savedColumnsPanelScroll
        }

        return sortableInstances
    }

    const sortableInstances = renderBoardColumns({
        board,
        container,
        onMutation,
        pluginSettings,
        vault,
        viewState,
    })
    const newBoard = container.querySelector(".kanban-board")

    if (newBoard) {
        newBoard.scrollLeft = savedScrollLeft
    }

    return sortableInstances
}

export { renderBoard }
