import { setIcon } from "obsidian"

import type { CardType, PriorityType } from "../../shared"
import { generateId, getNextMonday, toDateString } from "../../shared"
import { immutableSpliceCard, immutableUpdateCard } from "../card"
import { showQuickAddDatePicker } from "../date-picker"
import type { QuickAddDialogOptionsType } from "./quick-add.types"

function openQuickAddDialog(options: QuickAddDialogOptionsType): void {
    const { board, editContext, onMutation, prefillDate } = options
    const isEditMode = editContext !== undefined
    let selectedDate: string | null = isEditMode ? editContext.card.date : (prefillDate ?? null)
    let selectedPriority: PriorityType = isEditMode ? editContext.card.priority : null

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

    const columnRow = document.createElement("div")

    columnRow.className = "kanban-quick-add__row"

    const columnLabel = document.createElement("span")

    columnLabel.className = "kanban-quick-add__label"
    columnLabel.textContent = "Project"
    columnRow.append(columnLabel)

    let selectedColumnIndex: number | null = isEditMode ? editContext.columnIndex : null

    const columnChips = document.createElement("div")

    columnChips.className = "kanban-quick-add__dates"

    const updateColumnChipStates = () => {
        for (const chip of Array.from(
            columnChips.querySelectorAll(".kanban-quick-add__date-button"),
        )) {
            const chipValue = (chip as HTMLElement).dataset.columnValue

            chip.classList.toggle(
                "kanban-quick-add__date-button--active",
                chipValue !== undefined && Number(chipValue) === selectedColumnIndex,
            )
        }
    }

    for (const [loopColumnIndex, column] of board.columns.entries()) {
        const chip = document.createElement("span")

        chip.className = "kanban-quick-add__date-button"
        chip.textContent = column.title
        chip.dataset.columnValue = String(loopColumnIndex)

        if (isEditMode && loopColumnIndex === editContext.columnIndex) {
            chip.classList.add("kanban-quick-add__date-button--active")
        }

        const capturedColumnIndex = loopColumnIndex

        // eslint-disable-next-line @typescript-eslint/no-loop-func -- intentional shared mutable state for toggle behavior
        chip.addEventListener("click", () => {
            selectedColumnIndex =
                selectedColumnIndex === capturedColumnIndex ? null : capturedColumnIndex
            updateColumnChipStates()
        })

        columnChips.append(chip)
    }

    columnRow.append(columnChips)
    dialog.append(columnRow)

    const dateRow = document.createElement("div")

    dateRow.className = "kanban-quick-add__row"

    const dateLabel = document.createElement("span")

    dateLabel.className = "kanban-quick-add__label"
    dateLabel.textContent = "Date"
    dateRow.append(dateLabel)

    const dateButtons = document.createElement("div")

    dateButtons.className = "kanban-quick-add__dates"

    const today = new Date()
    const tomorrow = new Date()

    tomorrow.setDate(tomorrow.getDate() + 1)

    const dateOptions: { label: string; pickDate?: boolean; value: string | null }[] = [
        { label: "Today", value: toDateString(today) },
        { label: "Tomorrow", value: toDateString(tomorrow) },
        { label: "Next Monday", value: toDateString(getNextMonday()) },
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

    const descriptionInput = document.createElement("textarea")

    descriptionInput.className = "kanban-quick-add__input kanban-quick-add__description"
    descriptionInput.placeholder = "Description (optional)..."
    descriptionInput.rows = 3

    if (isEditMode && editContext.card.description) {
        descriptionInput.value = editContext.card.description
    }

    dialog.append(descriptionInput)

    const submitButton = document.createElement("span")

    submitButton.className = "kanban-quick-add__submit"
    submitButton.textContent = isEditMode ? "Save task" : "Add task"

    const submit = () => {
        const title = titleInput.value.trim()

        if (!title) {
            titleInput.focus()

            return
        }

        if (selectedColumnIndex === null) {
            return
        }

        const columnIndex = selectedColumnIndex
        const descriptionValue = descriptionInput.value.trim() || null

        if (isEditMode) {
            const update: Partial<CardType> = {
                date: selectedDate,
                description: descriptionValue,
                priority: selectedPriority,
            }

            if (editContext.card.linkedNote) {
                update.linkedNote = title
            } else {
                update.title = title
            }

            let newColumns = immutableUpdateCard({
                cardIndex: editContext.cardIndex,
                columnIndex: editContext.columnIndex,
                columns: board.columns,
                update,
            })

            if (columnIndex !== editContext.columnIndex) {
                const updatedColumn = newColumns[editContext.columnIndex]
                const updatedCard = updatedColumn?.cards[editContext.cardIndex]

                if (!updatedCard) return

                newColumns = immutableSpliceCard({
                    cardIndex: editContext.cardIndex,
                    columnIndex: editContext.columnIndex,
                    columns: newColumns,
                    deleteCount: 1,
                })
                newColumns = immutableSpliceCard({
                    cardIndex: 0,
                    columnIndex,
                    columns: newColumns,
                    deleteCount: 0,
                    insertCards: [updatedCard],
                })
            }

            onMutation({ ...board, columns: newColumns })
        } else {
            const newCard: CardType = {
                completed: false,
                date: selectedDate,
                description: descriptionValue,
                id: generateId(),
                linkedNote: null,
                priority: selectedPriority,
                title,
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
