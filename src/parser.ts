import { toDateString } from "./board-utils"
import {
    type BoardType,
    type CardType,
    type ColumnType,
    FRONTMATTER_KEY,
    type KanbanSettingsType,
    type PriorityType,
} from "./types"

const TODAY_REGEX = /\s@today/g
const DATE_REGEX = /\s@{(\d{4}-\d{2}-\d{2})}/g
const PRIORITY_IMPORTANT_REGEX = /\s!important/g

const LINKED_NOTE_REGEX = /(?:^|\s)\[\[(.+?)]]/g
const ID_REGEX = /\s@id:([\da-z]+)/g
const CHECKBOX_UNCHECKED_REGEX = /^- \[ ] /
const CHECKBOX_CHECKED_REGEX = /^- \[x] /
const COLUMN_HEADING_REGEX = /^## (.+)$/
const SETTINGS_START = "%% kanban:settings"
const SETTINGS_END = "%%"

// eslint-disable-next-line import-x/exports-last -- parseCard below depends on generateId
export function generateId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""

    for (let index = 0; index < 6; index++) {
        result = result + chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return result
}

function parseCard(line: string): CardType | null {
    const isChecked = line.startsWith("- [x] ")
    const isUnchecked = line.startsWith("- [ ] ")

    if (!isChecked && !isUnchecked) {
        return null
    }

    let text = line.replace(CHECKBOX_CHECKED_REGEX, "").replace(CHECKBOX_UNCHECKED_REGEX, "")

    let priority: PriorityType = null
    let date: string | null = null
    let linkedNote: string | null = null
    let id: string | null = null

    const idMatch = ID_REGEX.exec(text)

    if (idMatch) {
        id = idMatch[1]
        text = text.replace(ID_REGEX, "")
    }

    ID_REGEX.lastIndex = 0

    const todayMatch = TODAY_REGEX.exec(text)

    if (todayMatch) {
        date = toDateString(new Date())
        text = text.replace(TODAY_REGEX, "")
    }

    TODAY_REGEX.lastIndex = 0

    const dateMatch = DATE_REGEX.exec(text)

    if (dateMatch) {
        date = dateMatch[1]
        text = text.replace(DATE_REGEX, "")
    }

    DATE_REGEX.lastIndex = 0

    const importantMatch = PRIORITY_IMPORTANT_REGEX.exec(text)

    if (importantMatch) {
        priority = "important"
        text = text.replace(PRIORITY_IMPORTANT_REGEX, "")
    }

    PRIORITY_IMPORTANT_REGEX.lastIndex = 0

    const linkedNoteMatch = LINKED_NOTE_REGEX.exec(text)

    if (linkedNoteMatch) {
        linkedNote = linkedNoteMatch[1]
        text = text.replace(LINKED_NOTE_REGEX, "")
    }

    LINKED_NOTE_REGEX.lastIndex = 0

    return {
        completed: isChecked,
        date,
        description: null,
        id: id ?? generateId(),
        linkedNote,
        priority,
        title: text.trim(),
    }
}

function parseSettings(lines: string[]): KanbanSettingsType {
    const settingsStartIndex = lines.findIndex((line) => {
        return line.trim() === SETTINGS_START
    })

    if (settingsStartIndex === -1) {
        return { collapsedColumns: [], columnColors: {}, todayOrder: {} }
    }

    const jsonLines: string[] = []
    let capturing = false

    for (let index = settingsStartIndex + 1; index < lines.length; index++) {
        const line = lines[index].trim()

        if (line === "```" || line.startsWith("```")) {
            if (capturing) {
                break
            }

            capturing = true
            continue
        }

        if (line === SETTINGS_END) {
            break
        }

        if (capturing) {
            jsonLines.push(line)
        }
    }

    const jsonString = jsonLines.join("\n")

    if (!jsonString) {
        return { collapsedColumns: [], columnColors: {}, todayOrder: {} }
    }

    try {
        const parsed = JSON.parse(jsonString)

        const rawTodayOrder = parsed["today-order"]
        let todayOrder: Record<string, string[]> = {}

        if (rawTodayOrder && typeof rawTodayOrder === "object") {
            todayOrder = rawTodayOrder
        }

        return {
            collapsedColumns: parsed["collapsed-columns"] ?? [],
            columnColors: parsed["column-colors"] ?? {},
            todayOrder,
        }
    } catch {
        return { collapsedColumns: [], columnColors: {}, todayOrder: {} }
    }
}

