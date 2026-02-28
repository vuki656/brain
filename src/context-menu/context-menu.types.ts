import type { Vault } from "obsidian"

import type { BoardType, CardType } from "../shared/types"

type MutationHandlerType = (board: BoardType) => void

export type PriorityMenuOptionsType = {
    board: BoardType
    card: CardType
    cardIndex: number
    columnIndex: number
    event: MouseEvent
    onMutation: MutationHandlerType
}

export type CardContextMenuOptionsType = {
    board: BoardType
    card: CardType
    cardIndex: number
    columnIndex: number
    event: MouseEvent
    onMutation: MutationHandlerType
    pluginSettings: { notePathPrefix: string }
    vault: Vault
}
