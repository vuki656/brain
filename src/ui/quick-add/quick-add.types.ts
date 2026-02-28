import type { BoardType, CardType } from "../../shared"

type MutationHandlerType = (board: BoardType) => void

type EditContextType = {
    card: CardType
    cardIndex: number
    columnIndex: number
}

type QuickAddDialogOptionsType = {
    board: BoardType
    editContext?: EditContextType
    onMutation: MutationHandlerType
    prefillDate?: string | null
}

export type { EditContextType, MutationHandlerType, QuickAddDialogOptionsType }
