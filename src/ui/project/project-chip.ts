import { setIcon } from "obsidian"

import type { BoardType } from "../../shared"
import { getProjectColor, getProjectIcon } from "./project.utils"

type ProjectChipOptionsType = {
    active?: boolean
    board: BoardType
    projectIndex: number
    projectTitle: string
}

export const PROJECT_CHIP_CLASS = "kanban-project-chip"
export const PROJECT_CHIP_ACTIVE_CLASS = "kanban-project-chip--active"

export function createProjectChip(options: ProjectChipOptionsType): HTMLElement {
    const { active, board, projectIndex, projectTitle } = options
    const chip = document.createElement("span")

    chip.className = PROJECT_CHIP_CLASS

    if (active) {
        chip.classList.add(PROJECT_CHIP_ACTIVE_CLASS)
    }

    const icon = getProjectIcon(projectTitle, board)
    const color = getProjectColor(projectTitle, projectIndex, board)

    if (icon) {
        const iconSpan = document.createElement("span")

        iconSpan.className = "kanban-project-chip__icon"
        iconSpan.style.color = color
        setIcon(iconSpan, icon)
        chip.append(iconSpan)
    }

    chip.append(document.createTextNode(projectTitle))

    return chip
}
