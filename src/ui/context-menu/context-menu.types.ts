import type { Vault } from "obsidian"

import type { BoardType, CardType, PluginSettingsType } from "../../shared"

type MutationHandlerType = (board: BoardType) => void

export type PriorityMenuOptionsType = {
    board: BoardType
    card: CardType
    cardIndex: number
    event: MouseEvent
    onMutation: MutationHandlerType
    projectIndex: number
}

export type CardContextMenuOptionsType = {
    board: BoardType
    card: CardType
    cardIndex: number
    event: MouseEvent
    onMutation: MutationHandlerType
    pluginSettings: PluginSettingsType
    projectIndex: number
    vault: Vault
}
