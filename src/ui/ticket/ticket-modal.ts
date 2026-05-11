import { Notice, setIcon, type Vault } from "obsidian"

import type { BoardType, CardType, PluginSettingsType } from "../../shared"
import { immutableUpdateCard } from "../card"
import { startInlineEdit } from "../inline-edit"
import { openQuickAddDialog } from "../quick-add"
import {
    addTicketEntry,
    deleteTicket,
    formatRelativeTime,
    readTicket,
    renameTicket,
    updateTicketEntries,
    updateTicketLink,
    updateTicketStatus,
} from "./ticket"
import { extractTicketId } from "./ticket-providers"
import type { TicketStatusType, TicketType } from "./ticket.types"

type TicketModalOptionsType = {
    board: BoardType
    onChange: () => void
    pluginSettings: PluginSettingsType
    ticket: TicketType
    vault: Vault
}

type LinkedCardType = {
    card: CardType
    cardIndex: number
    projectIndex: number
}

function findLinkedCards(board: BoardType, ticketName: string): LinkedCardType[] {
    const matches: LinkedCardType[] = []

    for (let projectIndex = 0; projectIndex < board.projects.length; projectIndex++) {
        const project = board.projects[projectIndex]

        if (!project) {
            continue
        }

        for (let cardIndex = 0; cardIndex < project.cards.length; cardIndex++) {
            const card = project.cards[cardIndex]

            if (!card) {
                continue
            }

            if (card.linkedTicket === ticketName) {
                matches.push({ card, cardIndex, projectIndex })
            }
        }
    }

    return matches
}

function updateLinkedTicketReferences(
    projects: BoardType["projects"],
    oldName: string,
    newName: string,
): BoardType["projects"] {
    let next = projects

    for (let projectIndex = 0; projectIndex < next.length; projectIndex++) {
        const project = next[projectIndex]

        if (!project) {
            continue
        }

        for (let cardIndex = 0; cardIndex < project.cards.length; cardIndex++) {
            const card = project.cards[cardIndex]

            if (card?.linkedTicket === oldName) {
                next = immutableUpdateCard({
                    cardIndex,
                    projectIndex,
                    projects: next,
                    update: { linkedTicket: newName },
                })
            }
        }
    }

    return next
}

