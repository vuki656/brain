import { toDateString } from "./board-utils";
import { Board, Card, Column, KanbanSettings, Priority, FRONTMATTER_KEY } from "./types";

const TODAY_REGEX = /\s@today/g;
const DATE_REGEX = /\s@\{(\d{4}-\d{2}-\d{2})\}/g;
const PRIORITY_IMPORTANT_REGEX = /\s!important/g;

const LINKED_NOTE_REGEX = /(?:^|\s)\[\[(.+?)\]\]/g;
const ID_REGEX = /\s@id:([a-z0-9]+)/g;
const CHECKBOX_UNCHECKED_REGEX = /^- \[ \] /;
const CHECKBOX_CHECKED_REGEX = /^- \[x\] /;
const COLUMN_HEADING_REGEX = /^## (.+)$/;
const SETTINGS_START = "%% kanban:settings";
const SETTINGS_END = "%%";

export function generateId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let index = 0; index < 6; index++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
}

function parseCard(line: string): Card | null {
    const isChecked = CHECKBOX_CHECKED_REGEX.test(line);
    const isUnchecked = CHECKBOX_UNCHECKED_REGEX.test(line);

    if (!isChecked && !isUnchecked) {
        return null;
    }

    let text = line.replace(CHECKBOX_CHECKED_REGEX, "").replace(CHECKBOX_UNCHECKED_REGEX, "");

    let priority: Priority = null;
    let date: string | null = null;
    let linkedNote: string | null = null;
    let id: string | null = null;

    const idMatch = ID_REGEX.exec(text);
    if (idMatch) {
        id = idMatch[1];
        text = text.replace(ID_REGEX, "");
    }
    ID_REGEX.lastIndex = 0;

    const todayMatch = TODAY_REGEX.exec(text);
    if (todayMatch) {
        date = toDateString(new Date());
        text = text.replace(TODAY_REGEX, "");
    }
    TODAY_REGEX.lastIndex = 0;

    const dateMatch = DATE_REGEX.exec(text);
    if (dateMatch) {
        date = dateMatch[1];
        text = text.replace(DATE_REGEX, "");
    }
    DATE_REGEX.lastIndex = 0;

    const importantMatch = PRIORITY_IMPORTANT_REGEX.exec(text);
    if (importantMatch) {
        priority = "important";
        text = text.replace(PRIORITY_IMPORTANT_REGEX, "");
    }
    PRIORITY_IMPORTANT_REGEX.lastIndex = 0;

    const linkedNoteMatch = LINKED_NOTE_REGEX.exec(text);
    if (linkedNoteMatch) {
        linkedNote = linkedNoteMatch[1];
        text = text.replace(LINKED_NOTE_REGEX, "");
    }
    LINKED_NOTE_REGEX.lastIndex = 0;

    return {
        title: text.trim(),
        completed: isChecked,
        priority,
        date,
        linkedNote,
        id: id ?? generateId(),
        description: null,
    };
}

function parseSettings(lines: string[]): KanbanSettings {
    const settingsStartIndex = lines.findIndex((line) => line.trim() === SETTINGS_START);

    if (settingsStartIndex === -1) {
        return { collapsedColumns: [], todayOrder: {}, columnColors: {} };
    }

    const jsonLines: string[] = [];
    let capturing = false;

    for (let index = settingsStartIndex + 1; index < lines.length; index++) {
        const line = lines[index].trim();

        if (line === "```" || line.startsWith("```")) {
            if (capturing) {
                break;
            }
            capturing = true;
            continue;
        }

        if (line === SETTINGS_END) {
            break;
        }

        if (capturing) {
            jsonLines.push(line);
        }
    }

    const jsonString = jsonLines.join("\n");

    if (!jsonString) {
        return { collapsedColumns: [], todayOrder: {}, columnColors: {} };
    }

    try {
        const parsed = JSON.parse(jsonString);

        const rawTodayOrder = parsed["today-order"];
        let todayOrder: Record<string, string[]> = {};

        if (rawTodayOrder && typeof rawTodayOrder === "object") {
            todayOrder = rawTodayOrder;
        }

        return {
            collapsedColumns: parsed["collapsed-columns"] ?? [],
            todayOrder,
            columnColors: parsed["column-colors"] ?? {},
        };
    } catch {
        return { collapsedColumns: [], todayOrder: {}, columnColors: {} };
    }
}

