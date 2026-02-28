import type { Vault } from "obsidian"

import type { BoardType, CardType } from "../../shared"

type MutationHandlerType = (board: BoardType) => void

export type CardElementOptionsType = {
    board: BoardType
    card: CardType
    cardIndex: number
    columnIndex: number
    onMutation: MutationHandlerType
    pluginSettings: { notePathPrefix: string }
    projectPill: { color: string; title: string } | null
    vault: Vault
}
