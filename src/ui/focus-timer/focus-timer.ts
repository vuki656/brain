import { Notice, setIcon } from "obsidian"

import { getProjectColor, getProjectIcon } from "../project"
import type { FocusTimerDialogOptionsType, FocusTimerOptionsType } from "./focus-timer.types"

const RING_RADIUS = 10
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
const MILLISECONDS_PER_MINUTE = 60_000
const MILLISECONDS_PER_SECOND = 1000

const DURATION_PRESETS = [
    { durationMs: 25 * MILLISECONDS_PER_MINUTE, label: "25m" },
    { durationMs: 45 * MILLISECONDS_PER_MINUTE, label: "45m" },
    { durationMs: 60 * MILLISECONDS_PER_MINUTE, label: "1h" },
    { durationMs: 120 * MILLISECONDS_PER_MINUTE, label: "2h" },
]

const MINUTE_OPTIONS = [0, 15, 30, 45]

let activeIntervalId: ReturnType<typeof setInterval> | null = null

type ActiveTimerOptionsType = {
    cardTitle: string | null
    container: HTMLElement
    endTimestamp: number
    onCancel: () => void
    projectTitle: string
    totalDurationMs: number
}

function formatTimeRemaining(remainingMs: number): string {
    const totalMinutes = Math.ceil(remainingMs / MILLISECONDS_PER_MINUTE)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours > 0) {
        return `${String(hours)}h ${String(minutes)}m`
    }

    return `${String(minutes)}m`
}

function createSvgRing(fraction: number, completed: boolean): SVGSVGElement {
    const namespace = "http://www.w3.org/2000/svg"
    const svg = document.createElementNS(namespace, "svg")

    svg.setAttribute("width", "24")
    svg.setAttribute("height", "24")
    svg.setAttribute("viewBox", "0 0 24 24")
    svg.classList.add("kanban-focus-timer__ring")

    const trackCircle = document.createElementNS(namespace, "circle")

    trackCircle.setAttribute("cx", "12")
    trackCircle.setAttribute("cy", "12")
    trackCircle.setAttribute("r", String(RING_RADIUS))
    trackCircle.setAttribute("fill", "none")
    trackCircle.setAttribute("stroke", "var(--background-modifier-border)")
    trackCircle.setAttribute("stroke-width", "2")
    svg.append(trackCircle)

    const progressCircle = document.createElementNS(namespace, "circle")

    progressCircle.setAttribute("cx", "12")
    progressCircle.setAttribute("cy", "12")
    progressCircle.setAttribute("r", String(RING_RADIUS))
    progressCircle.setAttribute("fill", "none")
    progressCircle.setAttribute("stroke-width", "2")
    progressCircle.setAttribute("stroke-linecap", "round")
    progressCircle.setAttribute("transform", "rotate(-90 12 12)")
    progressCircle.setAttribute("stroke-dasharray", String(CIRCUMFERENCE))

    if (completed) {
        progressCircle.setAttribute("stroke", "var(--color-green)")
        progressCircle.setAttribute("stroke-dashoffset", "0")
    } else {
        progressCircle.setAttribute("stroke", "var(--interactive-accent)")
        progressCircle.setAttribute("stroke-dashoffset", String(CIRCUMFERENCE * (1 - fraction)))
    }

    svg.append(progressCircle)

    return svg
}

