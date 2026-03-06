export type PriorityType = "important" | null

export type CardType = {
    blockedReason: string | null
    completed: boolean
    date: string | null
    description: string | null
    id: string
    linkedNote: string | null
    priority: PriorityType
    title: string
}

export type ProjectType = {
    cards: CardType[]
    title: string
}

export type KanbanSettingsType = {
    archivedProjects: string[]
    collapsedProjects: string[]
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