export function openTicketModal(options: TicketModalOptionsType): void {
    const { board, onChange, pluginSettings, ticket, vault } = options
    let currentTicket = ticket

    const overlay = document.createElement("div")

    overlay.className = "kanban-quick-add-overlay"

    const cleanup = () => {
        overlay.remove()
    }

    overlay.addEventListener("click", () => {
        cleanup()
    })

    const dialog = document.createElement("div")

    dialog.className = "kanban-quick-add-dialog kanban-ticket-modal"
    dialog.addEventListener("click", (dialogClickEvent) => {
        dialogClickEvent.stopPropagation()
    })

    const headerRow = document.createElement("div")

    headerRow.className = "kanban-ticket-modal__header"

    const idBadge = document.createElement("span")

    idBadge.className = "kanban-ticket-modal__id"
    headerRow.append(idBadge)

    const titleElement = document.createElement("div")

    titleElement.className = "kanban-ticket-modal__title"
    titleElement.textContent = currentTicket.name
    headerRow.append(titleElement)

    const projectBadge = document.createElement("span")

    projectBadge.className = "kanban-ticket-modal__project"
    projectBadge.textContent = currentTicket.projectTitle
    headerRow.append(projectBadge)

    dialog.append(headerRow)

    const renderIdBadge = () => {
        const match = extractTicketId(currentTicket.link)

        idBadge.classList.remove(
            "kanban-ticket-modal__id--mine",
            "kanban-ticket-modal__id--waiting",
            "kanban-ticket-modal__id--done",
        )

        switch (currentTicket.status) {
            case "mine": {
                idBadge.classList.add("kanban-ticket-modal__id--mine")

                break
            }

            case "waiting": {
                idBadge.classList.add("kanban-ticket-modal__id--waiting")

                break
            }

            case "done": {
                idBadge.classList.add("kanban-ticket-modal__id--done")

                break
            }
            // No default
        }

        const fallbackBadgeText: Record<Exclude<TicketStatusType, null>, string> = {
            done: "DONE",
            mine: "MINE",
            waiting: "WAIT",
        }
        const fallbackBadgeTitle: Record<Exclude<TicketStatusType, null>, string> = {
            done: "Done",
            mine: "My turn",
            waiting: "Waiting",
        }

        if (match) {
            idBadge.textContent = match.id
            idBadge.title = `${match.source}: ${match.id}`
            idBadge.style.display = ""
        } else if (currentTicket.status) {
            idBadge.textContent = fallbackBadgeText[currentTicket.status]
            idBadge.title = fallbackBadgeTitle[currentTicket.status]
            idBadge.style.display = ""
        } else {
            idBadge.textContent = ""
            idBadge.style.display = "none"
        }

        dialog.classList.toggle("kanban-ticket-modal--done", currentTicket.status === "done")
    }

    renderIdBadge()

    const statusRow = document.createElement("div")

    statusRow.className = "kanban-ticket-modal__status-row"

    const statusLabel = document.createElement("span")

    statusLabel.className = "kanban-quick-add__label"
    statusLabel.textContent = "Status"
    statusRow.append(statusLabel)

    const statusButtons = document.createElement("div")

    statusButtons.className = "kanban-quick-add__dates"

    const statusOptions: { label: string; value: TicketStatusType }[] = [
        { label: "My turn", value: "mine" },
        { label: "Waiting", value: "waiting" },
        { label: "Done", value: "done" },
        { label: "—", value: null },
    ]

    const updateStatusButtonStates = () => {
        for (const button of Array.from(
            statusButtons.querySelectorAll(".kanban-quick-add__date-button"),
        )) {
            const buttonValue = (button as HTMLElement).dataset.statusValue
            const normalized = buttonValue === "" ? null : (buttonValue as TicketStatusType)

            button.classList.toggle(
                "kanban-quick-add__date-button--active",
                normalized === currentTicket.status,
            )
        }
    }

    for (const statusOption of statusOptions) {
        const statusButton = document.createElement("span")

        statusButton.className = "kanban-quick-add__date-button"
        statusButton.textContent = statusOption.label
        statusButton.dataset.statusValue = statusOption.value ?? ""

        const capturedValue = statusOption.value

        // eslint-disable-next-line @typescript-eslint/no-loop-func -- handlers reference modal-scoped state intentionally
        statusButton.addEventListener("click", () => {
            if (capturedValue === currentTicket.status) {
                return
            }

            void (async () => {
                try {
                    await updateTicketStatus({
                        name: currentTicket.name,
                        newStatus: capturedValue,
                        notePathPrefix: pluginSettings.notePathPrefix,
                        projectTitle: currentTicket.projectTitle,
                        vault,
                    })
                    currentTicket = { ...currentTicket, status: capturedValue }
                    updateStatusButtonStates()
                    renderIdBadge()
                    onChange()
                } catch (error) {
                    new Notice(`Failed to update status: ${String(error)}`)
                }
            })()
        })

        statusButtons.append(statusButton)
    }

    updateStatusButtonStates()
    statusRow.append(statusButtons)
    dialog.append(statusRow)

    const linkRow = document.createElement("div")

    linkRow.className = "kanban-ticket-modal__link-row"

    const linkAnchor = document.createElement("a")

    linkAnchor.className = "kanban-ticket-modal__link"

    const linkIcon = document.createElement("span")

    linkIcon.className = "kanban-ticket-modal__link-icon"
    setIcon(linkIcon, "external-link")
    linkAnchor.append(linkIcon)
    linkAnchor.append(document.createTextNode("Open in Linear"))
    linkAnchor.target = "_blank"
    linkAnchor.rel = "noopener noreferrer"
    linkRow.append(linkAnchor)

    const renderLink = () => {
        if (currentTicket.link) {
            linkAnchor.href = currentTicket.link
            linkAnchor.style.display = ""
        } else {
            linkAnchor.style.display = "none"
        }
    }

    renderLink()
    dialog.append(linkRow)

    const addEntryRow = document.createElement("div")

    addEntryRow.className = "kanban-ticket-modal__add-entry"

    const entryInput = document.createElement("input")

    entryInput.type = "text"
    entryInput.className = "kanban-quick-add__input"
    entryInput.placeholder = "Add an update..."
    addEntryRow.append(entryInput)

    const entryButton = document.createElement("span")

    entryButton.className = "kanban-quick-add__submit"
    entryButton.textContent = "Add update"
    addEntryRow.append(entryButton)

    dialog.append(addEntryRow)

    const entriesList = document.createElement("div")

    entriesList.className = "kanban-ticket-modal__entries"
    dialog.append(entriesList)

    async function refreshTicket(): Promise<void> {
        const updated = await readTicket({
            name: currentTicket.name,
            notePathPrefix: pluginSettings.notePathPrefix,
            projectTitle: currentTicket.projectTitle,
            vault,
        })

        if (updated) {
            // eslint-disable-next-line require-atomic-updates -- single-flight modal, sequential by user interaction
            currentTicket = updated
            // eslint-disable-next-line @typescript-eslint/no-use-before-define -- mutually recursive helpers
            renderEntries()
        }
    }

    function renderEntries(): void {
        entriesList.empty()

        if (currentTicket.entries.length === 0) {
            const empty = document.createElement("div")

            empty.className = "kanban-ticket-modal__empty"
            empty.textContent = "No updates yet. Add the first one above."
            entriesList.append(empty)

            return
        }

        for (const entry of currentTicket.entries) {
            const capturedTimestamp = entry.timestamp
            const item = document.createElement("div")

            item.className = "kanban-ticket-modal__entry"

            const entryHeader = document.createElement("div")

            entryHeader.className = "kanban-ticket-modal__entry-header"

            const time = document.createElement("div")

            time.className = "kanban-ticket-modal__entry-time"
            time.textContent = `${entry.timestamp} · ${formatRelativeTime(entry.timestamp)}`
            entryHeader.append(time)

            const actions = document.createElement("div")

            actions.className = "kanban-ticket-modal__entry-actions"

            const editAction = document.createElement("span")

            editAction.className = "kanban-ticket-modal__entry-action"
            setIcon(editAction, "pencil")

            const text = document.createElement("div")

            text.className = "kanban-ticket-modal__entry-text"
            text.textContent = entry.text

            // eslint-disable-next-line @typescript-eslint/no-loop-func -- handlers reference modal-scoped state intentionally
            editAction.addEventListener("click", (clickEvent) => {
                clickEvent.stopPropagation()
                startInlineEdit(text, entry.text, (newValue) => {
                    const trimmed = newValue.trim()

                    if (trimmed.length === 0 || trimmed === entry.text) {
                        text.textContent = entry.text

                        return
                    }

                    void (async () => {
                        try {
                            await updateTicketEntries({
                                name: currentTicket.name,
                                notePathPrefix: pluginSettings.notePathPrefix,
                                projectTitle: currentTicket.projectTitle,
                                transform: (entries) => {
                                    return entries.map((existingEntry) => {
                                        if (
                                            existingEntry.timestamp === capturedTimestamp &&
                                            existingEntry.text === entry.text
                                        ) {
                                            return { ...existingEntry, text: trimmed }
                                        }

                                        return existingEntry
                                    })
                                },
                                vault,
                            })
                            await refreshTicket()
                            onChange()
                        } catch (error) {
                            new Notice(`Failed to edit update: ${String(error)}`)
                        }
                    })()
                })
            })

            const deleteAction = document.createElement("span")

            deleteAction.className =
                "kanban-ticket-modal__entry-action kanban-ticket-modal__entry-action--danger"
            setIcon(deleteAction, "trash-2")

            let deleteArmed = false

            // eslint-disable-next-line @typescript-eslint/no-loop-func -- handlers reference modal-scoped state intentionally
            deleteAction.addEventListener("click", (clickEvent) => {
                clickEvent.stopPropagation()

                if (!deleteArmed) {
                    deleteArmed = true
                    deleteAction.classList.add("kanban-ticket-modal__entry-action--armed")
                    setIcon(deleteAction, "check")

                    window.setTimeout(() => {
                        deleteArmed = false
                        deleteAction.classList.remove("kanban-ticket-modal__entry-action--armed")
                        setIcon(deleteAction, "trash-2")
                    }, 3000)

                    return
                }

                void (async () => {
                    try {
                        await updateTicketEntries({
                            name: currentTicket.name,
                            notePathPrefix: pluginSettings.notePathPrefix,
                            projectTitle: currentTicket.projectTitle,
                            transform: (entries) => {
                                let removed = false

                                return entries.filter((existingEntry) => {
                                    if (
                                        !removed &&
                                        existingEntry.timestamp === capturedTimestamp &&
                                        existingEntry.text === entry.text
                                    ) {
                                        removed = true

                                        return false
                                    }

                                    return true
                                })
                            },
                            vault,
                        })
                        await refreshTicket()
                        onChange()
                    } catch (error) {
                        new Notice(`Failed to delete update: ${String(error)}`)
                    }
                })()
            })

            actions.append(editAction, deleteAction)
            entryHeader.append(actions)
            item.append(entryHeader)
            item.append(text)

            entriesList.append(item)
        }
    }

    renderEntries()

    const submitEntry = async () => {
        const text = entryInput.value.trim()

        if (!text) {
            entryInput.focus()

            return
        }

        entryInput.value = ""

        try {
            await addTicketEntry({
                name: currentTicket.name,
                notePathPrefix: pluginSettings.notePathPrefix,
                projectTitle: currentTicket.projectTitle,
                text,
                vault,
            })
            await refreshTicket()
            onChange()
        } catch (error) {
            new Notice(`Failed to add update: ${String(error)}`)
        }
    }

    entryButton.addEventListener("click", () => {
        void submitEntry()
    })

    entryInput.addEventListener("keydown", (keyboardEvent) => {
        if (keyboardEvent.key === "Enter") {
            keyboardEvent.preventDefault()
            void submitEntry()
        }
    })

    const linkedCardsSection = document.createElement("div")

    linkedCardsSection.className = "kanban-ticket-modal__linked-cards"

    const renderLinkedCards = () => {
        linkedCardsSection.empty()

        const heading = document.createElement("div")

        heading.className = "kanban-ticket-modal__section-heading"
        heading.textContent = "Linked tasks"
        linkedCardsSection.append(heading)

        const linked = findLinkedCards(board, currentTicket.name)

        if (linked.length === 0) {
            const empty = document.createElement("div")

            empty.className = "kanban-ticket-modal__empty"
            empty.textContent = "No tasks linked to this ticket."
            linkedCardsSection.append(empty)

            return
        }

        for (const linkedCard of linked) {
            const item = document.createElement("div")

            item.className = "kanban-ticket-modal__linked-card"

            const checkboxIndicator = document.createElement("span")

            checkboxIndicator.className = "kanban-ticket-modal__linked-card-status"
            checkboxIndicator.textContent = linkedCard.card.completed ? "✓" : "•"
            item.append(checkboxIndicator)

            const cardTitle = document.createElement("span")

            cardTitle.className = "kanban-ticket-modal__linked-card-title"
            cardTitle.textContent = linkedCard.card.linkedNote ?? linkedCard.card.title
            item.append(cardTitle)

            if (linkedCard.card.date) {
                const dateBadge = document.createElement("span")

                dateBadge.className = "kanban-ticket-modal__linked-card-date"
                dateBadge.textContent = linkedCard.card.date
                item.append(dateBadge)
            }

            linkedCardsSection.append(item)
        }
    }

    renderLinkedCards()
    dialog.append(linkedCardsSection)

    const actionsRow = document.createElement("div")

    actionsRow.className = "kanban-ticket-modal__actions"

    const addTaskButton = document.createElement("span")

    addTaskButton.className = "kanban-ticket-modal__action"
    addTaskButton.textContent = "+ Add task"
    addTaskButton.addEventListener("click", () => {
        const projectIndex = board.projects.findIndex((project) => {
            return project.title === currentTicket.projectTitle
        })

        if (projectIndex === -1) {
            new Notice("Project no longer exists for this ticket.")

            return
        }

        cleanup()
        openQuickAddDialog({
            board,
            onMutation: (newBoard) => {
                Object.assign(board, newBoard)
                onChange()
            },
            pluginSettings,
            prefillProjectIndex: projectIndex,
            prefillTicket: currentTicket.name,
            vault,
        })
    })
    actionsRow.append(addTaskButton)

    const editLinkButton = document.createElement("span")

    editLinkButton.className = "kanban-ticket-modal__action"
    editLinkButton.textContent = "Edit link"
    editLinkButton.addEventListener("click", () => {
        startInlineEdit(linkAnchor, currentTicket.link ?? "", (value) => {
            const trimmed = value.trim()
            const newLink = trimmed.length > 0 ? trimmed : null

            void (async () => {
                try {
                    await updateTicketLink({
                        name: currentTicket.name,
                        newLink,
                        notePathPrefix: pluginSettings.notePathPrefix,
                        projectTitle: currentTicket.projectTitle,
                        vault,
                    })
                    currentTicket = { ...currentTicket, link: newLink }
                    renderLink()
                    renderIdBadge()
                    onChange()
                } catch (error) {
                    new Notice(`Failed to update link: ${String(error)}`)
                }
            })()
        })
    })
    actionsRow.append(editLinkButton)

    const renameButton = document.createElement("span")

    renameButton.className = "kanban-ticket-modal__action"
    renameButton.textContent = "Rename"
    renameButton.addEventListener("click", () => {
        startInlineEdit(titleElement, currentTicket.name, (value) => {
            const trimmed = value.trim()

            if (trimmed.length === 0 || trimmed === currentTicket.name) {
                titleElement.textContent = currentTicket.name

                return
            }

            void (async () => {
                try {
                    const oldName = currentTicket.name

                    const savedName = await renameTicket({
                        newName: trimmed,
                        notePathPrefix: pluginSettings.notePathPrefix,
                        oldName,
                        projectTitle: currentTicket.projectTitle,
                        vault,
                    })

                    board.projects = updateLinkedTicketReferences(
                        board.projects,
                        oldName,
                        savedName,
                    )
                    currentTicket = { ...currentTicket, name: savedName }
                    titleElement.textContent = savedName
                    onChange()
                } catch (error) {
                    new Notice(`Failed to rename ticket: ${String(error)}`)
                }
            })()
        })
    })
    actionsRow.append(renameButton)

    const deleteButton = document.createElement("span")

    deleteButton.className = "kanban-ticket-modal__action kanban-ticket-modal__action--danger"
    deleteButton.textContent = "Delete"

    let deleteConfirmArmed = false

    deleteButton.addEventListener("click", () => {
        if (!deleteConfirmArmed) {
            deleteConfirmArmed = true
            deleteButton.textContent = "Click again to confirm"

            window.setTimeout(() => {
                deleteConfirmArmed = false
                deleteButton.textContent = "Delete"
            }, 3000)

            return
        }

        void (async () => {
            try {
                await deleteTicket({
                    name: currentTicket.name,
                    notePathPrefix: pluginSettings.notePathPrefix,
                    projectTitle: currentTicket.projectTitle,
                    vault,
                })
                cleanup()
                onChange()
            } catch (error) {
                new Notice(`Failed to delete ticket: ${String(error)}`)
            }
        })()
    })
    actionsRow.append(deleteButton)

    dialog.append(actionsRow)

    overlay.append(dialog)
    document.body.append(overlay)
    entryInput.focus()
}
