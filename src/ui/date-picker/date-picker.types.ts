import type { BoardType, CardType } from "../../shared"

type MutationHandlerType = (board: BoardType) => void

export type DatePickerOptionsType = {
    board: BoardType
    card: CardType
    cardIndex: number
    onMutation: MutationHandlerType
    projectIndex: number
}
