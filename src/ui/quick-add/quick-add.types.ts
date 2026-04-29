import type { Vault } from "obsidian"

import type { BoardType, CardType, PluginSettingsType } from "../../shared"

type MutationHandlerType = (board: BoardType) => void

type EditContextType = {
    card: CardType
    cardIndex: number
    projectIndex: number
}

export type QuickAddDialogOptionsType = {
    board: BoardType
    editContext?: EditContextType
    onMutation: MutationHandlerType
    pluginSettings?: PluginSettingsType
    prefillDate?: string | null
    prefillProjectIndex?: number | null
    prefillTicket?: string | null
    vault?: Vault
}
