import type { Vault } from "obsidian"

import type { BoardType, CardType, PluginSettingsType } from "../../shared"

type MutationHandlerType = (board: BoardType) => void

export type CardElementOptionsType = {
    board: BoardType
    card: CardType
    cardIndex: number
    onMutation: MutationHandlerType
    pluginSettings: PluginSettingsType
    projectIndex: number
    projectPill: { color: string; icon: string | null; title: string } | null
    vault: Vault
}
