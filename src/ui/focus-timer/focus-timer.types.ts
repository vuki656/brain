import type { BoardType, FocusTimerStateType } from "../../shared"

export type FocusTimerOptionsType = {
    board: BoardType
    container: HTMLElement
    focusTimerState: FocusTimerStateType
    onFocusTimerStateChange: (state: FocusTimerStateType) => void
}

export type FocusTimerDialogOptionsType = {
    board: BoardType
    onStart: (projectTitle: string, durationMs: number, cardTitle: string | null) => void
}
