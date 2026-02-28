import { Menu, Notice, setIcon } from "obsidian"

import { createAddCardForm, createCardElement } from "../card/card"
import { startInlineEdit } from "../inline-edit/inline-edit"
import { COLUMN_COLOR_LABELS, COLUMN_COLORS } from "../shared/constants"
import type { BoardType, ColumnType } from "../shared/types"

import type { ColumnElementOptionsType } from "./column.types"
import { getColumnColor } from "./column.utils"

type MutationHandlerType = (board: BoardType) => void

export function createColumnElement(options: ColumnElementOptionsType): HTMLElement {
    const { board, column, columnIndex, onMutation, pluginSettings, vault, viewState } = options
    const isCollapsed = board.settings.collapsedColumns.includes(column.title)
    const columnElement = document.createElement("div")

    columnElement.className = "kanban-column"
    columnElement.dataset.columnIndex = String(columnIndex)

    if (isCollapsed) {
        columnElement.classList.add("kanban-column--collapsed")
        columnElement.addEventListener("click", () => {
            const newCollapsed = board.settings.collapsedColumns.filter((name) => {
                return name !== column.title
            })

            onMutation({
                ...board,
                settings: { ...board.settings, collapsedColumns: newCollapsed },
            })
        })
    }

    const header = document.createElement("div")

    header.className = "kanban-column__header"

    const titleElement = document.createElement("div")

    titleElement.className = "kanban-column__title"
    titleElement.textContent = column.title

    titleElement.addEventListener("dblclick", () => {
        startInlineEdit(titleElement, column.title, (newTitle) => {
            const wasCollapsed = board.settings.collapsedColumns.includes(column.title)
            const newColumns = board.columns.map((col, index) => {
                return index === columnIndex ? { ...col, title: newTitle } : col
            })
            let newCollapsedColumns = [...board.settings.collapsedColumns]

            if (wasCollapsed) {
                newCollapsedColumns = newCollapsedColumns.map((name) => {
                    return name === column.title ? newTitle : name
                })
            }

            onMutation({
                ...board,
                columns: newColumns,
                settings: { ...board.settings, collapsedColumns: newCollapsedColumns },
            })
        })
    })

    const visibleCardCount = viewState.hideCompletedActive
        ? column.cards.filter((card) => {
              return !card.completed
          }).length
        : column.cards.length

    const countBadge = document.createElement("span")

    countBadge.className = "kanban-column__count"
    countBadge.textContent = String(visibleCardCount)

    const dragHandle = document.createElement("span")

    dragHandle.className = "kanban-column__drag-handle"
    setIcon(dragHandle, "grip-vertical")

    const colorDot = document.createElement("span")

    colorDot.className = "kanban-column__color-dot"
    colorDot.style.background = getColumnColor(column.title, columnIndex, board)

    header.append(dragHandle, colorDot, titleElement, countBadge)

    header.addEventListener("contextmenu", (headerEvent) => {
        headerEvent.preventDefault()

        const menu = new Menu()

        menu.addItem((item) => {
            return item
                .setIcon("eye-off")
                .setTitle("Hide column")
                .onClick(() => {
                    const newCollapsed = [...board.settings.collapsedColumns, column.title]

                    onMutation({
                        ...board,
                        settings: { ...board.settings, collapsedColumns: newCollapsed },
                    })
                })
        })

        menu.addItem((item) => {
            return item
                .setIcon("palette")
                .setTitle("Color")
                .onClick((colorMenuEvent) => {
                    const colorMenu = new Menu()

                    for (const color of COLUMN_COLORS) {
                        const label = COLUMN_COLOR_LABELS[color] ?? color
                        const isActive = board.settings.columnColors[column.title] === color

                        colorMenu.addItem((colorItem) => {
                            const fragment = document.createDocumentFragment()
                            const dot = document.createElement("span")

                            dot.className = "kanban-menu__color-dot"
                            dot.style.background = color

                            const text = document.createElement("span")

                            text.textContent = label

                            fragment.append(dot, text)

                            colorItem.setTitle(fragment)

                            if (isActive) {
                                colorItem.setChecked(true)
                            }

                            colorItem.onClick(() => {
                                const newColumnColors = {
                                    ...board.settings.columnColors,
                                    [column.title]: color,
                                }

                                onMutation({
                                    ...board,
                                    settings: { ...board.settings, columnColors: newColumnColors },
                                })
                            })
                        })
                    }

                    colorMenu.addSeparator()

                    colorMenu.addItem((colorItem) => {
                        return colorItem
                            .setIcon("rotate-ccw")
                            .setTitle("Reset color")
                            .onClick(() => {
                                const { [column.title]: _removedColor, ...remainingColors } =
                                    board.settings.columnColors

                                onMutation({
                                    ...board,
                                    settings: { ...board.settings, columnColors: remainingColors },
                                })
                            })
                    })

                    colorMenu.showAtMouseEvent(colorMenuEvent as MouseEvent)
                })
        })

        menu.addSeparator()

        menu.addItem((item) => {
            return item
                .setIcon("trash-2")
                .setTitle("Delete column")
                .setWarning(true)
                .onClick(() => {
                    if (column.cards.length > 0) {
                        new Notice("Cannot delete a column that still has cards.")

                        return
                    }

                    const newColumns = board.columns.filter((_column, index) => {
                        return index !== columnIndex
                    })
                    const newCollapsed = board.settings.collapsedColumns.filter((name) => {
                        return name !== column.title
                    })

                    onMutation({
                        ...board,
                        columns: newColumns,
                        settings: { ...board.settings, collapsedColumns: newCollapsed },
                    })
                })
        })

        menu.showAtMouseEvent(headerEvent)
    })

    columnElement.append(header)

    if (!isCollapsed) {
        const cardList = document.createElement("div")

        cardList.className = "kanban-column__cards"
        cardList.dataset.columnIndex = String(columnIndex)

        const sortedCardIndices = column.cards
            .map((_card, index) => {
                return index
            })
            .sort((indexA, indexB) => {
                const completedA = column.cards[indexA].completed ? 1 : 0
                const completedB = column.cards[indexB].completed ? 1 : 0

                return completedA - completedB
            })

        for (const cardIndex of sortedCardIndices) {
            const card = column.cards[cardIndex]

            cardList.append(
                createCardElement({
                    board,
                    card,
                    cardIndex,
                    columnIndex,
                    onMutation,
                    pluginSettings,
                    projectPill: null,
                    vault,
                }),
            )
        }

        columnElement.append(cardList)
        columnElement.append(createAddCardForm(columnIndex, board, onMutation))
    }

    return columnElement
}

export function createAddColumnButton(board: BoardType, onMutation: MutationHandlerType): HTMLElement {
    const button = document.createElement("button")

    button.className = "kanban-add-column__button"
    button.textContent = "+ Add column"
    button.addEventListener("click", () => {
        const name = "New Column"
        const newColumn: ColumnType = { cards: [], title: name }

        onMutation({
            ...board,
            columns: [...board.columns, newColumn],
        })
    })

    return button
}
