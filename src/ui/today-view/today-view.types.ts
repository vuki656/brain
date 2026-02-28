import type { Vault } from "obsidian"

import type { BoardType, CardType, ViewStateType } from "../../core/shared/types"

type MutationHandlerType = (board: BoardType) => void

export type TodayCardType = {
    card: CardType
    cardIndex: number
    columnIndex: number
    columnTitle: string
}

export type DateGroupType = {
    cards: TodayCardType[]
    dateKey: string
    label: string
}

export type TodayViewOptionsType = {
    board: BoardType
    container: HTMLElement
    onMutation: MutationHandlerType
    pluginSettings: { notePathPrefix: string }
    vault: Vault
    viewState: ViewStateType
}
