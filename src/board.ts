import { type App, Menu, Notice, requestUrl, setIcon, TFile, type Vault } from "obsidian"
// eslint-disable-next-line import-x/no-named-as-default -- SortableJS exports Sortable as both default and named
import Sortable, { type SortableEvent } from "sortablejs"

import {
    formatDate,
    getNextMonday,
    immutableSpliceCard,
    immutableUpdateCard,
    toDateString,
} from "./board-utils"
import { generateId } from "./parser"
import type {
    BoardType,
    CardType,
    ColumnType,
    PluginSettingsType,
    PriorityType,
    ViewStateType,
} from "./types"

const BRAT_REPO = "vuki656/brain"
const PLUGIN_ID = "obsidian-vuki-kanban"

async function selfUpdate(app: App): Promise<void> {
    const pluginDirectory = `${app.vault.configDir}/plugins/${PLUGIN_ID}`
    const files = ["main.js", "manifest.json", "styles.css"]

    const currentManifestResponse = await app.vault.adapter.read(`${pluginDirectory}/manifest.json`)
    const currentVersion = JSON.parse(currentManifestResponse).version

    const manifestResponse = await requestUrl({
        url: `https://github.com/${BRAT_REPO}/releases/latest/download/manifest.json?cb=${Date.now()}`,
    })
    const latestVersion = JSON.parse(manifestResponse.text).version

    if (currentVersion === latestVersion) {
        new Notice(`Already on latest version (${currentVersion}).`)

        return
    }

    const downloadBase = `https://github.com/${BRAT_REPO}/releases/download/${latestVersion}`

    const downloads = await Promise.all(
        files.map(async (fileName) => {
            const response = await requestUrl({ url: `${downloadBase}/${fileName}` })

            return { content: response.text, fileName }
        }),
    )

    for (const download of downloads) {
        // eslint-disable-next-line no-await-in-loop -- sequential file writes are intentional
        await app.vault.adapter.write(`${pluginDirectory}/${download.fileName}`, download.content)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Obsidian internal API lacks types
    await (app as any).plugins.disablePlugin(PLUGIN_ID)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Obsidian internal API lacks types
    await (app as any).plugins.enablePlugin(PLUGIN_ID)

    new Notice(`Updated to ${latestVersion}. Plugin reloaded.`)
}

type MutationHandlerType = (board: BoardType) => void

type TodayCardType = {
    card: CardType
    cardIndex: number
    columnIndex: number
    columnTitle: string
}

type DateGroupType = {
    cards: TodayCardType[]
    dateKey: string
    label: string
}

const COLUMN_COLORS = [
    "var(--color-blue)",
    "var(--color-purple)",
    "var(--color-green)",
    "var(--color-orange)",
    "var(--color-red)",
    "var(--color-yellow)",
    "var(--color-cyan)",
    "var(--color-pink)",
]

const COLUMN_COLOR_LABELS: Record<string, string> = {
    "var(--color-blue)": "Blue",
    "var(--color-cyan)": "Cyan",
    "var(--color-green)": "Green",
    "var(--color-orange)": "Orange",
    "var(--color-pink)": "Pink",
    "var(--color-purple)": "Purple",
    "var(--color-red)": "Red",
    "var(--color-yellow)": "Yellow",
}

function getColumnColor(columnTitle: string, columnIndex: number, board: BoardType): string {
    const customColor = board.settings.columnColors[columnTitle]

    if (customColor) {
        return customColor
    }

    return COLUMN_COLORS[columnIndex % COLUMN_COLORS.length]
}

function isCardVisibleInTodayFilter(card: CardType): boolean {
    if (card.completed) {
        return false
    }

    if (card.date) {
        return true
    }

    return false
}

function sortCardsByOrder(cards: TodayCardType[], savedOrder: string[]): TodayCardType[] {
    if (savedOrder.length === 0) {
        return cards
    }

    const sorted = [...cards]

    sorted.sort((first, second) => {
        const indexOfFirst = savedOrder.indexOf(first.card.id)
        const indexOfSecond = savedOrder.indexOf(second.card.id)
        const effectiveFirst = indexOfFirst === -1 ? savedOrder.length : indexOfFirst
        const effectiveSecond = indexOfSecond === -1 ? savedOrder.length : indexOfSecond

        return effectiveFirst - effectiveSecond
    })

    return sorted
}

function formatDateGroupLabel(dateString: string): string {
    const cardDate = new Date(`${dateString}T00:00:00`)
    const today = new Date()

    today.setHours(0, 0, 0, 0)
    cardDate.setHours(0, 0, 0, 0)

    const differenceInDays = Math.round(
        (cardDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    )

    if (differenceInDays === 1) {
        return "Tomorrow"
    }

    if (differenceInDays <= 7) {
        return `In ${differenceInDays} days`
    }

    return cardDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        weekday: "short",
    })
}

