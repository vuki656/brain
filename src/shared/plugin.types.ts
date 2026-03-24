export type FocusTimerSettingsType = {
    endTimestamp: number
    projectTitle: string
    totalDurationMs: number
} | null

export type PluginSettingsType = {
    focusTimer: FocusTimerSettingsType
    notePathPrefix: string
    weatherLatitude: string
    weatherLongitude: string
}

export const DEFAULT_PLUGIN_SETTINGS: PluginSettingsType = {
    focusTimer: null,
    notePathPrefix: "Projects",
    weatherLatitude: "",
    weatherLongitude: "",
}

export const KANBAN_VIEW_TYPE = "vuki-kanban-view"
export const FRONTMATTER_KEY = "vuki-kanban"
