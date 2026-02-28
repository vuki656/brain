import type { BoardType } from "../../shared"
import { PROJECT_COLORS } from "../../shared"

export function getProjectColor(
    projectTitle: string,
    projectIndex: number,
    board: BoardType,
): string {
    const customColor = board.settings.projectColors[projectTitle]

    if (customColor) {
        return customColor
    }

    return PROJECT_COLORS[projectIndex % PROJECT_COLORS.length] ?? "var(--color-blue)"
}

export function getProjectIcon(projectTitle: string, board: BoardType): string | null {
    return board.settings.projectIcons[projectTitle] ?? null
}
