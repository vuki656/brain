import { Notice, setIcon, type Vault } from "obsidian"

import type { BoardType, PluginSettingsType } from "../../shared"
import { getProjectColor, getProjectIcon } from "../project"
import { createTicket } from "./ticket"

type AddTicketDialogOptionsType = {
    board: BoardType
    onCreated: () => void
    pluginSettings: PluginSettingsType
    preselectedProjectIndex?: number
    vault: Vault
}

export function openAddTicketDialog(options: AddTicketDialogOptionsType): void {
    const { board, onCreated, pluginSettings, preselectedProjectIndex, vault } = options

    let selectedProjectIndex: number | null = preselectedProjectIndex ?? null

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

    const heading = document.createElement("div")

    heading.className = "kanban-quick-add__heading"
    heading.textContent = "New ticket"
    dialog.append(heading)

    const nameInput = document.createElement("input")

    nameInput.className = "kanban-quick-add__input"
    nameInput.type = "text"
    nameInput.placeholder = "Ticket name (e.g. ABC-123 Short summary)..."
    dialog.append(nameInput)

    const linkInput = document.createElement("input")

    linkInput.className = "kanban-quick-add__input"
    linkInput.type = "text"
    linkInput.placeholder = "Link (optional)..."
    dialog.append(linkInput)

    const projectRow = document.createElement("div")

    projectRow.className = "kanban-quick-add__row"

    const projectLabel = document.createElement("span")

    projectLabel.className = "kanban-quick-add__label"
    projectLabel.textContent = "Project"
    projectRow.append(projectLabel)

    const projectChips = document.createElement("div")

    projectChips.className = "kanban-quick-add__dates"

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

        // eslint-disable-next-line @typescript-eslint/no-loop-func -- intentional shared mutable state for chip toggle
        chip.addEventListener("click", () => {
            selectedProjectIndex =
                selectedProjectIndex === capturedProjectIndex ? null : capturedProjectIndex

            for (const otherChip of Array.from(
                projectChips.querySelectorAll(".kanban-quick-add__date-button"),
            )) {
                const value = (otherChip as HTMLElement).dataset.projectValue
                const isActive = value !== undefined && Number(value) === selectedProjectIndex

                otherChip.classList.toggle("kanban-quick-add__date-button--active", isActive)
            }
        })

        projectChips.append(chip)
    }

    projectRow.append(projectChips)
    dialog.append(projectRow)

    const submitButton = document.createElement("span")

    submitButton.className = "kanban-quick-add__submit"
    submitButton.textContent = "Create ticket"

    const submit = async () => {
        const name = nameInput.value.trim()

        if (!name) {
            nameInput.focus()

            return
        }

        if (selectedProjectIndex === null) {
            new Notice("Pick a project first.")

            return
        }

        const project = board.projects[selectedProjectIndex]

        if (!project) {
            return
        }

        const link = linkInput.value.trim() || null

        try {
            await createTicket({
                link,
                name,
                notePathPrefix: pluginSettings.notePathPrefix,
                projectTitle: project.title,
                vault,
            })
            cleanup()
            onCreated()
        } catch (error) {
            new Notice(`Failed to create ticket: ${String(error)}`)
        }
    }

    submitButton.addEventListener("click", () => {
        void submit()
    })
    dialog.append(submitButton)

    nameInput.addEventListener("keydown", (keyboardEvent) => {
        if (keyboardEvent.key === "Enter") {
            keyboardEvent.preventDefault()
            void submit()
        }

        if (keyboardEvent.key === "Escape") {
            cleanup()
        }
    })

    linkInput.addEventListener("keydown", (keyboardEvent) => {
        if (keyboardEvent.key === "Enter") {
            keyboardEvent.preventDefault()
            void submit()
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
    nameInput.focus()
}
