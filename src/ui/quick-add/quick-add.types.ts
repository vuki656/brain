import type { BoardType, CardType } from "../../shared"

type MutationHandlerType = (board: BoardType) => void

type EditContextType = {
    card: CardType
    cardIndex: number
    columnIndex: number
}

export type QuickAddDialogOptionsType = {
    board: BoardType
    editContext?: EditContextType
    onMutation: MutationHandlerType
    prefillDate?: string | null
}
