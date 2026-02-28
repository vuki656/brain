import type { BoardType, CardType } from "../shared/types"

type MutationHandlerType = (board: BoardType) => void

export type DatePickerOptionsType = {
    board: BoardType
    card: CardType
    cardIndex: number
    columnIndex: number
    onMutation: MutationHandlerType
}
