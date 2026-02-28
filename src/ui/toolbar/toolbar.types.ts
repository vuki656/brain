import type { App } from "obsidian"

import type { BoardType, ViewStateType } from "../../core/shared/types"

type MutationHandlerType = (board: BoardType) => void

export type ToolbarOptionsType = {
    app: App
    board: BoardType
    onMutation: MutationHandlerType
    onViewStateChange: (viewState: ViewStateType) => void
    viewState: ViewStateType
}
