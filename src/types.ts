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

export type PluginSettingsType = {
    notePathPrefix: string
}

export const DEFAULT_PLUGIN_SETTINGS: PluginSettingsType = {
    notePathPrefix: "Projects",
}

export const KANBAN_VIEW_TYPE = "vuki-kanban-view"
export const FRONTMATTER_KEY = "vuki-kanban"
