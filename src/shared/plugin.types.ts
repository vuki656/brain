export type PluginSettingsType = {
    notePathPrefix: string
    weatherLatitude: string
    weatherLongitude: string
}

export const DEFAULT_PLUGIN_SETTINGS: PluginSettingsType = {
    notePathPrefix: "Projects",
    weatherLatitude: "",
    weatherLongitude: "",
}

export const KANBAN_VIEW_TYPE = "vuki-kanban-view"
export const FRONTMATTER_KEY = "vuki-kanban"
