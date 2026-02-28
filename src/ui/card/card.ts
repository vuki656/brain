import { setIcon, TFile } from "obsidian"

import type { BoardType, CardType } from "../../shared"
import { formatDate, generateId, getDayDifference, toDateString } from "../../shared"
import { showCardContextMenu, showPriorityMenu } from "../context-menu"
import { startInlineEdit } from "../inline-edit"
import type { CardElementOptionsType } from "./card.types"
import { immutableSpliceCard, immutableUpdateCard } from "./card-mutations"

type MutationHandlerType = (board: BoardType) => void

export function createCardElement(options: CardElementOptionsType): HTMLElement {
    const { board, card, cardIndex, onMutation, pluginSettings, projectIndex, projectPill, vault } =
        options
    const cardElement = document.createElement("div")

    cardElement.className = "kanban-card"
    cardElement.dataset.projectIndex = String(projectIndex)
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
        const newProjects = immutableUpdateCard({
            cardIndex,
            projectIndex,
            projects: board.projects,
            update: { completed: checkbox.checked },
        })
        onMutation({ ...board, projects: newProjects })
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
                void window.app.workspace.getLeaf(false).openFile(file)
            }
        })

        titleElement.append(link)
    } else {
        titleElement.textContent = card.title
    }

    titleElement.addEventListener("dblclick", () => {
        startInlineEdit(titleElement, card.linkedNote ?? card.title, (newValue) => {
            const update = card.linkedNote ? { linkedNote: newValue } : { title: newValue }
            const newProjects = immutableUpdateCard({
                cardIndex,
                projectIndex,
                projects: board.projects,
                update,
            })
            onMutation({ ...board, projects: newProjects })
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
            event: priorityClickEvent,
            onMutation,
            projectIndex,
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
        pillElement.style.borderColor = projectPill.color

        if (projectPill.icon) {
            const pillIcon = document.createElement("span")

            pillIcon.className = "kanban-pill-icon"
            pillIcon.style.color = projectPill.color
            setIcon(pillIcon, projectPill.icon)
            pillElement.append(pillIcon)
        }

        pillElement.append(document.createTextNode(projectPill.title))
        metaRow.append(pillElement)
    }

    if (card.date && !projectPill) {
        const dateBadge = document.createElement("span")
        const isToday = card.date === toDateString(new Date())
        const isOverdue = getDayDifference(card.date) < 0 && !card.completed

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
            event: contextMenuEvent,
            onMutation,
            pluginSettings,
            projectIndex,
            vault,
        })
    })

    return cardElement
}

export function createAddCardForm(
    projectIndex: number,
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
                const newProjects = immutableSpliceCard({
                    cardIndex: 0,
                    deleteCount: 0,
                    insertCards: [newCard],
                    projectIndex,
                    projects: board.projects,
                })
                onMutation({ ...board, projects: newProjects })
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
