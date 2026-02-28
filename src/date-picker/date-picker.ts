import { immutableUpdateCard } from "../card/card-mutations"
import { toDateString } from "../shared/date.utils"

import type { DatePickerOptionsType } from "./date-picker.types"

const MONTH_NAMES = [
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

const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

type RenderCalendarOptionsType = {
    currentSelectedDate: string | null
    modal: HTMLElement
    onSelect: (dateString: string) => void
    viewMonth: number
    viewYear: number
}

function renderCalendar(options: RenderCalendarOptionsType): void {
    const { currentSelectedDate, modal, onSelect, viewMonth, viewYear } = options

    modal.empty()

    const header = document.createElement("div")

    header.className = "kanban-date-picker__header"

    const prevButton = document.createElement("span")

    prevButton.className = "kanban-date-picker__nav"
    prevButton.textContent = "\u2039"

    const nextButton = document.createElement("span")

    nextButton.className = "kanban-date-picker__nav"
    nextButton.textContent = "\u203A"

    const monthLabel = document.createElement("span")

    monthLabel.className = "kanban-date-picker__month-label"
    monthLabel.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`

    header.append(prevButton, monthLabel, nextButton)
    modal.append(header)

    const grid = document.createElement("div")

    grid.className = "kanban-date-picker__grid"

    for (const dayLabel of DAY_LABELS) {
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

        if (currentSelectedDate && cellDateString === currentSelectedDate) {
            cell.classList.add("kanban-date-picker__cell--selected")
        }

        cell.addEventListener("click", () => {
            onSelect(cellDateString)
        })

        grid.append(cell)
    }

    modal.append(grid)

    return { prevButton, nextButton } as unknown as void
}

type CalendarNavigationResultType = {
    nextButton: HTMLElement
    prevButton: HTMLElement
}

function createCalendarWithNavigation(options: {
    currentSelectedDate: string | null
    modal: HTMLElement
    onSelect: (dateString: string) => void
    viewMonth: number
    viewYear: number
}): CalendarNavigationResultType {
    const state = { viewMonth: options.viewMonth, viewYear: options.viewYear }

    const rerender = () => {
        renderCalendar({
            currentSelectedDate: options.currentSelectedDate,
            modal: options.modal,
            onSelect: options.onSelect,
            viewMonth: state.viewMonth,
            viewYear: state.viewYear,
        })

        const prevButton = options.modal.querySelector(
            ".kanban-date-picker__nav:first-child",
        ) as HTMLElement
        const nextButton = options.modal.querySelector(
            ".kanban-date-picker__nav:last-of-type",
        ) as HTMLElement

        prevButton?.addEventListener("click", () => {
            state.viewMonth--

            if (state.viewMonth < 0) {
                state.viewMonth = 11
                state.viewYear--
            }

            rerender()
        })

        nextButton?.addEventListener("click", () => {
            state.viewMonth++

            if (state.viewMonth > 11) {
                state.viewMonth = 0
                state.viewYear++
            }

            rerender()
        })
    }

    rerender()

    return {
        nextButton: options.modal.querySelector(
            ".kanban-date-picker__nav:last-of-type",
        ) as HTMLElement,
        prevButton: options.modal.querySelector(
            ".kanban-date-picker__nav:first-child",
        ) as HTMLElement,
    }
}

export function showDatePicker(options: DatePickerOptionsType): void {
    const { board, card, cardIndex, columnIndex, onMutation } = options
    const selectedDate = card.date ? new Date(`${card.date}T00:00:00`) : new Date()

    const overlay = document.createElement("div")

    overlay.className = "kanban-date-picker-overlay"

    const modal = document.createElement("div")

    modal.className = "kanban-date-picker-modal"

    const cleanup = () => {
        overlay.remove()
        modal.remove()
    }

    overlay.addEventListener("click", cleanup)

    createCalendarWithNavigation({
        currentSelectedDate: card.date,
        modal,
        onSelect: (dateString) => {
            const newColumns = immutableUpdateCard({
                cardIndex,
                columnIndex,
                columns: board.columns,
                update: { date: dateString },
            })

            onMutation({ ...board, columns: newColumns })
            cleanup()
        },
        viewMonth: selectedDate.getMonth(),
        viewYear: selectedDate.getFullYear(),
    })

    document.body.append(overlay, modal)
}

export function showQuickAddDatePicker(onSelect: (dateString: string) => void): void {
    const now = new Date()

    const overlay = document.createElement("div")

    overlay.className = "kanban-date-picker-overlay"

    const modal = document.createElement("div")

    modal.className = "kanban-date-picker-modal"

    const cleanup = () => {
        overlay.remove()
        modal.remove()
    }

    overlay.addEventListener("click", cleanup)

    createCalendarWithNavigation({
        currentSelectedDate: null,
        modal,
        onSelect: (dateString) => {
            onSelect(dateString)
            cleanup()
        },
        viewMonth: now.getMonth(),
        viewYear: now.getFullYear(),
    })

    document.body.append(overlay, modal)
}