function formatDateGroupSubtitle(dateKey: string): string {
    if (dateKey === "today" || dateKey === "overdue") {
        return ""
    }

    const date = new Date(`${dateKey}T00:00:00`)
    const today = new Date()

    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)

    const differenceInDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (differenceInDays < 1 || differenceInDays > 7) {
        return ""
    }

    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", weekday: "short" })
}

function addCardToFutureBucket(
    futureBuckets: Map<string, TodayCardType[]>,
    dateKey: string,
    todayCard: TodayCardType,
): void {
    const existing = futureBuckets.get(dateKey)

    if (existing) {
        existing.push(todayCard)
    } else {
        futureBuckets.set(dateKey, [todayCard])
    }
}

function collectCardsByDateGroup(board: BoardType): DateGroupType[] {
    const todayString = toDateString(new Date())
    const overdueCards: TodayCardType[] = []
    const todayCards: TodayCardType[] = []
    const futureBuckets = new Map<string, TodayCardType[]>()

    for (let columnIndex = 0; columnIndex < board.columns.length; columnIndex++) {
        const column = board.columns[columnIndex]

        for (let cardIndex = 0; cardIndex < column.cards.length; cardIndex++) {
            const card = column.cards[cardIndex]

            if (!isCardVisibleInTodayFilter(card)) {
                continue
            }

            if (!card.date) {
                continue
            }

            const todayCard: TodayCardType = {
                card,
                cardIndex,
                columnIndex,
                columnTitle: column.title,
            }

            if (card.date.localeCompare(todayString) < 0) {
                overdueCards.push(todayCard)

                continue
            }

            if (card.date === todayString) {
                todayCards.push(todayCard)

                continue
            }

            addCardToFutureBucket(futureBuckets, card.date, todayCard)
        }
    }

    const savedOrder = board.settings.todayOrder
    const groups: DateGroupType[] = []

    if (overdueCards.length > 0) {
        groups.push({
            cards: sortCardsByOrder(overdueCards, savedOrder.overdue ?? []),
            dateKey: "overdue",
            label: "Overdue",
        })
    }

    groups.push({
        cards: sortCardsByOrder(todayCards, savedOrder.today ?? []),
        dateKey: "today",
        label: "Today",
    })

    const sortedFutureDates = [...futureBuckets.keys()].sort((first, second) => {
        return first.localeCompare(second)
    })

    for (const dateKey of sortedFutureDates) {
        const cards = futureBuckets.get(dateKey)

        if (!cards) {
            continue
        }

        groups.push({
            cards: sortCardsByOrder(cards, savedOrder[dateKey] ?? []),
            dateKey,
            label: formatDateGroupLabel(dateKey),
        })
    }

    return groups
}

type DatePickerOptionsType = {
    board: BoardType
    card: CardType
    cardIndex: number
    columnIndex: number
    onMutation: MutationHandlerType
}

