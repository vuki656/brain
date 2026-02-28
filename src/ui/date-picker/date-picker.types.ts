import type { BoardType, CardType } from "../../core/shared/types"

type MutationHandlerType = (board: BoardType) => void

export type DatePickerOptionsType = {
    board: BoardType
    card: CardType
    cardIndex: number
    columnIndex: number
    onMutation: MutationHandlerType
}
