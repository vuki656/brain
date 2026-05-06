import type { BoardType, CardType, KanbanSettingsType, ProjectType, SubtaskType } from "./types"

type MakeBoardOverridesType = {
    projects?: ProjectType[]
    settings?: Partial<KanbanSettingsType>
}

type MakeTodayCardOptionsType = {
    card?: Partial<CardType>
    cardIndex?: number
    projectIndex?: number
    projectTitle?: string
}

export function makeSubtask(overrides: Partial<SubtaskType> = {}): SubtaskType {
    return {
        completed: overrides.completed ?? false,
        id: overrides.id ?? "sub123",
        title: overrides.title ?? "Test subtask",
    }
}

export function makeCard(overrides: Partial<CardType> = {}): CardType {
    return {
        backlog: overrides.backlog ?? false,
        blockedReason: overrides.blockedReason ?? null,
        completed: overrides.completed ?? false,
        date: overrides.date ?? null,
        description: overrides.description ?? null,
        id: overrides.id ?? "abc123",
        linkedNote: overrides.linkedNote ?? null,
        linkedTicket: overrides.linkedTicket ?? null,
        priority: overrides.priority ?? null,
        subtasks: overrides.subtasks ?? [],
        title: overrides.title ?? "Test card",
    }
}

export function makeProjects(): ProjectType[] {
    return [
        {
            cards: [
                makeCard({ id: "a1", title: "First" }),
                makeCard({ id: "a2", title: "Second" }),
            ],
            title: "Todo",
        },
        {
            cards: [makeCard({ completed: true, id: "b1", title: "Third" })],
            title: "Done",
        },
    ]
}

export function makeBoard(overrides: MakeBoardOverridesType = {}): BoardType {
    const defaultSettings: KanbanSettingsType = {
        archivedProjects: [],
        collapsedProjects: [],
        focusTimer: null,
        projectColors: {},
        projectIcons: {},
        ticketOrder: {},
        todayOrder: {},
    }

    return {
        projects: overrides.projects ?? makeProjects(),
        settings: { ...defaultSettings, ...overrides.settings },
    }
}

export function makeTodayCard(options: MakeTodayCardOptionsType = {}) {
    return {
        card: makeCard(options.card),
        cardIndex: options.cardIndex ?? 0,
        projectIndex: options.projectIndex ?? 0,
        projectTitle: options.projectTitle ?? "Todo",
    }
}
