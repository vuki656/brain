import type { BoardType, CardType, KanbanSettingsType, PriorityType, ProjectType } from "../shared"
import { FRONTMATTER_KEY, generateId, toDateString } from "../shared"

const TODAY_REGEX = /\s@today/g
const DATE_REGEX = /\s@{(\d{4}-\d{2}-\d{2})}/g
const PRIORITY_IMPORTANT_REGEX = /\s!important/g

const LINKED_NOTE_REGEX = /(?:^|\s)\[\[(.+?)]]/g
const ID_REGEX = /\s@id:([\da-z]+)/g
const CHECKBOX_UNCHECKED_REGEX = /^- \[ ] /
const CHECKBOX_CHECKED_REGEX = /^- \[x] /
const PROJECT_HEADING_REGEX = /^## (.+)$/
const SETTINGS_START = "%% kanban:settings"
const SETTINGS_END = "%%"

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
        id = idMatch[1] ?? null
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
        date = dateMatch[1] ?? null
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
        linkedNote = linkedNoteMatch[1] ?? null
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
        return {
            archivedProjects: [],
            collapsedProjects: [],
            projectColors: {},
            projectIcons: {},
            todayOrder: {},
        }
    }

    const jsonLines: string[] = []
    let capturing = false

    for (let index = settingsStartIndex + 1; index < lines.length; index++) {
        const rawLine = lines[index]

        if (rawLine === undefined) {
            continue
        }

        const line = rawLine.trim()

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
        return {
            archivedProjects: [],
            collapsedProjects: [],
            projectColors: {},
            projectIcons: {},
            todayOrder: {},
        }
    }

    try {
        const parsed = JSON.parse(jsonString)

        const rawTodayOrder = parsed["today-order"]
        let todayOrder: Record<string, string[]> = {}

        if (rawTodayOrder && typeof rawTodayOrder === "object") {
            todayOrder = rawTodayOrder
        }

        return {
            archivedProjects: parsed["archived-projects"] ?? [],
            collapsedProjects: parsed["collapsed-projects"] ?? [],
            projectColors: parsed["project-colors"] ?? {},
            projectIcons: parsed["project-icons"] ?? {},
            todayOrder,
        }
    } catch {
        return {
            archivedProjects: [],
            collapsedProjects: [],
            projectColors: {},
            projectIcons: {},
            todayOrder: {},
        }
    }
}

function collectDescription(lines: string[], cardLineIndex: number): string | null {
    const descriptionLines: string[] = []

    for (let nextIndex = cardLineIndex + 1; nextIndex < lines.length; nextIndex++) {
        const nextLine = lines[nextIndex]

        if (nextLine === undefined) {
            break
        }

        if (!nextLine.startsWith("  ") || nextLine.trim() === "") {
            break
        }

        const nextTrimmed = nextLine.trim()

        if (nextTrimmed.startsWith("- [ ] ") || nextTrimmed.startsWith("- [x] ")) {
            break
        }

        if (PROJECT_HEADING_REGEX.test(nextTrimmed)) {
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
    const projects: ProjectType[] = []
    let currentProject: ProjectType | null = null
    let pastFrontmatter = false
    let inFrontmatter = false

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const rawLine = lines[lineIndex]

        if (rawLine === undefined) {
            continue
        }

        const trimmed = rawLine.trim()

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

        const headingMatch = PROJECT_HEADING_REGEX.exec(trimmed)

        if (headingMatch) {
            currentProject = { cards: [], title: headingMatch[1] ?? "" }
            projects.push(currentProject)
            continue
        }

        if (currentProject && (trimmed.startsWith("- [ ] ") || trimmed.startsWith("- [x] "))) {
            const card = parseCard(trimmed)

            if (card) {
                card.description = collectDescription(lines, lineIndex)
                currentProject.cards.push(card)
            }
        }
    }

    const settings = parseSettings(lines)

    return { projects, settings }
}

export function serializeBoard(board: BoardType): string {
    const lines: string[] = ["---", "", `kanban-plugin: ${FRONTMATTER_KEY}`, "", "---", ""]

    for (const project of board.projects) {
        lines.push(`## ${project.title}`, "")

        for (const card of project.cards) {
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

    if (board.settings.archivedProjects.length > 0) {
        settingsObject["archived-projects"] = board.settings.archivedProjects
    }

    if (board.settings.collapsedProjects.length > 0) {
        settingsObject["collapsed-projects"] = board.settings.collapsedProjects
    }

    if (Object.keys(board.settings.todayOrder).length > 0) {
        settingsObject["today-order"] = board.settings.todayOrder
    }

    if (Object.keys(board.settings.projectColors).length > 0) {
        settingsObject["project-colors"] = board.settings.projectColors
    }

    if (Object.keys(board.settings.projectIcons).length > 0) {
        settingsObject["project-icons"] = board.settings.projectIcons
    }

    lines.push("%% kanban:settings", "```json", JSON.stringify(settingsObject), "```", "%%")

    return lines.join("\n")
}