function showDatePicker(options: DatePickerOptionsType): void {
    const { board, card, cardIndex, columnIndex, onMutation } = options
    const selectedDate = card.date ? new Date(`${card.date}T00:00:00`) : new Date()
    let viewYear = selectedDate.getFullYear()
    let viewMonth = selectedDate.getMonth()

    const overlay = document.createElement("div")

    overlay.className = "kanban-date-picker-overlay"

    const modal = document.createElement("div")

    modal.className = "kanban-date-picker-modal"

    const cleanup = () => {
        overlay.remove()
        modal.remove()
    }

    overlay.addEventListener("click", cleanup)

    const onSelect = (dateString: string) => {
        const newColumns = immutableUpdateCard({
            cardIndex,
            columnIndex,
            columns: board.columns,
            update: { date: dateString },
        })

        onMutation({ ...board, columns: newColumns })
        cleanup()
    }

    const renderCalendar = () => {
        modal.empty()

        const header = document.createElement("div")

        header.className = "kanban-date-picker__header"

        const prevButton = document.createElement("span")

        prevButton.className = "kanban-date-picker__nav"
        prevButton.textContent = "\u2039"
        prevButton.addEventListener("click", () => {
            viewMonth--

            if (viewMonth < 0) {
                viewMonth = 11
                viewYear--
            }

            renderCalendar()
        })

        const nextButton = document.createElement("span")

        nextButton.className = "kanban-date-picker__nav"
        nextButton.textContent = "\u203A"
        nextButton.addEventListener("click", () => {
            viewMonth++

            if (viewMonth > 11) {
                viewMonth = 0
                viewYear++
            }

            renderCalendar()
        })

        const monthLabel = document.createElement("span")
        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ]

        monthLabel.className = "kanban-date-picker__month-label"
        monthLabel.textContent = `${monthNames[viewMonth]} ${viewYear}`

        header.append(prevButton, monthLabel, nextButton)
        modal.append(header)

        const grid = document.createElement("div")

        grid.className = "kanban-date-picker__grid"

        const dayLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

        for (const dayLabel of dayLabels) {
            const cell = document.createElement("div")

            cell.className = "kanban-date-picker__day-label"
            cell.textContent = dayLabel
            grid.append(cell)
        }

        const firstDay = new Date(viewYear, viewMonth, 1)
        const lastDay = new Date(viewYear, viewMonth + 1, 0)
        const startDayOfWeek = (firstDay.getDay() + 6) % 7
        const todayString = toDateString(new Date())

        for (let padding = 0; padding < startDayOfWeek; padding++) {
            const empty = document.createElement("div")

            empty.className = "kanban-date-picker__cell kanban-date-picker__cell--empty"
            grid.append(empty)
        }

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const cell = document.createElement("div")
            const cellDate = new Date(viewYear, viewMonth, day)
            const cellDateString = toDateString(cellDate)

            cell.className = "kanban-date-picker__cell"
            cell.textContent = String(day)

            if (cellDateString === todayString) {
                cell.classList.add("kanban-date-picker__cell--today")
            }

            if (card.date && cellDateString === card.date) {
                cell.classList.add("kanban-date-picker__cell--selected")
            }

            cell.addEventListener("click", () => {
                onSelect(cellDateString)
            })

            grid.append(cell)
        }

        modal.append(grid)
    }

    renderCalendar()
    document.body.append(overlay, modal)
}

function startInlineEdit(
    element: HTMLElement,
    currentValue: string,
    onConfirm: (newValue: string) => void,
): void {
    const input = document.createElement("input")

    input.type = "text"
    input.className = "kanban-inline-edit"
    input.value = currentValue

    const originalChildren: Node[] = []

    while (element.firstChild) {
        const child = element.firstChild

        child.remove()
        originalChildren.push(child)
    }

    element.append(input)
    input.focus()
    input.select()

    const restoreOriginal = () => {
        input.remove()

        for (const child of originalChildren) {
            element.append(child)
        }
    }

    const commit = () => {
        const newValue = input.value.trim()

        if (newValue && newValue !== currentValue) {
            onConfirm(newValue)
        } else {
            restoreOriginal()
        }
    }

    input.addEventListener("blur", commit)
    input.addEventListener("keydown", (keyboardEvent) => {
        if (keyboardEvent.key === "Enter") {
            keyboardEvent.preventDefault()
            input.blur()
        }

        if (keyboardEvent.key === "Escape") {
            input.removeEventListener("blur", commit)
            restoreOriginal()
        }
    })
}

