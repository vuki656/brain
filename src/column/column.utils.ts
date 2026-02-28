import { COLUMN_COLORS } from "../shared/constants"
import type { BoardType } from "../shared/types"

export function getColumnColor(columnTitle: string, columnIndex: number, board: BoardType): string {
    const customColor = board.settings.columnColors[columnTitle]

    if (customColor) {
        return customColor
    }

    return COLUMN_COLORS[columnIndex % COLUMN_COLORS.length]
}
