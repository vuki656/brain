import type { Vault } from "obsidian"

import type { BoardType, CardType, ViewStateType } from "../../shared"

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
    onMutation: MutationHandlerType
    pluginSettings: { notePathPrefix: string; weatherLatitude: string; weatherLongitude: string }
    vault: Vault
    viewState: ViewStateType
}
