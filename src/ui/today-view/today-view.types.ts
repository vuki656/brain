import type { Vault } from "obsidian"

import type { BoardType, CardType, PluginSettingsType, ViewStateType } from "../../shared"

type MutationHandlerType = (board: BoardType) => void

export type TodayCardType = {
    card: CardType
    cardIndex: number
    projectIndex: number
    projectTitle: string
}

export type DateGroupType = {
    cards: TodayCardType[]
    dateKey: string
    label: string
}

export type CollectedDateGroupsType = {
    cleanedTodayOrder: Record<string, string[]>
    groups: DateGroupType[]
}

export type TodayViewOptionsType = {
    board: BoardType
    container: HTMLElement
    onBoardCleanup: MutationHandlerType
    onMutation: MutationHandlerType
    onPluginSettingsChange: (settings: PluginSettingsType) => void
    pluginSettings: PluginSettingsType
    vault: Vault
    viewState: ViewStateType
}
