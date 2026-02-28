import type { App, Vault } from "obsidian"

import type { BoardType, ViewStateType } from "../shared/types"

type MutationHandlerType = (board: BoardType) => void

export type BoardColumnsOptionsType = {
    board: BoardType
    container: HTMLElement
    onMutation: MutationHandlerType
    pluginSettings: { notePathPrefix: string }
    vault: Vault
    viewState: ViewStateType
}

export type RenderBoardOptionsType = {
    app: App
    board: BoardType
    container: HTMLElement
    onMutation: MutationHandlerType
    onViewStateChange: (viewState: ViewStateType) => void
    pluginSettings: { notePathPrefix: string }
    vault: Vault
    viewState: ViewStateType
}
