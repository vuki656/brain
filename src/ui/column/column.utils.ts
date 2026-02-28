import type { BoardType } from "../../shared"
import { COLUMN_COLORS } from "../../shared"

export function getColumnColor(columnTitle: string, columnIndex: number, board: BoardType): string {
    const customColor = board.settings.columnColors[columnTitle]

    if (customColor) {
        return customColor
    }

    return COLUMN_COLORS[columnIndex % COLUMN_COLORS.length] ?? "var(--color-blue)"
}
