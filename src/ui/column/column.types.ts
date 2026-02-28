import type { Vault } from "obsidian"

import type { BoardType, ColumnType, ViewStateType } from "../../shared"

type MutationHandlerType = (board: BoardType) => void

export type ColumnElementOptionsType = {
    board: BoardType
    column: ColumnType
    columnIndex: number
    onMutation: MutationHandlerType
    pluginSettings: { notePathPrefix: string }
    vault: Vault
    viewState: ViewStateType
}
