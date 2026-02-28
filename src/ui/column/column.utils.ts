import { COLUMN_COLORS } from "../../core/shared/constants"
import type { BoardType } from "../../core/shared/types"

export function getColumnColor(columnTitle: string, columnIndex: number, board: BoardType): string {
    const customColor = board.settings.columnColors[columnTitle]

    if (customColor) {
        return customColor
    }

    return COLUMN_COLORS[columnIndex % COLUMN_COLORS.length]
}
