import type { Vault } from "obsidian"

import type { BoardType, CardType, PluginSettingsType, ViewStateType } from "../../shared"

type MutationHandlerType = (board: BoardType) => void

type ViewStateChangeHandlerType = (newViewState: ViewStateType) => void

type TodayCardType = {
    card: CardType
    cardIndex: number
    projectIndex: number
    projectTitle: string
}

type DateGroupType = {
    cards: TodayCardType[]
    dateKey: string
    label: string
}

type CollectedDateGroupsType = {
    cleanedTodayOrder: Record<string, string[]>
    groups: DateGroupType[]
}

type TodayViewOptionsType = {
    board: BoardType
    container: HTMLElement
    onBoardCleanup: MutationHandlerType
    onMutation: MutationHandlerType
    onViewStateChange: ViewStateChangeHandlerType
    pluginSettings: PluginSettingsType
    vault: Vault
    viewState: ViewStateType
}

export type { CollectedDateGroupsType, DateGroupType, TodayCardType, TodayViewOptionsType }
