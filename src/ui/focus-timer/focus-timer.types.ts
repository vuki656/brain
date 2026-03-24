import type { BoardType, FocusTimerSettingsType } from "../../shared"

export type FocusTimerOptionsType = {
    board: BoardType
    container: HTMLElement
    focusTimerState: FocusTimerSettingsType
    onFocusTimerStateChange: (state: FocusTimerSettingsType) => void
}

export type FocusTimerDialogOptionsType = {
    board: BoardType
    onStart: (projectTitle: string, durationMs: number) => void
}
