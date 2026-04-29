import type { App } from "obsidian"

import type { BoardType, PluginSettingsType, ViewStateType } from "../../shared"

type MutationHandlerType = (board: BoardType) => void

export type ToolbarOptionsType = {
    app: App
    board: BoardType
    onMutation: MutationHandlerType
    onViewStateChange: (viewState: ViewStateType) => void
    pluginSettings: PluginSettingsType
    viewState: ViewStateType
}
