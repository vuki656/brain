import type { Vault } from "obsidian"

import type { BoardType, PluginSettingsType, ProjectType, ViewStateType } from "../../shared"

type MutationHandlerType = (board: BoardType) => void

export type ProjectElementOptionsType = {
    board: BoardType
    onMutation: MutationHandlerType
    pluginSettings: PluginSettingsType
    project: ProjectType
    projectIndex: number
    vault: Vault
    viewState: ViewStateType
}
