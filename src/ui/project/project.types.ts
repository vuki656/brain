import type { Vault } from "obsidian"

import type { BoardType, ProjectType, ViewStateType } from "../../shared"

type MutationHandlerType = (board: BoardType) => void

export type ProjectElementOptionsType = {
    board: BoardType
    onMutation: MutationHandlerType
    pluginSettings: { notePathPrefix: string }
    project: ProjectType
    projectIndex: number
    vault: Vault
    viewState: ViewStateType
}
