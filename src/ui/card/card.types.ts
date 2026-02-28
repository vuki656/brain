import type { Vault } from "obsidian"

import type { BoardType, CardType } from "../../shared"

type MutationHandlerType = (board: BoardType) => void

export type CardElementOptionsType = {
    board: BoardType
    card: CardType
    cardIndex: number
    onMutation: MutationHandlerType
    pluginSettings: { notePathPrefix: string }
    projectIndex: number
    projectPill: { color: string; icon: string | null; title: string } | null
    vault: Vault
}
