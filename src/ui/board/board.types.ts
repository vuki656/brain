import type { App, Vault } from "obsidian"

import type { BoardType, PluginSettingsType, ViewStateType } from "../../shared"

type MutationHandlerType = (board: BoardType) => void

export type BoardProjectsOptionsType = {
    board: BoardType
    container: HTMLElement
    onMutation: MutationHandlerType
    pluginSettings: PluginSettingsType
    vault: Vault
    viewState: ViewStateType
}

export type RenderBoardOptionsType = {
    app: App
    board: BoardType
    container: HTMLElement
    onBoardCleanup: MutationHandlerType
    onMutation: MutationHandlerType
    onPluginSettingsChange: (settings: PluginSettingsType) => void
    onViewStateChange: (viewState: ViewStateType) => void
    pluginSettings: PluginSettingsType
    vault: Vault
    viewState: ViewStateType
}