function collectDescription(lines: string[], cardLineIndex: number): string | null {
    const descriptionLines: string[] = []

    for (let nextIndex = cardLineIndex + 1; nextIndex < lines.length; nextIndex++) {
        const nextLine = lines[nextIndex]

        if (!nextLine.startsWith("  ") || nextLine.trim() === "") {
            break
        }

        const nextTrimmed = nextLine.trim()

        if (nextTrimmed.startsWith("- [ ] ") || nextTrimmed.startsWith("- [x] ")) {
            break
        }

        if (COLUMN_HEADING_REGEX.test(nextTrimmed)) {
            break
        }

        if (nextTrimmed === SETTINGS_START) {
            break
        }

        descriptionLines.push(nextTrimmed)
    }

    return descriptionLines.length > 0 ? descriptionLines.join("\n") : null
}

function serializeCard(card: CardType): string {
    const checkbox = card.completed ? "- [x] " : "- [ ] "
    let line = checkbox

    line = line + (card.linkedNote ? `[[${card.linkedNote}]]` : card.title)

    const isToday = card.date === toDateString(new Date())

    if (isToday) {
        line = `${line} @today`
    }

    if (card.priority) {
        line = `${line} !${card.priority}`
    }

    if (card.date && !isToday) {
        line = `${line} @{${card.date}}`
    }

    line = `${line} @id:${card.id}`

    return line
}

export function parseBoard(markdown: string): BoardType {
    const lines = markdown.split("\n")
    const columns: ColumnType[] = []
    let currentColumn: ColumnType | null = null
    let pastFrontmatter = false
    let inFrontmatter = false

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const trimmed = lines[lineIndex].trim()

        if (!pastFrontmatter) {
            if (trimmed === "---" && !inFrontmatter) {
                inFrontmatter = true
                continue
            }

            if (trimmed === "---" && inFrontmatter) {
                pastFrontmatter = true
                continue
            }

            continue
        }

        if (trimmed === SETTINGS_START) {
            break
        }

        const headingMatch = COLUMN_HEADING_REGEX.exec(trimmed)

        if (headingMatch) {
            currentColumn = { cards: [], title: headingMatch[1] }
            columns.push(currentColumn)
            continue
        }

        if (currentColumn && (trimmed.startsWith("- [ ] ") || trimmed.startsWith("- [x] "))) {
            const card = parseCard(trimmed)

            if (card) {
                card.description = collectDescription(lines, lineIndex)
                currentColumn.cards.push(card)
            }
        }
    }

    const settings = parseSettings(lines)

    return { columns, settings }
}

export function serializeBoard(board: BoardType): string {
    const lines: string[] = ["---", "", `kanban-plugin: ${FRONTMATTER_KEY}`, "", "---", ""]

    for (const column of board.columns) {
        lines.push(`## ${column.title}`, "")

        for (const card of column.cards) {
            lines.push(serializeCard(card))

            if (card.description) {
                const indentedLines = card.description.split("\n").map((descriptionLine) => {
                    return `  ${descriptionLine}`
                })

                lines.push(...indentedLines)
            }
        }

        lines.push("", "")
    }

    const settingsObject: Record<string, unknown> = {}

    if (board.settings.collapsedColumns.length > 0) {
        settingsObject["collapsed-columns"] = board.settings.collapsedColumns
    }

    if (Object.keys(board.settings.todayOrder).length > 0) {
        settingsObject["today-order"] = board.settings.todayOrder
    }

    if (Object.keys(board.settings.columnColors).length > 0) {
        settingsObject["column-colors"] = board.settings.columnColors
    }

    lines.push("%% kanban:settings", "```json", JSON.stringify(settingsObject), "```", "%%")

    return lines.join("\n")
}
