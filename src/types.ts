export type Priority = "important" | null;

export type Card = {
    title: string;
    completed: boolean;
    today: boolean;
    priority: Priority;
    date: string | null;
    linkedNote: string | null;
    id: string;
};

export type Column = {
    title: string;
    cards: Card[];
};

export type KanbanSettings = {
    collapsedColumns: string[];
    todayOrder: string[];
};

export type Board = {
    columns: Column[];
    archivedCards: Card[];
    settings: KanbanSettings;
};

export type ViewState = {
    todayFilterActive: boolean;
    hideCompletedActive: boolean;
};

export type PluginSettings = {
    notePathPrefix: string;
};

export const DEFAULT_PLUGIN_SETTINGS: PluginSettings = {
    notePathPrefix: "Projects",
};

export const KANBAN_VIEW_TYPE = "vuki-kanban-view";
export const FRONTMATTER_KEY = "vuki-kanban";
