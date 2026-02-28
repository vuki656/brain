import { Card, Column, Board, KanbanSettings } from "./types";

export function makeCard(overrides: Partial<Card> = {}): Card {
    return {
        title: overrides.title ?? "Test card",
        completed: overrides.completed ?? false,
        priority: overrides.priority ?? null,
        date: overrides.date ?? null,
        linkedNote: overrides.linkedNote ?? null,
        id: overrides.id ?? "abc123",
        description: overrides.description ?? null,
    };
}

export function makeColumns(): Column[] {
    return [
        { title: "Todo", cards: [makeCard({ id: "a1", title: "First" }), makeCard({ id: "a2", title: "Second" })] },
        { title: "Done", cards: [makeCard({ id: "b1", title: "Third", completed: true })] },
    ];
}

export function makeBoard(overrides: Partial<Board> = {}): Board {
    const defaultSettings: KanbanSettings = {
        collapsedColumns: [],
        todayOrder: {},
        columnColors: {},
    };

    return {
        columns: overrides.columns ?? makeColumns(),
        settings: overrides.settings ?? defaultSettings,
    };
}

export type MakeTodayCardOptions = {
    card?: Partial<Card>;
    columnIndex?: number;
    cardIndex?: number;
    columnTitle?: string;
};

export function makeTodayCard(options: MakeTodayCardOptions = {}) {
    return {
        card: makeCard(options.card),
        columnIndex: options.columnIndex ?? 0,
        cardIndex: options.cardIndex ?? 0,
        columnTitle: options.columnTitle ?? "Todo",
    };
}
