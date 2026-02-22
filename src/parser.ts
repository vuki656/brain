import { Board, Card, Column, KanbanSettings, Priority, FRONTMATTER_KEY } from "./types";

const TODAY_REGEX = /\s@today/g;
const DATE_REGEX = /\s@\{(\d{4}-\d{2}-\d{2})\}/g;
const PRIORITY_IMPORTANT_REGEX = /\s!important/g;
const PRIORITY_URGENT_REGEX = /\s!urgent/g;
const LINKED_NOTE_REGEX = /(?:^|\s)\[\[(.+?)\]\]/g;
const CHECKBOX_UNCHECKED_REGEX = /^- \[ \] /;
const CHECKBOX_CHECKED_REGEX = /^- \[x\] /;
const COLUMN_HEADING_REGEX = /^## (.+)$/;
const SETTINGS_START = "%% kanban:settings";
const SETTINGS_END = "%%";
const ARCHIVE_SEPARATOR = "***";

function parseCard(line: string): Card | null {
    const isChecked = CHECKBOX_CHECKED_REGEX.test(line);
    const isUnchecked = CHECKBOX_UNCHECKED_REGEX.test(line);

    if (!isChecked && !isUnchecked) {
        return null;
    }

    let text = line.replace(CHECKBOX_CHECKED_REGEX, "").replace(CHECKBOX_UNCHECKED_REGEX, "");

    let today = false;
    let priority: Priority = null;
    let date: string | null = null;
    let linkedNote: string | null = null;

    const todayMatch = TODAY_REGEX.exec(text);
    if (todayMatch) {
        today = true;
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

    const urgentMatch = PRIORITY_URGENT_REGEX.exec(text);
    if (urgentMatch) {
        priority = "urgent";
        text = text.replace(PRIORITY_URGENT_REGEX, "");
    }
    PRIORITY_URGENT_REGEX.lastIndex = 0;

    const linkedNoteMatch = LINKED_NOTE_REGEX.exec(text);
    if (linkedNoteMatch) {
        linkedNote = linkedNoteMatch[1];
        text = text.replace(LINKED_NOTE_REGEX, "");
    }
    LINKED_NOTE_REGEX.lastIndex = 0;

    return {
        title: text.trim(),
        completed: isChecked,
        today,
        priority,
        date,
        linkedNote,
    };
}

function parseSettings(lines: string[]): KanbanSettings {
    const settingsStartIndex = lines.findIndex((line) => line.trim() === SETTINGS_START);

    if (settingsStartIndex === -1) {
        return { collapsedColumns: [] };
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
        return { collapsedColumns: [] };
    }

    try {
        const parsed = JSON.parse(jsonString);

        return {
            collapsedColumns: parsed["collapsed-columns"] ?? [],
        };
    } catch {
        return { collapsedColumns: [] };
    }
}

export function parseBoard(markdown: string): Board {
    const lines = markdown.split("\n");
    const columns: Column[] = [];
    let currentColumn: Column | null = null;
    let pastFrontmatter = false;
    let inFrontmatter = false;

    for (const line of lines) {
        const trimmed = line.trim();

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

        if (trimmed === ARCHIVE_SEPARATOR) {
            break;
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

    if (card.today) {
        line += " @today";
    }

    if (card.priority) {
        line += ` !${card.priority}`;
    }

    if (card.date) {
        line += ` @{${card.date}}`;
    }

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
        }

        lines.push("");
        lines.push("");
    }

    const settingsObject: Record<string, unknown> = {};

    if (board.settings.collapsedColumns.length > 0) {
        settingsObject["collapsed-columns"] = board.settings.collapsedColumns;
    }

    lines.push("%% kanban:settings");
    lines.push("```json");
    lines.push(JSON.stringify(settingsObject));
    lines.push("```");
    lines.push("%%");

    return lines.join("\n");
}
