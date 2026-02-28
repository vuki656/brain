export type PriorityType = "important" | null

export type CardType = {
    completed: boolean
    date: string | null
    description: string | null
    id: string
    linkedNote: string | null
    priority: PriorityType
    title: string
}

export type ColumnType = {
    cards: CardType[]
    title: string
}

export type KanbanSettingsType = {
    collapsedColumns: string[]
    columnColors: Record<string, string>
    todayOrder: Partial<Record<string, string[]>>
}

export type BoardType = {
    columns: ColumnType[]
    settings: KanbanSettingsType
}

export type ViewStateType = {
    hideCompletedActive: boolean
    todayFilterActive: boolean
}