function showQuickAddDatePicker(onSelect: (dateString: string) => void): void {
    const now = new Date()
    let viewYear = now.getFullYear()
    let viewMonth = now.getMonth()

    const overlay = document.createElement("div")

    overlay.className = "kanban-date-picker-overlay"

    const modal = document.createElement("div")

    modal.className = "kanban-date-picker-modal"

    const cleanup = () => {
        overlay.remove()
        modal.remove()
    }

    overlay.addEventListener("click", cleanup)

    const renderCalendar = () => {
        modal.empty()

        const header = document.createElement("div")

        header.className = "kanban-date-picker__header"

        const prevButton = document.createElement("span")

        prevButton.className = "kanban-date-picker__nav"
        prevButton.textContent = "\u2039"
        prevButton.addEventListener("click", () => {
            viewMonth--

            if (viewMonth < 0) {
                viewMonth = 11
                viewYear--
            }

            renderCalendar()
        })

        const nextButton = document.createElement("span")

        nextButton.className = "kanban-date-picker__nav"
        nextButton.textContent = "\u203A"
        nextButton.addEventListener("click", () => {
            viewMonth++

            if (viewMonth > 11) {
                viewMonth = 0
                viewYear++
            }

            renderCalendar()
        })

        const monthLabel = document.createElement("span")
        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ]

        monthLabel.className = "kanban-date-picker__month-label"
        monthLabel.textContent = `${monthNames[viewMonth]} ${viewYear}`

        header.append(prevButton, monthLabel, nextButton)
        modal.append(header)

        const grid = document.createElement("div")

        grid.className = "kanban-date-picker__grid"

        const dayLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

        for (const dayLabel of dayLabels) {
            const cell = document.createElement("div")

            cell.className = "kanban-date-picker__day-label"
            cell.textContent = dayLabel
            grid.append(cell)
        }

        const firstDay = new Date(viewYear, viewMonth, 1)
        const lastDay = new Date(viewYear, viewMonth + 1, 0)
        const startDayOfWeek = (firstDay.getDay() + 6) % 7
        const todayString = toDateString(new Date())

        for (let padding = 0; padding < startDayOfWeek; padding++) {
            const empty = document.createElement("div")

            empty.className = "kanban-date-picker__cell kanban-date-picker__cell--empty"
            grid.append(empty)
        }

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const cell = document.createElement("div")
            const cellDate = new Date(viewYear, viewMonth, day)
            const cellDateString = toDateString(cellDate)

            cell.className = "kanban-date-picker__cell"
            cell.textContent = String(day)

            if (cellDateString === todayString) {
                cell.classList.add("kanban-date-picker__cell--today")
            }

            cell.addEventListener("click", () => {
                onSelect(cellDateString)
                cleanup()
            })

            grid.append(cell)
        }

        modal.append(grid)
    }

    renderCalendar()
    document.body.append(overlay, modal)
}

type EditContextType = {
    card: CardType
    cardIndex: number
    columnIndex: number
}

type QuickAddDialogOptionsType = {
    board: BoardType
    editContext?: EditContextType
    onMutation: MutationHandlerType
    prefillDate?: string | null
}

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
                const updatedCard = newColumns[editContext.columnIndex].cards[editContext.cardIndex]

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

type PriorityMenuOptionsType = {
    board: BoardType
    card: CardType
    cardIndex: number
    columnIndex: number
    event: MouseEvent
    onMutation: MutationHandlerType
}

function showPriorityMenu(options: PriorityMenuOptionsType): void {
    const { board, cardIndex, columnIndex, event, onMutation } = options
    const menu = new Menu()

    menu.addItem((item) => {
        return item
            .setIcon("circle")
            .setTitle("None")
            .onClick(() => {
                const newColumns = immutableUpdateCard({
                    cardIndex,
                    columnIndex,
                    columns: board.columns,
                    update: { priority: null },
                })
                onMutation({ ...board, columns: newColumns })
            })
    })

    menu.addItem((item) => {
        return item
            .setIcon("alert-circle")
            .setTitle("Important")
            .onClick(() => {
                const newColumns = immutableUpdateCard({
                    cardIndex,
                    columnIndex,
                    columns: board.columns,
                    update: { priority: "important" },
                })
                onMutation({ ...board, columns: newColumns })
            })
    })

    menu.showAtMouseEvent(event)
}

type CardContextMenuOptionsType = {
    board: BoardType
    card: CardType
    cardIndex: number
    columnIndex: number
    event: MouseEvent
    onMutation: MutationHandlerType
    pluginSettings: PluginSettingsType
    vault: Vault
}

