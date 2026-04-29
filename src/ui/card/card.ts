import { Notice, setIcon, TFile } from "obsidian"

import type { BoardType, CardType, SubtaskType } from "../../shared"
import { formatDate, generateId, getDayDifference, toDateString } from "../../shared"
import { showCardContextMenu, showPriorityMenu } from "../context-menu"
import { startInlineEdit } from "../inline-edit"
import { openTicketModal, readTicket } from "../ticket"
import {
    immutableAddSubtask,
    immutableDeleteSubtask,
    immutableEditSubtask,
    immutableSpliceCard,
    immutableToggleSubtask,
    immutableUpdateCard,
} from "./card-mutations"
import type { CardElementOptionsType } from "./card.types"

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

    if (card.subtasks.length > 0) {
        const progressCounter = document.createElement("span")
        const completedCount = card.subtasks.filter((subtask) => {
            return subtask.completed
        }).length

        progressCounter.className = "kanban-card__subtask-progress"
        progressCounter.textContent = `${completedCount}/${card.subtasks.length}`
        cardContent.append(progressCounter, priorityButton)
    } else {
        cardContent.append(priorityButton)
    }

    cardElement.append(cardContent)

    if (card.subtasks.length > 0) {
        const subtasksContainer = document.createElement("div")

        subtasksContainer.className = "kanban-card__subtasks"

        for (const subtask of card.subtasks) {
            const subtaskElement = document.createElement("div")

            subtaskElement.className = "kanban-card__subtask"

            if (subtask.completed) {
                subtaskElement.classList.add("kanban-card__subtask--completed")
            }

            const subtaskCheckbox = document.createElement("input")

            subtaskCheckbox.type = "checkbox"
            subtaskCheckbox.className = "kanban-card__subtask-checkbox task-list-item-checkbox"
            subtaskCheckbox.checked = subtask.completed
            subtaskCheckbox.addEventListener("change", () => {
                const newSubtasks = immutableToggleSubtask(card.subtasks, subtask.id)
                const newProjects = immutableUpdateCard({
                    cardIndex,
                    projectIndex,
                    projects: board.projects,
                    update: { subtasks: newSubtasks },
                })
                onMutation({ ...board, projects: newProjects })
            })

            const subtaskTitle = document.createElement("span")

            subtaskTitle.className = "kanban-card__subtask-title"
            subtaskTitle.textContent = subtask.title

            const subtaskEdit = document.createElement("span")

            subtaskEdit.className = "kanban-card__subtask-edit"
            setIcon(subtaskEdit, "pencil")
            subtaskEdit.addEventListener("click", (editEvent) => {
                editEvent.stopPropagation()
                startInlineEdit(subtaskTitle, subtask.title, (newTitle) => {
                    const newSubtasks = immutableEditSubtask(card.subtasks, subtask.id, newTitle)
                    const newProjects = immutableUpdateCard({
                        cardIndex,
                        projectIndex,
                        projects: board.projects,
                        update: { subtasks: newSubtasks },
                    })
                    onMutation({ ...board, projects: newProjects })
                })
            })

            const subtaskDelete = document.createElement("span")

            subtaskDelete.className = "kanban-card__subtask-delete"
            setIcon(subtaskDelete, "x")
            subtaskDelete.addEventListener("click", (deleteEvent) => {
                deleteEvent.stopPropagation()
                const newSubtasks = immutableDeleteSubtask(card.subtasks, subtask.id)
                const newProjects = immutableUpdateCard({
                    cardIndex,
                    projectIndex,
                    projects: board.projects,
                    update: { subtasks: newSubtasks },
                })
                onMutation({ ...board, projects: newProjects })
            })

            subtaskElement.append(subtaskCheckbox, subtaskTitle, subtaskEdit, subtaskDelete)
            subtasksContainer.append(subtaskElement)
        }

        const addSubtaskButton = document.createElement("span")

        addSubtaskButton.className = "kanban-card__add-subtask"
        addSubtaskButton.textContent = "+ Add subtask"
        addSubtaskButton.addEventListener("click", (addEvent) => {
            addEvent.stopPropagation()
            addSubtaskButton.style.display = "none"

            const subtaskInput = document.createElement("input")

            subtaskInput.type = "text"
            subtaskInput.className = "kanban-card__add-subtask-input"
            subtaskInput.placeholder = "Subtask title..."
            subtasksContainer.append(subtaskInput)
            subtaskInput.focus()

            const confirmSubtask = () => {
                const subtaskText = subtaskInput.value.trim()

                if (subtaskText) {
                    const newSubtask: SubtaskType = {
                        completed: false,
                        id: generateId(),
                        title: subtaskText,
                    }
                    const newSubtasks = immutableAddSubtask(card.subtasks, newSubtask)
                    const newProjects = immutableUpdateCard({
                        cardIndex,
                        projectIndex,
                        projects: board.projects,
                        update: { subtasks: newSubtasks },
                    })
                    onMutation({ ...board, projects: newProjects })
                }

                subtaskInput.remove()
                addSubtaskButton.style.display = ""
            }

            subtaskInput.addEventListener("blur", confirmSubtask)
            subtaskInput.addEventListener("keydown", (keyboardEvent) => {
                if (keyboardEvent.key === "Enter") {
                    keyboardEvent.preventDefault()
                    subtaskInput.blur()
                }

                if (keyboardEvent.key === "Escape") {
                    subtaskInput.remove()
                    addSubtaskButton.style.display = ""
                }
            })
        })

        subtasksContainer.append(addSubtaskButton)
        cardElement.append(subtasksContainer)
    }

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

    if (card.backlog && !projectPill) {
        const backlogBadge = document.createElement("span")

        backlogBadge.className = "kanban-card__badge kanban-card__badge--backlog"
        backlogBadge.textContent = "Backlog"
        metaRow.append(backlogBadge)
    }

    if (card.linkedTicket) {
        const ticketBadge = document.createElement("span")

        ticketBadge.className = "kanban-card__badge kanban-card__badge--ticket"

        const ticketIcon = document.createElement("span")

        ticketIcon.className = "kanban-card__ticket-icon"
        setIcon(ticketIcon, "ticket")
        ticketBadge.append(ticketIcon)
        ticketBadge.append(document.createTextNode(card.linkedTicket))

        const linkedTicketName = card.linkedTicket
        const projectTitleForTicket = board.projects[projectIndex]?.title ?? ""

        ticketBadge.addEventListener("click", (ticketClickEvent) => {
            ticketClickEvent.stopPropagation()

            void (async () => {
                const ticket = await readTicket({
                    name: linkedTicketName,
                    notePathPrefix: pluginSettings.notePathPrefix,
                    projectTitle: projectTitleForTicket,
                    vault,
                })

                if (!ticket) {
                    new Notice(`Ticket "${linkedTicketName}" not found.`)

                    return
                }

                openTicketModal({
                    board,
                    onChange: () => {
                        onMutation({ ...board })
                    },
                    pluginSettings,
                    ticket,
                    vault,
                })
            })()
        })

        metaRow.append(ticketBadge)
    }

    if (metaRow.children.length > 0) {
        cardElement.append(metaRow)
    }

    if (card.blockedReason !== null) {
        const blockedSection = document.createElement("div")

        blockedSection.className = "kanban-card__blocked"

        const blockedIcon = document.createElement("span")

        blockedIcon.className = "kanban-card__blocked-icon"
        setIcon(blockedIcon, "ban")

        const blockedLabel = document.createElement("span")

        blockedLabel.className = "kanban-card__blocked-label"
        blockedLabel.textContent = "Blocked"

        const blockedReasonElement = document.createElement("span")

        blockedReasonElement.className = "kanban-card__blocked-reason"
        blockedReasonElement.textContent = card.blockedReason

        blockedSection.append(blockedIcon, blockedLabel, blockedReasonElement)
        cardElement.append(blockedSection)
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
                    backlog: false,
                    blockedReason: null,
                    completed: false,
                    date: null,
                    description: null,
                    id: generateId(),
                    linkedNote: null,
                    linkedTicket: null,
                    priority: null,
                    subtasks: [],
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