function renderActiveTimer(options: ActiveTimerOptionsType): void {
    const { cardTitle, container, endTimestamp, onCancel, projectTitle, totalDurationMs } = options
    const remainingMs = endTimestamp - Date.now()
    const isCompleted = remainingMs <= 0
    const fraction = isCompleted ? 1 : Math.max(0, remainingMs / totalDurationMs)

    const wrapper = document.createElement("div")

    wrapper.className = "kanban-focus-timer"

    if (isCompleted) {
        wrapper.classList.add("kanban-focus-timer--completed")
    } else {
        wrapper.classList.add("kanban-focus-timer--active")
    }

    const ring = createSvgRing(fraction, isCompleted)

    wrapper.append(ring)

    const timeSpan = document.createElement("span")

    timeSpan.className = "kanban-focus-timer__time"
    timeSpan.textContent = isCompleted ? "Done!" : formatTimeRemaining(remainingMs)
    wrapper.append(timeSpan)

    const infoWrapper = document.createElement("div")

    infoWrapper.className = "kanban-focus-timer__info"

    const projectSpan = document.createElement("span")

    projectSpan.className = "kanban-focus-timer__project"
    projectSpan.textContent = projectTitle
    infoWrapper.append(projectSpan)

    if (cardTitle) {
        const cardSpan = document.createElement("span")

        cardSpan.className = "kanban-focus-timer__card-title"
        cardSpan.textContent = cardTitle
        infoWrapper.append(cardSpan)
    }

    wrapper.append(infoWrapper)

    const cancelButton = document.createElement("span")

    cancelButton.className = "kanban-focus-timer__cancel"
    setIcon(cancelButton, "x")
    cancelButton.addEventListener("click", onCancel)
    wrapper.append(cancelButton)

    container.append(wrapper)

    if (isCompleted) {
        new Notice("Focus session complete!")

        return
    }

    activeIntervalId = setInterval(() => {
        const currentRemainingMs = endTimestamp - Date.now()

        if (currentRemainingMs <= 0) {
            if (activeIntervalId !== null) {
                clearInterval(activeIntervalId)
                activeIntervalId = null
            }

            container.empty()
            renderActiveTimer(options)

            return
        }

        timeSpan.textContent = formatTimeRemaining(currentRemainingMs)

        const currentFraction = Math.max(0, currentRemainingMs / totalDurationMs)
        const progressCircle = ring.querySelectorAll("circle")[1]

        if (progressCircle) {
            progressCircle.setAttribute(
                "stroke-dashoffset",
                String(CIRCUMFERENCE * (1 - currentFraction)),
            )
        }
    }, MILLISECONDS_PER_SECOND)
}