function collectDescription(lines: string[], cardLineIndex: number): string | null {
    const descriptionLines: string[] = [];

    for (let nextIndex = cardLineIndex + 1; nextIndex < lines.length; nextIndex++) {
        const nextLine = lines[nextIndex];

        if (!nextLine.startsWith("  ") || nextLine.trim() === "") {
            break;
        }

        const nextTrimmed = nextLine.trim();

        if (CHECKBOX_UNCHECKED_REGEX.test(nextTrimmed) || CHECKBOX_CHECKED_REGEX.test(nextTrimmed)) {
            break;
        }

        if (COLUMN_HEADING_REGEX.test(nextTrimmed)) {
            break;
        }

        if (nextTrimmed === SETTINGS_START) {
            break;
        }

        descriptionLines.push(nextTrimmed);
    }

    return descriptionLines.length > 0 ? descriptionLines.join("\n") : null;
}

export function parseBoard(markdown: string): Board {
    const lines = markdown.split("\n");
    const columns: Column[] = [];
    let currentColumn: Column | null = null;
    let pastFrontmatter = false;
    let inFrontmatter = false;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const trimmed = lines[lineIndex].trim();

        if (!pastFrontmatter) {
            if (trimmed === "---" && !inFrontmatter) {
                inFrontmatter = true;
                continue;
            }
            if (trimmed === "---" && inFrontmatter) {
                pastFrontmatter = true;
                continue;
            }
            continue;
        }

        if (trimmed === SETTINGS_START) {
            break;
        }

        const headingMatch = COLUMN_HEADING_REGEX.exec(trimmed);
        if (headingMatch) {
            currentColumn = { title: headingMatch[1], cards: [] };
            columns.push(currentColumn);
            continue;
        }

        if (currentColumn && (CHECKBOX_UNCHECKED_REGEX.test(trimmed) || CHECKBOX_CHECKED_REGEX.test(trimmed))) {
            const card = parseCard(trimmed);

            if (card) {
                card.description = collectDescription(lines, lineIndex);
                currentColumn.cards.push(card);
            }
        }
    }

    const settings = parseSettings(lines);

    return { columns, settings };
}

function serializeCard(card: Card): string {
    const checkbox = card.completed ? "- [x] " : "- [ ] ";
    let line = checkbox;

    if (card.linkedNote) {
        line += `[[${card.linkedNote}]]`;
    } else {
        line += card.title;
    }

    const isToday = card.date === toDateString(new Date());

    if (isToday) {
        line += " @today";
    }

    if (card.priority) {
        line += ` !${card.priority}`;
    }

    if (card.date && !isToday) {
        line += ` @{${card.date}}`;
    }

    line += ` @id:${card.id}`;

    return line;
}

export function serializeBoard(board: Board): string {
    const lines: string[] = [];

    lines.push("---");
    lines.push("");
    lines.push(`kanban-plugin: ${FRONTMATTER_KEY}`);
    lines.push("");
    lines.push("---");
    lines.push("");

    for (const column of board.columns) {
        lines.push(`## ${column.title}`);
        lines.push("");

        for (const card of column.cards) {
            lines.push(serializeCard(card));

            if (card.description) {
                for (const descriptionLine of card.description.split("\n")) {
                    lines.push(`  ${descriptionLine}`);
                }
            }
        }

        lines.push("");
        lines.push("");
    }

    const settingsObject: Record<string, unknown> = {};

    if (board.settings.collapsedColumns.length > 0) {
        settingsObject["collapsed-columns"] = board.settings.collapsedColumns;
    }

    if (Object.keys(board.settings.todayOrder).length > 0) {
        settingsObject["today-order"] = board.settings.todayOrder;
    }

    if (Object.keys(board.settings.columnColors).length > 0) {
        settingsObject["column-colors"] = board.settings.columnColors;
    }

    lines.push("%% kanban:settings");
    lines.push("```json");
    lines.push(JSON.stringify(settingsObject));
    lines.push("```");
    lines.push("%%");

    return lines.join("\n");
}