function showCardContextMenu(options: CardContextMenuOptionsType): void {
    const { board, card, cardIndex, columnIndex, event, onMutation, pluginSettings, vault } =
        options
    const menu = new Menu()

    const todayString = toDateString(new Date())

    if (card.date === todayString) {
        menu.addItem((item) => {
            return item
                .setIcon("sun-dim")
                .setTitle("Remove from today")
                .onClick(() => {
                    const newColumns = immutableUpdateCard({
                        cardIndex,
                        columnIndex,
                        columns: board.columns,
                        update: { date: null },
                    })
                    onMutation({ ...board, columns: newColumns })
                })
        })
    } else {
        menu.addItem((item) => {
            return item
                .setIcon("sun")
                .setTitle("Add to today")
                .onClick(() => {
                    const newColumns = immutableUpdateCard({
                        cardIndex,
                        columnIndex,
                        columns: board.columns,
                        update: { date: todayString },
                    })
                    onMutation({ ...board, columns: newColumns })
                })
        })
    }

    menu.addItem((item) => {
        return item
            .setIcon("pencil")
            .setTitle("Edit")
            .onClick(() => {
                openQuickAddDialog({
                    board,
                    editContext: { card, cardIndex, columnIndex },
                    onMutation,
                })
            })
    })

    menu.addSeparator()

    menu.addItem((item) => {
        return item
            .setIcon("circle")
            .setTitle("Priority: None")
            .onClick(() => {
                const newColumns = immutableUpdateCard({
                    cardIndex,
                    columnIndex,
                    columns: board.columns,
                    update: { priority: null },
                })
                onMutation({ ...board, columns: newColumns })
            })
    })
    menu.addItem((item) => {
        return item
            .setIcon("alert-circle")
            .setTitle("Priority: Important")
            .onClick(() => {
                const newColumns = immutableUpdateCard({
                    cardIndex,
                    columnIndex,
                    columns: board.columns,
                    update: { priority: "important" },
                })
                onMutation({ ...board, columns: newColumns })
            })
    })

    menu.addSeparator()

    const todayDate = new Date()
    const tomorrowDate = new Date()

    tomorrowDate.setDate(tomorrowDate.getDate() + 1)

    menu.addItem((item) => {
        return item
            .setIcon("calendar")
            .setTitle("Date: Today")
            .onClick(() => {
                const newColumns = immutableUpdateCard({
                    cardIndex,
                    columnIndex,
                    columns: board.columns,
                    update: { date: toDateString(todayDate) },
                })
                onMutation({ ...board, columns: newColumns })
            })
    })
    menu.addItem((item) => {
        return item
            .setIcon("calendar-plus")
            .setTitle("Date: Tomorrow")
            .onClick(() => {
                const newColumns = immutableUpdateCard({
                    cardIndex,
                    columnIndex,
                    columns: board.columns,
                    update: { date: toDateString(tomorrowDate) },
                })
                onMutation({ ...board, columns: newColumns })
            })
    })
    menu.addItem((item) => {
        return item
            .setIcon("calendar-range")
            .setTitle("Date: Next Monday")
            .onClick(() => {
                const newColumns = immutableUpdateCard({
                    cardIndex,
                    columnIndex,
                    columns: board.columns,
                    update: { date: toDateString(getNextMonday()) },
                })
                onMutation({ ...board, columns: newColumns })
            })
    })
    menu.addItem((item) => {
        return item
            .setIcon("calendar-search")
            .setTitle("Date: Pick...")
            .onClick(() => {
                showDatePicker({ board, card, cardIndex, columnIndex, onMutation })
            })
    })

    if (card.date) {
        menu.addItem((item) => {
            return item
                .setIcon("calendar-x")
                .setTitle("Date: Remove")
                .onClick(() => {
                    const newColumns = immutableUpdateCard({
                        cardIndex,
                        columnIndex,
                        columns: board.columns,
                        update: { date: null },
                    })
                    onMutation({ ...board, columns: newColumns })
                })
        })
    }

    menu.addSeparator()

    if (!card.linkedNote) {
        menu.addItem((item) => {
            return item
                .setIcon("file-plus")
                .setTitle("Create linked note")
                .onClick(async () => {
                    const columnTitle = board.columns[columnIndex].title
                    const cardTitle = card.title
                    const notePath = `${pluginSettings.notePathPrefix}/${columnTitle}/Tasks/${cardTitle}.md`

                    const folderPath = notePath.slice(0, Math.max(0, notePath.lastIndexOf("/")))

                    try {
                        if (!vault.getAbstractFileByPath(folderPath)) {
                            await vault.createFolder(folderPath)
                        }

                        await vault.create(notePath, `# ${cardTitle}\n`)

                        const newColumns = immutableUpdateCard({
                            cardIndex,
                            columnIndex,
                            columns: board.columns,
                            update: {
                                linkedNote: `${pluginSettings.notePathPrefix}/${columnTitle}/Tasks/${cardTitle}`,
                                title: "",
                            },
                        })
                        onMutation({ ...board, columns: newColumns })

                        new Notice(`Created note: ${notePath}`)
                    } catch (error) {
                        new Notice(`Failed to create note: ${error}`)
                    }
                })
        })
    } else {
        menu.addItem((item) => {
            return item
                .setIcon("file-x")
                .setTitle("Delete linked note")
                .setWarning(true)
                .onClick(async () => {
                    const notePath = `${card.linkedNote}.md`
                    const file = vault.getAbstractFileByPath(notePath)

                    if (file && file instanceof TFile) {
                        try {
                            await vault.trash(file, true)

                            const linkedNote = card.linkedNote
                            const noteName = linkedNote
                                ? (linkedNote.split("/").pop() ?? linkedNote)
                                : ""
                            const newColumns = immutableUpdateCard({
                                cardIndex,
                                columnIndex,
                                columns: board.columns,
                                update: {
                                    linkedNote: null,
                                    title: noteName,
                                },
                            })
                            onMutation({ ...board, columns: newColumns })

                            new Notice(`Deleted note: ${notePath}`)
                        } catch (error) {
                            new Notice(`Failed to delete note: ${error}`)
                        }
                    } else {
                        new Notice(`Note not found: ${notePath}`)
                    }
                })
        })
    }

    menu.addSeparator()

    menu.addItem((item) => {
        return item
            .setIcon("trash-2")
            .setTitle("Delete card")
            .setWarning(true)
            .onClick(() => {
                const newColumns = immutableSpliceCard({
                    cardIndex,
                    columnIndex,
                    columns: board.columns,
                    deleteCount: 1,
                })
                onMutation({ ...board, columns: newColumns })
            })
    })

    menu.showAtMouseEvent(event)
}