function openFocusTimerDialog(options: FocusTimerDialogOptionsType): void {
    const { board, onStart } = options

    let selectedProjectTitle: string | null = null
    let selectedCardTitle: string | null = null
    let selectedDurationMs: number | null = null
    let selectedUntilHour: number | null = null
    let selectedUntilMinute: number | null = null

    const overlay = document.createElement("div")

    overlay.className = "kanban-focus-overlay"

    const cleanup = () => {
        overlay.remove()
    }

    overlay.addEventListener("click", cleanup)

    const dialog = document.createElement("div")

    dialog.className = "kanban-focus-dialog"
    dialog.addEventListener("click", (event) => {
        event.stopPropagation()
    })

    const projectLabel = document.createElement("span")

    projectLabel.className = "kanban-focus__label"
    projectLabel.textContent = "Project"
    dialog.append(projectLabel)

    const projectChips = document.createElement("div")

    projectChips.className = "kanban-focus__chips"

    const submitButton = document.createElement("span")

    submitButton.className = "kanban-focus__submit kanban-focus__submit--disabled"
    submitButton.textContent = "Start focus"

    const updateSubmitState = () => {
        const hasDuration =
            selectedDurationMs !== null ||
            (selectedUntilHour !== null && selectedUntilMinute !== null)
        const hasProject = selectedProjectTitle !== null

        submitButton.classList.toggle(
            "kanban-focus__submit--disabled",
            !(hasDuration && hasProject),
        )
    }

    const taskChips = document.createElement("div")

    taskChips.className = "kanban-focus__chips kanban-focus__chips--tasks"

    const updateTaskChipStates = () => {
        for (const taskChip of Array.from(
            taskChips.querySelectorAll(".kanban-focus__chip--task"),
        )) {
            const chipValue = (taskChip as HTMLElement).dataset.cardTitle ?? null

            taskChip.classList.toggle("kanban-focus__chip--active", chipValue === selectedCardTitle)
        }
    }

    const renderTaskChips = () => {
        taskChips.empty()
        selectedCardTitle = null

        if (selectedProjectTitle === null) {
            const emptyHint = document.createElement("span")

            emptyHint.className = "kanban-focus__hint"
            emptyHint.textContent = "Select a project first"
            taskChips.append(emptyHint)

            return
        }

        const project = board.projects.find((searchProject) => {
            return searchProject.title === selectedProjectTitle
        })

        if (!project) {
            return
        }

        const incompleteCards = project.cards.filter((card) => {
            return !card.completed
        })

        if (incompleteCards.length === 0) {
            const emptyHint = document.createElement("span")

            emptyHint.className = "kanban-focus__hint"
            emptyHint.textContent = "No tasks in this project"
            taskChips.append(emptyHint)

            return
        }

        for (const card of incompleteCards) {
            const chip = document.createElement("span")

            chip.className = "kanban-focus__chip kanban-focus__chip--task"
            chip.dataset.cardTitle = card.title
            chip.textContent = card.title

            const capturedCardTitle = card.title

            // eslint-disable-next-line @typescript-eslint/no-loop-func -- intentional shared mutable state for toggle behavior
            chip.addEventListener("click", () => {
                selectedCardTitle =
                    selectedCardTitle === capturedCardTitle ? null : capturedCardTitle
                updateTaskChipStates()
            })

            taskChips.append(chip)
        }
    }

    const updateProjectChipStates = () => {
        for (const chip of Array.from(projectChips.querySelectorAll(".kanban-focus__chip"))) {
            const chipValue = (chip as HTMLElement).dataset.projectTitle ?? null

            chip.classList.toggle("kanban-focus__chip--active", chipValue === selectedProjectTitle)
        }
    }

    for (const [projectIndex, project] of board.projects.entries()) {
        if (board.settings.archivedProjects.includes(project.title)) {
            continue
        }

        const chip = document.createElement("span")

        chip.className = "kanban-focus__chip"
        chip.dataset.projectTitle = project.title

        const chipIcon = getProjectIcon(project.title, board)

        if (chipIcon) {
            const chipIconSpan = document.createElement("span")

            chipIconSpan.className = "kanban-focus__chip-icon"
            chipIconSpan.style.color = getProjectColor(project.title, projectIndex, board)
            setIcon(chipIconSpan, chipIcon)
            chip.append(chipIconSpan)
        }

        chip.append(document.createTextNode(project.title))

        const capturedTitle = project.title

        // eslint-disable-next-line @typescript-eslint/no-loop-func -- intentional shared mutable state for toggle behavior
        chip.addEventListener("click", () => {
            selectedProjectTitle = selectedProjectTitle === capturedTitle ? null : capturedTitle
            updateProjectChipStates()
            renderTaskChips()
            updateSubmitState()
        })

        projectChips.append(chip)
    }

    dialog.append(projectChips)

    const taskLabel = document.createElement("span")

    taskLabel.className = "kanban-focus__label"
    taskLabel.textContent = "Task"
    dialog.append(taskLabel)

    renderTaskChips()
    dialog.append(taskChips)

    const durationLabel = document.createElement("span")

    durationLabel.className = "kanban-focus__label"
    durationLabel.textContent = "How long"
    dialog.append(durationLabel)

    const durationChips = document.createElement("div")

    durationChips.className = "kanban-focus__chips"

    const hourSelect = document.createElement("select")

    hourSelect.className = "kanban-focus__select"

    const minuteSelect = document.createElement("select")

    minuteSelect.className = "kanban-focus__select"

    const resetUntilSelects = () => {
        hourSelect.value = ""
        minuteSelect.value = ""
    }

    const updateDurationChipStates = () => {
        for (const chip of Array.from(durationChips.querySelectorAll(".kanban-focus__chip"))) {
            const chipValue = Number((chip as HTMLElement).dataset.durationMs)

            chip.classList.toggle("kanban-focus__chip--active", chipValue === selectedDurationMs)
        }
    }

    for (const preset of DURATION_PRESETS) {
        const chip = document.createElement("span")

        chip.className = "kanban-focus__chip"
        chip.dataset.durationMs = String(preset.durationMs)
        chip.textContent = preset.label

        const capturedDuration = preset.durationMs

        // eslint-disable-next-line @typescript-eslint/no-loop-func -- intentional shared mutable state for toggle behavior
        chip.addEventListener("click", () => {
            selectedDurationMs = selectedDurationMs === capturedDuration ? null : capturedDuration
            selectedUntilHour = null
            selectedUntilMinute = null
            updateDurationChipStates()
            resetUntilSelects()
            updateSubmitState()
        })

        durationChips.append(chip)
    }

    dialog.append(durationChips)

    const untilLabel = document.createElement("span")

    untilLabel.className = "kanban-focus__label"
    untilLabel.textContent = "Until"
    dialog.append(untilLabel)

    const untilRow = document.createElement("div")

    untilRow.className = "kanban-focus__until-row"

    const hourPlaceholder = document.createElement("option")

    hourPlaceholder.value = ""
    hourPlaceholder.textContent = "Hour"
    hourPlaceholder.disabled = true
    hourPlaceholder.selected = true
    hourSelect.append(hourPlaceholder)

    for (let hour = 0; hour < 24; hour++) {
        const option = document.createElement("option")

        option.value = String(hour)
        option.textContent = String(hour).padStart(2, "0")
        hourSelect.append(option)
    }

    const separator = document.createElement("span")

    separator.className = "kanban-focus__separator"
    separator.textContent = ":"

    const minutePlaceholder = document.createElement("option")

    minutePlaceholder.value = ""
    minutePlaceholder.textContent = "Min"
    minutePlaceholder.disabled = true
    minutePlaceholder.selected = true
    minuteSelect.append(minutePlaceholder)

    for (const minute of MINUTE_OPTIONS) {
        const option = document.createElement("option")

        option.value = String(minute)
        option.textContent = String(minute).padStart(2, "0")
        minuteSelect.append(option)
    }

    const handleUntilChange = () => {
        const hourValue = hourSelect.value
        const minuteValue = minuteSelect.value

        if (hourValue !== "" && minuteValue !== "") {
            selectedUntilHour = Number(hourValue)
            selectedUntilMinute = Number(minuteValue)
            selectedDurationMs = null
            updateDurationChipStates()
        } else {
            selectedUntilHour = null
            selectedUntilMinute = null
        }

        updateSubmitState()
    }

    hourSelect.addEventListener("change", handleUntilChange)
    minuteSelect.addEventListener("change", handleUntilChange)

    untilRow.append(hourSelect, separator, minuteSelect)
    dialog.append(untilRow)

    submitButton.addEventListener("click", () => {
        if (selectedProjectTitle === null) {
            return
        }

        let durationMs: number

        if (selectedDurationMs !== null) {
            durationMs = selectedDurationMs
        } else if (selectedUntilHour !== null && selectedUntilMinute !== null) {
            const now = new Date()
            const target = new Date()

            target.setHours(selectedUntilHour, selectedUntilMinute, 0, 0)

            if (target.getTime() <= now.getTime()) {
                target.setDate(target.getDate() + 1)
            }

            durationMs = target.getTime() - now.getTime()
        } else {
            return
        }

        onStart(selectedProjectTitle, durationMs, selectedCardTitle)
        cleanup()
    })

    dialog.append(submitButton)

    dialog.addEventListener("keydown", (keyboardEvent) => {
        if (keyboardEvent.key === "Escape") {
            cleanup()
        }
    })

    overlay.append(dialog)
    document.body.append(overlay)
}

