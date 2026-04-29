import { nextMonday, startOfTomorrow } from "date-fns"
import { setIcon } from "obsidian"

import type { CardType, PriorityType } from "../../shared"
import { generateId, toDateString } from "../../shared"
import { immutableSpliceCard, immutableUpdateCard } from "../card"
import { showQuickAddDatePicker } from "../date-picker"
import { getProjectColor, getProjectIcon } from "../project"
import { listProjectTickets } from "../ticket"
import type { QuickAddDialogOptionsType } from "./quick-add.types"

function openQuickAddDialog(options: QuickAddDialogOptionsType): void {
    const {
        board,
        editContext,
        onMutation,
        pluginSettings,
        prefillDate,
        prefillProjectIndex,
        prefillTicket,
        vault,
    } = options
    const isEditMode = editContext !== undefined
    let selectedDate: string | null = isEditMode ? editContext.card.date : (prefillDate ?? null)
    let selectedPriority: PriorityType = isEditMode ? editContext.card.priority : null
    let selectedBlockedReason: string | null = isEditMode ? editContext.card.blockedReason : null
    let selectedLinkedTicket: string | null = isEditMode
        ? editContext.card.linkedTicket
        : (prefillTicket ?? null)

    const overlay = document.createElement("div")

    overlay.className = "kanban-quick-add-overlay"

    const cleanup = () => {
        overlay.remove()
    }

    overlay.addEventListener("click", () => {
        cleanup()
    })

    const dialog = document.createElement("div")

    dialog.className = "kanban-quick-add-dialog"
    dialog.addEventListener("click", (dialogClickEvent) => {
        dialogClickEvent.stopPropagation()
    })

    const titleInput = document.createElement("input")

    titleInput.className = "kanban-quick-add__input"
    titleInput.type = "text"
    titleInput.placeholder = "Task title..."

    if (isEditMode) {
        titleInput.value = editContext.card.linkedNote ?? editContext.card.title
    }

    dialog.append(titleInput)

    const descriptionInput = document.createElement("textarea")

    descriptionInput.className = "kanban-quick-add__input kanban-quick-add__description"
    descriptionInput.placeholder = "Description (optional)..."
    descriptionInput.rows = 3

    if (isEditMode && editContext.card.description) {
        descriptionInput.value = editContext.card.description
    }

    dialog.append(descriptionInput)

    const projectRow = document.createElement("div")

    projectRow.className = "kanban-quick-add__row"

    const projectLabel = document.createElement("span")

    projectLabel.className = "kanban-quick-add__label"
    projectLabel.textContent = "Project"
    projectRow.append(projectLabel)

    let selectedProjectIndex: number | null = isEditMode
        ? editContext.projectIndex
        : (prefillProjectIndex ?? null)

    const projectChips = document.createElement("div")

    projectChips.className = "kanban-quick-add__dates"

    const updateProjectChipStates = () => {
        for (const chip of Array.from(
            projectChips.querySelectorAll(".kanban-quick-add__date-button"),
        )) {
            const chipValue = (chip as HTMLElement).dataset.projectValue

            chip.classList.toggle(
                "kanban-quick-add__date-button--active",
                chipValue !== undefined && Number(chipValue) === selectedProjectIndex,
            )
        }
    }

    const ticketRow = document.createElement("div")

    ticketRow.className = "kanban-quick-add__row"
    ticketRow.style.display = pluginSettings && vault ? "" : "none"

    const ticketLabel = document.createElement("span")

    ticketLabel.className = "kanban-quick-add__label"
    ticketLabel.textContent = "Ticket"
    ticketRow.append(ticketLabel)

    const ticketChips = document.createElement("div")

    ticketChips.className = "kanban-quick-add__dates"
    ticketRow.append(ticketChips)

    const updateTicketChipStates = () => {
        for (const otherChip of Array.from(
            ticketChips.querySelectorAll(".kanban-quick-add__date-button"),
        )) {
            const value = (otherChip as HTMLElement).dataset.ticketName
            const isActive = value !== undefined && value === selectedLinkedTicket

            otherChip.classList.toggle("kanban-quick-add__date-button--active", isActive)
        }
    }

    const renderTicketChip = (ticketName: string): HTMLElement => {
        const chip = document.createElement("span")

        chip.className = "kanban-quick-add__date-button"
        chip.textContent = ticketName
        chip.dataset.ticketName = ticketName

        if (selectedLinkedTicket === ticketName) {
            chip.classList.add("kanban-quick-add__date-button--active")
        }

        chip.addEventListener("click", () => {
            selectedLinkedTicket = selectedLinkedTicket === ticketName ? null : ticketName
            updateTicketChipStates()
        })

        return chip
    }

    const refreshTicketChips = () => {
        if (!pluginSettings || !vault) {
            return
        }

        ticketChips.empty()

        const projectIndexAtStart = selectedProjectIndex

        if (projectIndexAtStart === null) {
            const placeholder = document.createElement("span")

            placeholder.className = "kanban-quick-add__ticket-placeholder"
            placeholder.textContent = "Pick a project first"
            ticketChips.append(placeholder)

            return
        }

        const project = board.projects[projectIndexAtStart]

        if (!project) {
            return
        }

        const projectTitle = project.title

        void (async () => {
            const tickets = await listProjectTickets({
                notePathPrefix: pluginSettings.notePathPrefix,
                projectTitle,
                vault,
            })

            if (selectedProjectIndex !== projectIndexAtStart) {
                return
            }

            ticketChips.empty()

            if (tickets.length === 0) {
                const placeholder = document.createElement("span")

                placeholder.className = "kanban-quick-add__ticket-placeholder"
                placeholder.textContent = "No tickets in this project"
                ticketChips.append(placeholder)

                return
            }

            for (const ticket of tickets) {
                ticketChips.append(renderTicketChip(ticket.name))
            }
        })()
    }

    for (const [loopProjectIndex, project] of board.projects.entries()) {
        if (board.settings.archivedProjects.includes(project.title)) {
            continue
        }

        const chip = document.createElement("span")

        chip.className = "kanban-quick-add__date-button"
        chip.dataset.projectValue = String(loopProjectIndex)

        const chipIcon = getProjectIcon(project.title, board)

        if (chipIcon) {
            const chipIconSpan = document.createElement("span")

            chipIconSpan.className = "kanban-quick-add__chip-icon"
            chipIconSpan.style.color = getProjectColor(project.title, loopProjectIndex, board)
            setIcon(chipIconSpan, chipIcon)
            chip.append(chipIconSpan)
        }

        chip.append(document.createTextNode(project.title))

        if (loopProjectIndex === selectedProjectIndex) {
            chip.classList.add("kanban-quick-add__date-button--active")
        }

        const capturedProjectIndex = loopProjectIndex

        // eslint-disable-next-line @typescript-eslint/no-loop-func -- intentional shared mutable state for toggle behavior
        chip.addEventListener("click", () => {
            const previous = selectedProjectIndex

            selectedProjectIndex =
                selectedProjectIndex === capturedProjectIndex ? null : capturedProjectIndex

            if (previous !== selectedProjectIndex) {
                selectedLinkedTicket = null
                refreshTicketChips()
            }

            updateProjectChipStates()
        })

        projectChips.append(chip)
    }

    projectRow.append(projectChips)
    dialog.append(projectRow)
    dialog.append(ticketRow)
    refreshTicketChips()

    const dateRow = document.createElement("div")

    dateRow.className = "kanban-quick-add__row"

    const dateLabel = document.createElement("span")

    dateLabel.className = "kanban-quick-add__label"
    dateLabel.textContent = "Date"
    dateRow.append(dateLabel)

    const dateButtons = document.createElement("div")

    dateButtons.className = "kanban-quick-add__dates"

    const today = new Date()
    const dateOptions: { label: string; pickDate?: boolean; value: string | null }[] = [
        { label: "Today", value: toDateString(today) },
        { label: "Tomorrow", value: toDateString(startOfTomorrow()) },
        { label: "Next Monday", value: toDateString(nextMonday(new Date())) },
        { label: "Pick date", pickDate: true, value: null },
    ]

    const updateDateButtonStates = () => {
        for (const button of Array.from(
            dateButtons.querySelectorAll(".kanban-quick-add__date-button"),
        )) {
            const buttonValue = (button as HTMLElement).dataset.dateValue ?? null
            const isPickDate = (button as HTMLElement).dataset.pickDate === "true"

            if (isPickDate) {
                button.classList.toggle(
                    "kanban-quick-add__date-button--active",
                    selectedDate !== null &&
                        // eslint-disable-next-line @typescript-eslint/no-loop-func -- intentional shared mutable state
                        !dateOptions.some((option) => {
                            return !option.pickDate && option.value === selectedDate
                        }),
                )
            } else {
                button.classList.toggle(
                    "kanban-quick-add__date-button--active",
                    selectedDate === buttonValue,
                )
            }
        }
    }

    for (const dateOption of dateOptions) {
        const dateButton = document.createElement("span")

        dateButton.className = "kanban-quick-add__date-button"
        dateButton.textContent = dateOption.label

        if (dateOption.pickDate) {
            dateButton.dataset.pickDate = "true"
            // eslint-disable-next-line @typescript-eslint/no-loop-func -- intentional shared mutable state for date picker
            dateButton.addEventListener("click", () => {
                showQuickAddDatePicker((dateString) => {
                    selectedDate = dateString
                    updateDateButtonStates()
                })
            })
        } else {
            dateButton.dataset.dateValue = dateOption.value ?? ""
            const capturedValue = dateOption.value

            // eslint-disable-next-line @typescript-eslint/no-loop-func -- intentional shared mutable state for toggle behavior
            dateButton.addEventListener("click", () => {
                selectedDate = selectedDate === capturedValue ? null : capturedValue
                updateDateButtonStates()
            })
        }

        dateButtons.append(dateButton)
    }

    updateDateButtonStates()

    dateRow.append(dateButtons)
    dialog.append(dateRow)

    const priorityRow = document.createElement("div")

    priorityRow.className = "kanban-quick-add__row"

    const priorityLabel = document.createElement("span")

    priorityLabel.className = "kanban-quick-add__label"
    priorityLabel.textContent = "Priority"
    priorityRow.append(priorityLabel)

    const priorityButton = document.createElement("span")

    priorityButton.className = "kanban-quick-add__priority"

    const priorityIcon = document.createElement("span")

    priorityIcon.className = "kanban-quick-add__priority-icon"
    setIcon(priorityIcon, "alert-circle")
    priorityButton.append(priorityIcon, document.createTextNode("Important"))

    if (isEditMode && selectedPriority === "important") {
        priorityButton.classList.add("kanban-quick-add__priority--active")
    }

    priorityButton.addEventListener("click", () => {
        selectedPriority = selectedPriority === "important" ? null : "important"
        priorityButton.classList.toggle(
            "kanban-quick-add__priority--active",
            selectedPriority === "important",
        )
    })

    priorityRow.append(priorityButton)
    dialog.append(priorityRow)

    const blockedRow = document.createElement("div")

    blockedRow.className = "kanban-quick-add__row"

    const blockedLabel = document.createElement("span")

    blockedLabel.className = "kanban-quick-add__label"
    blockedLabel.textContent = "Blocked"
    blockedRow.append(blockedLabel)

    const blockedToggleContainer = document.createElement("div")

    blockedToggleContainer.className = "kanban-quick-add__blocked-container"

    const blockedToggle = document.createElement("span")

    blockedToggle.className = "kanban-quick-add__blocked-toggle"

    const blockedToggleIcon = document.createElement("span")

    blockedToggleIcon.className = "kanban-quick-add__blocked-toggle-icon"
    setIcon(blockedToggleIcon, "ban")
    blockedToggle.append(blockedToggleIcon, document.createTextNode("Blocked"))

    const blockedReasonInput = document.createElement("input")

    blockedReasonInput.className = "kanban-quick-add__blocked-reason-input"
    blockedReasonInput.type = "text"
    blockedReasonInput.placeholder = "Reason..."

    if (isEditMode && selectedBlockedReason !== null) {
        blockedToggle.classList.add("kanban-quick-add__blocked-toggle--active")
        blockedReasonInput.value = selectedBlockedReason
        blockedReasonInput.style.display = ""
    } else {
        blockedReasonInput.style.display = "none"
    }

    blockedToggle.addEventListener("click", () => {
        if (selectedBlockedReason !== null) {
            selectedBlockedReason = null
            blockedToggle.classList.remove("kanban-quick-add__blocked-toggle--active")
            blockedReasonInput.style.display = "none"
            blockedReasonInput.value = ""
        } else {
            selectedBlockedReason = ""
            blockedToggle.classList.add("kanban-quick-add__blocked-toggle--active")
            blockedReasonInput.style.display = ""
            blockedReasonInput.focus()
        }
    })

    blockedReasonInput.addEventListener("input", () => {
        selectedBlockedReason = blockedReasonInput.value
    })

    blockedToggleContainer.append(blockedToggle, blockedReasonInput)
    blockedRow.append(blockedToggleContainer)
    dialog.append(blockedRow)

    const submitButton = document.createElement("span")

    submitButton.className = "kanban-quick-add__submit"
    submitButton.textContent = isEditMode ? "Save task" : "Add task"

    const submit = () => {
        const title = titleInput.value.trim()

        if (!title) {
            titleInput.focus()

            return
        }

        if (selectedProjectIndex === null) {
            return
        }

        const projectIndex = selectedProjectIndex
        const descriptionValue = descriptionInput.value.trim() || null

        if (isEditMode) {
            const blockedReasonValue =
                selectedBlockedReason !== null && selectedBlockedReason.trim() !== ""
                    ? selectedBlockedReason.trim()
                    : null

            const update: Partial<CardType> = {
                backlog: selectedDate ? false : editContext.card.backlog,
                blockedReason: blockedReasonValue,
                date: selectedDate,
                description: descriptionValue,
                linkedTicket: selectedLinkedTicket,
                priority: selectedPriority,
            }

            if (editContext.card.linkedNote) {
                update.linkedNote = title
            } else {
                update.title = title
            }

            let newProjects = immutableUpdateCard({
                cardIndex: editContext.cardIndex,
                projectIndex: editContext.projectIndex,
                projects: board.projects,
                update,
            })

            if (projectIndex !== editContext.projectIndex) {
                const updatedProject = newProjects[editContext.projectIndex]
                const updatedCard = updatedProject?.cards[editContext.cardIndex]

                if (!updatedCard) {
                    return
                }

                newProjects = immutableSpliceCard({
                    cardIndex: editContext.cardIndex,
                    deleteCount: 1,
                    projectIndex: editContext.projectIndex,
                    projects: newProjects,
                })
                newProjects = immutableSpliceCard({
                    cardIndex: 0,
                    deleteCount: 0,
                    insertCards: [updatedCard],
                    projectIndex,
                    projects: newProjects,
                })
            }

            onMutation({ ...board, projects: newProjects })
        } else {
            const newBlockedReasonValue =
                selectedBlockedReason !== null && selectedBlockedReason.trim() !== ""
                    ? selectedBlockedReason.trim()
                    : null

            const newCard: CardType = {
                backlog: false,
                blockedReason: newBlockedReasonValue,
                completed: false,
                date: selectedDate,
                description: descriptionValue,
                id: generateId(),
                linkedNote: null,
                linkedTicket: selectedLinkedTicket,
                priority: selectedPriority,
                subtasks: [],
                title,
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

        cleanup()
    }

    submitButton.addEventListener("click", submit)
    dialog.append(submitButton)

    titleInput.addEventListener("keydown", (keyboardEvent) => {
        if (keyboardEvent.key === "Enter") {
            keyboardEvent.preventDefault()
            submit()
        }

        if (keyboardEvent.key === "Escape") {
            cleanup()
        }
    })

    dialog.addEventListener("keydown", (keyboardEvent) => {
        if (keyboardEvent.key === "Escape") {
            cleanup()
        }
    })

    overlay.append(dialog)
    document.body.append(overlay)
    titleInput.focus()
}

export { openQuickAddDialog }