type CardElementOptionsType = {
    board: BoardType
    card: CardType
    cardIndex: number
    columnIndex: number
    onMutation: MutationHandlerType
    pluginSettings: PluginSettingsType
    projectPill: { color: string; title: string } | null
    vault: Vault
}

function createCardElement(options: CardElementOptionsType): HTMLElement {
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

function createAddCardForm(
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

type ColumnElementOptionsType = {
    board: BoardType
    column: ColumnType
    columnIndex: number
    onMutation: MutationHandlerType
    pluginSettings: PluginSettingsType
    vault: Vault
    viewState: ViewStateType
}

function createColumnElement(options: ColumnElementOptionsType): HTMLElement {
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

function setButtonContent(button: HTMLElement, iconName: string, label: string): void {
    button.empty()

    const iconSpan = button.createSpan({ cls: "kanban-toolbar__button-icon" })

    setIcon(iconSpan, iconName)

    button.createSpan({ text: label })
}

function createAddColumnButton(board: BoardType, onMutation: MutationHandlerType): HTMLElement {
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

function createCardSortableOptions(
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

function createColumnCardMoveHandler(
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

function getDateForSection(dateKey: string): string | null {
    if (dateKey === "today") {
        return toDateString(new Date())
    }

    if (dateKey === "overdue") {
        return null
    }

    return dateKey
}

function collectTodayOrderFromSections(
    sectionCardLists: { dateKey: string; element: HTMLElement }[],
): Record<string, string[]> {
    const newTodayOrder: Record<string, string[]> = {}

    for (const listItem of sectionCardLists) {
        const cardElements = listItem.element.querySelectorAll<HTMLElement>(".kanban-card")
        const orderIds: string[] = []

        for (const element of Array.from(cardElements)) {
            const elementCardId = element.dataset.cardId

            if (elementCardId) {
                orderIds.push(elementCardId)
            }
        }

        if (orderIds.length > 0) {
            newTodayOrder[listItem.dateKey] = orderIds
        }
    }

    return newTodayOrder
}

type TodayViewOptionsType = {
    board: BoardType
    container: HTMLElement
    onMutation: MutationHandlerType
    pluginSettings: PluginSettingsType
    vault: Vault
    viewState: ViewStateType
}

function renderTodayView(options: TodayViewOptionsType): Sortable[] {
    const { board, container, onMutation, pluginSettings, vault, viewState } = options
    const dateGroups = collectCardsByDateGroup(board)
    const todayPanel = document.createElement("div")

    todayPanel.className = "kanban-today"

    const sortableInstances: Sortable[] = []
    const sectionCardLists: { dateKey: string; element: HTMLElement }[] = []

    for (const group of dateGroups) {
        const section = document.createElement("div")

        section.className = "kanban-today__section"

        if (group.dateKey === "overdue") {
            section.classList.add("kanban-today__section--overdue")
        }

        const header = document.createElement("div")

        header.className = "kanban-today__header"

        const title = document.createElement("div")

        title.className = "kanban-today__title"

        if (group.dateKey === "overdue") {
            title.classList.add("kanban-today__title--overdue")
        }

        title.textContent = group.label

        const count = document.createElement("span")

        count.className = "kanban-today__count"
        count.textContent = String(group.cards.length)

        header.append(title, count)

        const subtitle = formatDateGroupSubtitle(group.dateKey)

        if (subtitle) {
            const subtitleSpan = document.createElement("span")

            subtitleSpan.className = "kanban-today__title-date"
            subtitleSpan.textContent = subtitle
            header.append(subtitleSpan)
        }

        if (group.dateKey !== "overdue") {
            const addButton = document.createElement("span")

            addButton.className = "kanban-today__add-button"
            addButton.textContent = "+"
            addButton.addEventListener("click", () => {
                openQuickAddDialog({
                    board,
                    onMutation,
                    prefillDate: getDateForSection(group.dateKey),
                })
            })
            header.append(addButton)
        }

        section.append(header)

        const cardListElement = document.createElement("div")

        cardListElement.className = "kanban-today__cards"
        cardListElement.dataset.dateKey = group.dateKey

        for (const todayCard of group.cards) {
            const pill = {
                color: getColumnColor(todayCard.columnTitle, todayCard.columnIndex, board),
                title: todayCard.columnTitle,
            }

            const cardElement = createCardElement({
                board,
                card: todayCard.card,
                cardIndex: todayCard.cardIndex,
                columnIndex: todayCard.columnIndex,
                onMutation,
                pluginSettings,
                projectPill: pill,
                vault,
            })

            cardListElement.append(cardElement)
        }

        if (group.cards.length === 0) {
            const emptyMessage = document.createElement("div")

            emptyMessage.className = "kanban-today__empty"
            emptyMessage.textContent = "No tasks for today"
            cardListElement.append(emptyMessage)
        }

        section.append(cardListElement)
        todayPanel.append(section)
        sectionCardLists.push({ dateKey: group.dateKey, element: cardListElement })
    }

    const layout = document.createElement("div")

    layout.className = "kanban-today-layout"
    layout.append(todayPanel)

    const columnsPanel = document.createElement("div")

    columnsPanel.className = "kanban-today-layout__columns"

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

        columnsPanel.append(columnElement)
    }

    layout.append(columnsPanel)
    container.append(layout)

    for (const { element: cardListElement } of sectionCardLists) {
        const sectionSortable = Sortable.create(
            cardListElement,
            createCardSortableOptions((sortableEvent: SortableEvent) => {
                const targetDateKey = sortableEvent.to.dataset.dateKey
                const sourceDateKey = sortableEvent.from.dataset.dateKey
                const cardId = sortableEvent.item.dataset.cardId
                const movedCardIndex = Number(sortableEvent.item.dataset.cardIndex)
                const movedColumnIndex = Number(sortableEvent.item.dataset.columnIndex)

                if (cardId && targetDateKey && sourceDateKey !== targetDateKey) {
                    const targetDate = getDateForSection(targetDateKey)

                    if (targetDate) {
                        const newColumns = immutableUpdateCard({
                            cardIndex: movedCardIndex,
                            columnIndex: movedColumnIndex,
                            columns: board.columns,
                            update: { date: targetDate },
                        })

                        const newTodayOrder = collectTodayOrderFromSections(sectionCardLists)

                        onMutation({
                            ...board,
                            columns: newColumns,
                            settings: { ...board.settings, todayOrder: newTodayOrder },
                        })

                        return
                    }
                }

                const newTodayOrder = collectTodayOrderFromSections(sectionCardLists)

                onMutation({
                    ...board,
                    settings: { ...board.settings, todayOrder: newTodayOrder },
                })
            }, "kanban-today-cards"),
        )

        sortableInstances.push(sectionSortable)
    }

    const cardLists = columnsPanel.querySelectorAll<HTMLElement>(".kanban-column__cards")

    for (const cardList of Array.from(cardLists)) {
        const instance = Sortable.create(
            cardList,
            createCardSortableOptions(createColumnCardMoveHandler(board, onMutation)),
        )

        sortableInstances.push(instance)
    }

    return sortableInstances
}

type BoardColumnsOptionsType = {
    board: BoardType
    container: HTMLElement
    onMutation: MutationHandlerType
    pluginSettings: PluginSettingsType
    vault: Vault
    viewState: ViewStateType
}

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

type ToolbarOptionsType = {
    app: App
    board: BoardType
    onMutation: MutationHandlerType
    onViewStateChange: (viewState: ViewStateType) => void
    viewState: ViewStateType
}

function createToolbar(options: ToolbarOptionsType): HTMLElement {
    const { app, board, onMutation, onViewStateChange, viewState } = options
    const toolbar = document.createElement("div")

    toolbar.className = "kanban-toolbar"

    const addTaskButton = document.createElement("button")

    addTaskButton.className = "kanban-toolbar__button"
    setButtonContent(addTaskButton, "plus", "Add task")
    addTaskButton.addEventListener("click", () => {
        openQuickAddDialog({ board, onMutation })
    })

    const todayButton = document.createElement("button")

    todayButton.className = "kanban-toolbar__button"

    if (viewState.todayFilterActive) {
        todayButton.classList.add("kanban-toolbar__button--active")
    }

    setButtonContent(todayButton, viewState.todayFilterActive ? "calendar-check" : "sun", "Today")
    todayButton.addEventListener("click", () => {
        onViewStateChange({ ...viewState, todayFilterActive: !viewState.todayFilterActive })
    })

    const hideCompletedButton = document.createElement("button")

    hideCompletedButton.className = "kanban-toolbar__button"

    if (viewState.hideCompletedActive) {
        hideCompletedButton.classList.add("kanban-toolbar__button--active")
    }

    setButtonContent(
        hideCompletedButton,
        viewState.hideCompletedActive ? "eye-off" : "eye",
        "Hide completed",
    )
    hideCompletedButton.addEventListener("click", () => {
        onViewStateChange({ ...viewState, hideCompletedActive: !viewState.hideCompletedActive })
    })

    const toolbarSpacer = document.createElement("div")

    toolbarSpacer.className = "kanban-toolbar__spacer"

    const updateButton = document.createElement("button")

    updateButton.className = "kanban-toolbar__button kanban-toolbar__button--update"
    setButtonContent(updateButton, "download", "Update")
    updateButton.addEventListener("click", async () => {
        setButtonContent(updateButton, "loader-2", "Updating...")
        updateButton.disabled = true

        try {
            await selfUpdate(app)
        } catch (error) {
            new Notice(`Update failed: ${error}`)
        }

        setButtonContent(updateButton, "download", "Update")
        updateButton.disabled = false
    })

    toolbar.append(addTaskButton, todayButton, hideCompletedButton, toolbarSpacer, updateButton)

    return toolbar
}

type RenderBoardOptionsType = {
    app: App
    board: BoardType
    container: HTMLElement
    onMutation: MutationHandlerType
    onViewStateChange: (viewState: ViewStateType) => void
    pluginSettings: PluginSettingsType
    vault: Vault
    viewState: ViewStateType
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

export {
    collectCardsByDateGroup,
    COLUMN_COLORS,
    formatDateGroupLabel,
    formatDateGroupSubtitle,
    getColumnColor,
    getDateForSection,
    isCardVisibleInTodayFilter,
    renderBoard,
    sortCardsByOrder,
}