export function cleanupFocusTimer(): void {
    if (activeIntervalId !== null) {
        clearInterval(activeIntervalId)
        activeIntervalId = null
    }
}

export function renderFocusTimer(options: FocusTimerOptionsType): void {
    const { board, container, focusTimerState, onFocusTimerStateChange } = options

    cleanupFocusTimer()

    if (focusTimerState !== null) {
        renderActiveTimer({
            cardTitle: focusTimerState.cardTitle,
            container,
            endTimestamp: focusTimerState.endTimestamp,
            onCancel: () => {
                onFocusTimerStateChange(null)
            },
            projectTitle: focusTimerState.projectTitle,
            totalDurationMs: focusTimerState.totalDurationMs,
        })

        return
    }

    const wrapper = document.createElement("div")

    wrapper.className = "kanban-focus-timer"

    const label = document.createElement("span")

    label.className = "kanban-focus-timer__label"
    label.textContent = "Focus"
    wrapper.append(label)

    const addButton = document.createElement("span")

    addButton.className = "kanban-focus-timer__add-button"
    addButton.textContent = "+"
    addButton.addEventListener("click", () => {
        openFocusTimerDialog({
            board,
            onStart: (projectTitle, durationMs, cardTitle) => {
                onFocusTimerStateChange({
                    cardTitle,
                    endTimestamp: Date.now() + durationMs,
                    projectTitle,
                    totalDurationMs: durationMs,
                })
            },
        })
    })

    wrapper.append(addButton)
    container.append(wrapper)
}
