import { setIcon, TFile } from "obsidian"

import { showCardContextMenu, showPriorityMenu } from "../context-menu/context-menu"
import { startInlineEdit } from "../inline-edit/inline-edit"
import { formatDate, toDateString } from "../../core/shared/date.utils"
import { generateId } from "../../core/shared/id.utils"
import type { BoardType, CardType } from "../../core/shared/types"

import { immutableSpliceCard, immutableUpdateCard } from "./card-mutations"
import type { CardElementOptionsType } from "./card.types"

type MutationHandlerType = (board: BoardType) => void

export function createCardElement(options: CardElementOptionsType): HTMLElement {
    const { board, card, cardIndex, columnIndex, onMutation, pluginSettings, projectPill, vault } =
        options
    const cardElement = document.createElement("div")

    cardElement.className = "kanban-card"
    cardElement.dataset.columnIndex = String(columnIndex)
    cardElement.dataset.cardIndex = String(cardIndex)
    cardElement.dataset.cardId = card.id

    if (card.completed) {
        cardElement.classList.add("kanban-card--completed")
    }

    if (card.priority) {
        cardElement.dataset.priority = card.priority
    }

    const cardContent = document.createElement("div")

    cardContent.className = "kanban-card__content"

    const checkbox = document.createElement("input")

    checkbox.type = "checkbox"
    checkbox.className = "kanban-card__checkbox task-list-item-checkbox"
    checkbox.checked = card.completed
    checkbox.addEventListener("change", () => {
        const newColumns = immutableUpdateCard({
            cardIndex,
            columnIndex,
            columns: board.columns,
            update: { completed: checkbox.checked },
        })
        onMutation({ ...board, columns: newColumns })
    })

    const titleElement = document.createElement("span")

    titleElement.className = "kanban-card__title"

    if (card.linkedNote) {
        const link = document.createElement("a")

        link.className = "internal-link"
        link.href = card.linkedNote
        link.textContent = card.linkedNote.split("/").pop() ?? card.linkedNote
        link.dataset.href = card.linkedNote
        link.addEventListener("click", (clickEvent) => {
            clickEvent.preventDefault()

            const file = vault.getAbstractFileByPath(`${card.linkedNote}.md`)

            if (file && file instanceof TFile) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Obsidian exposes app on window but has no typed global
                ;(window as any).app.workspace.getLeaf(false).openFile(file)
            }
        })

        titleElement.append(link)
    } else {
        titleElement.textContent = card.title
    }

    titleElement.addEventListener("dblclick", () => {
        startInlineEdit(titleElement, card.linkedNote ?? card.title, (newValue) => {
            const update = card.linkedNote ? { linkedNote: newValue } : { title: newValue }
            const newColumns = immutableUpdateCard({
                cardIndex,
                columnIndex,
                columns: board.columns,
                update,
            })
            onMutation({ ...board, columns: newColumns })
        })
    })

    const dragHandle = document.createElement("span")

    dragHandle.className = "kanban-card__drag-handle"
    setIcon(dragHandle, "grip-vertical")
    dragHandle.addEventListener("contextmenu", (handleEvent) => {
        handleEvent.stopPropagation()
        handleEvent.preventDefault()
    })

    cardContent.append(dragHandle, checkbox, titleElement)

    const priorityButton = document.createElement("span")

    priorityButton.className = "kanban-card__priority-dot"
    priorityButton.dataset.priority = card.priority ?? "none"
    priorityButton.addEventListener("click", (priorityClickEvent) => {
        priorityClickEvent.stopPropagation()
        showPriorityMenu({
            board,
            card,
            cardIndex,
            columnIndex,
            event: priorityClickEvent,
            onMutation,
        })
    })

    cardContent.append(priorityButton)
    cardElement.append(cardContent)

    if (card.description) {
        const descriptionElement = document.createElement("div")

        descriptionElement.className = "kanban-card__description"
        descriptionElement.textContent = card.description
        cardElement.append(descriptionElement)
    }

    const metaRow = document.createElement("div")

    metaRow.className = "kanban-card__meta"

    if (projectPill) {
        const pillElement = document.createElement("span")

        pillElement.className = "kanban-card__project-pill"
        pillElement.textContent = projectPill.title
        pillElement.style.background = projectPill.color
        metaRow.append(pillElement)
    }

    if (card.date && !projectPill) {
        const dateBadge = document.createElement("span")
        const isToday = card.date === toDateString(new Date())
        const isOverdue =
            new Date(card.date) < new Date(new Date().toDateString()) && !card.completed

        dateBadge.className = isToday
            ? "kanban-card__badge kanban-card__badge--today"
            : "kanban-card__badge kanban-card__badge--date"

        if (isOverdue) {
            dateBadge.classList.add("kanban-card__badge--overdue")
        }

        dateBadge.textContent = isToday ? "Today" : formatDate(card.date)
        metaRow.append(dateBadge)
    }

    if (metaRow.children.length > 0) {
        cardElement.append(metaRow)
    }

    cardElement.addEventListener("contextmenu", (contextMenuEvent) => {
        contextMenuEvent.preventDefault()
        showCardContextMenu({
            board,
            card,
            cardIndex,
            columnIndex,
            event: contextMenuEvent,
            onMutation,
            pluginSettings,
            vault,
        })
    })

    return cardElement
}

export function createAddCardForm(
    columnIndex: number,
    board: BoardType,
    onMutation: MutationHandlerType,
): HTMLElement {
    const wrapper = document.createElement("div")

    wrapper.className = "kanban-add-card"

    const button = document.createElement("button")

    button.className = "kanban-add-card__button"
    button.textContent = "+ Add a card"
    button.addEventListener("click", () => {
        button.style.display = "none"

        const textarea = document.createElement("textarea")

        textarea.className = "kanban-add-card__input"
        textarea.placeholder = "Card title..."
        wrapper.append(textarea)
        textarea.focus()

        const confirm = () => {
            const text = textarea.value.trim()

            if (text) {
                const newCard: CardType = {
                    completed: false,
                    date: null,
                    description: null,
                    id: generateId(),
                    linkedNote: null,
                    priority: null,
                    title: text,
                }
                const newColumns = immutableSpliceCard({
                    cardIndex: 0,
                    columnIndex,
                    columns: board.columns,
                    deleteCount: 0,
                    insertCards: [newCard],
                })
                onMutation({ ...board, columns: newColumns })
            }

            textarea.remove()
            button.style.display = ""
        }

        textarea.addEventListener("blur", confirm)
        textarea.addEventListener("keydown", (keyboardEvent) => {
            if (keyboardEvent.key === "Enter" && !keyboardEvent.shiftKey) {
                keyboardEvent.preventDefault()
                textarea.blur()
            }

            if (keyboardEvent.key === "Escape") {
                textarea.remove()
                button.style.display = ""
            }
        })
    })

    wrapper.append(button)

    return wrapper
}
