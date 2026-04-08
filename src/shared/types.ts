export type PriorityType = "important" | null

export type SubtaskType = {
    completed: boolean
    id: string
    title: string
}

export type CardType = {
    backlog: boolean
    blockedReason: string | null
    completed: boolean
    date: string | null
    description: string | null
    id: string
    linkedNote: string | null
    priority: PriorityType
    subtasks: SubtaskType[]
    title: string
}

export type ProjectType = {
    cards: CardType[]
    title: string
}

export type FocusTimerStateType = {
    cardTitle: string | null
    endTimestamp: number
    notified: boolean
    projectTitle: string
    totalDurationMs: number
} | null

export type KanbanSettingsType = {
    archivedProjects: string[]
    collapsedProjects: string[]
    focusTimer: FocusTimerStateType
    projectColors: Record<string, string>
    projectIcons: Record<string, string>
    todayOrder: Partial<Record<string, string[]>>
}

export type BoardType = {
    projects: ProjectType[]
    settings: KanbanSettingsType
}

export type ViewStateType = {
    hideCompletedActive: boolean
    todayFilterActive: boolean
}
