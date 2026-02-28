import type { BoardType, CardType, ColumnType, KanbanSettingsType } from "./types"

type MakeTodayCardOptionsType = {
    card?: Partial<CardType>
    cardIndex?: number
    columnIndex?: number
    columnTitle?: string
}

export function makeCard(overrides: Partial<CardType> = {}): CardType {
    return {
        completed: overrides.completed ?? false,
        date: overrides.date ?? null,
        description: overrides.description ?? null,
        id: overrides.id ?? "abc123",
        linkedNote: overrides.linkedNote ?? null,
        priority: overrides.priority ?? null,
        title: overrides.title ?? "Test card",
    }
}

export function makeColumns(): ColumnType[] {
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

export function makeBoard(overrides: Partial<BoardType> = {}): BoardType {
    const defaultSettings: KanbanSettingsType = {
        collapsedColumns: [],
        columnColors: {},
        todayOrder: {},
    }

    return {
        columns: overrides.columns ?? makeColumns(),
        settings: overrides.settings ?? defaultSettings,
    }
}

export function makeTodayCard(options: MakeTodayCardOptionsType = {}) {
    return {
        card: makeCard(options.card),
        cardIndex: options.cardIndex ?? 0,
        columnIndex: options.columnIndex ?? 0,
        columnTitle: options.columnTitle ?? "Todo",
    }
}
