import type {
    BoardType,
    CardType,
    KanbanSettingsType,
    PriorityType,
    ProjectType,
    SubtaskType,
} from "../shared"
import { FRONTMATTER_KEY, generateId, toDateString } from "../shared"

const TODAY_REGEX = /\s@today/g
const DATE_REGEX = /\s@{(\d{4}-\d{2}-\d{2})}/g
const PRIORITY_IMPORTANT_REGEX = /\s!important/g
const BLOCKED_REGEX = /\s!blocked\(([^)]+)\)/g
const BACKLOG_REGEX = /\s@backlog/g

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

    let backlog = false
    let priority: PriorityType = null
    let blockedReason: string | null = null
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

    const blockedMatch = BLOCKED_REGEX.exec(text)

    if (blockedMatch) {
        blockedReason = blockedMatch[1] ?? null
        text = text.replace(BLOCKED_REGEX, "")
    }

    BLOCKED_REGEX.lastIndex = 0

    const backlogMatch = BACKLOG_REGEX.exec(text)

    if (backlogMatch) {
        backlog = true
        text = text.replace(BACKLOG_REGEX, "")
    }

    BACKLOG_REGEX.lastIndex = 0

    const linkedNoteMatch = LINKED_NOTE_REGEX.exec(text)

    if (linkedNoteMatch) {
        linkedNote = linkedNoteMatch[1] ?? null
        text = text.replace(LINKED_NOTE_REGEX, "")
    }

    LINKED_NOTE_REGEX.lastIndex = 0

    return {
        backlog,
        blockedReason,
        completed: isChecked,
        date,
        description: null,
        id: id ?? generateId(),
        linkedNote,
        priority,
        subtasks: [],
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

const SUBTASK_CHECKBOX_REGEX = /^- \[([ x])] (.+)$/

function parseSubtask(line: string): SubtaskType {
    const match = SUBTASK_CHECKBOX_REGEX.exec(line)

    if (!match) {
        return { completed: false, id: generateId(), title: line }
    }

    const completed = match[1] === "x"
    let text = match[2] ?? ""

    const idMatch = ID_REGEX.exec(text)
    let id: string | null = null

    if (idMatch) {
        id = idMatch[1] ?? null
        text = text.replace(ID_REGEX, "")
    }

    ID_REGEX.lastIndex = 0

    return {
        completed,
        id: id ?? generateId(),
        title: text.trim(),
    }
}

type SubtasksAndDescriptionType = {
    description: string | null
    linesConsumed: number
    subtasks: SubtaskType[]
}

function collectSubtasksAndDescription(
    lines: string[],
    cardLineIndex: number,
): SubtasksAndDescriptionType {
    const subtasks: SubtaskType[] = []
    const descriptionLines: string[] = []
    let linesConsumed = 0
    let pastSubtasks = false

    for (let nextIndex = cardLineIndex + 1; nextIndex < lines.length; nextIndex++) {
        const nextLine = lines[nextIndex]

        if (nextLine === undefined) {
            break
        }

        if (!nextLine.startsWith("  ") || nextLine.trim() === "") {
            break
        }

        const nextTrimmed = nextLine.trim()

        if (PROJECT_HEADING_REGEX.test(nextTrimmed)) {
            break
        }

        if (nextTrimmed === SETTINGS_START) {
            break
        }

        if (
            !pastSubtasks &&
            (nextTrimmed.startsWith("- [ ] ") || nextTrimmed.startsWith("- [x] "))
        ) {
            subtasks.push(parseSubtask(nextTrimmed))
            linesConsumed++
            continue
        }

        pastSubtasks = true

        if (nextTrimmed.startsWith("- [ ] ") || nextTrimmed.startsWith("- [x] ")) {
            break
        }

        descriptionLines.push(nextTrimmed)
        linesConsumed++
    }

    return {
        description: descriptionLines.length > 0 ? descriptionLines.join("\n") : null,
        linesConsumed,
        subtasks,
    }
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

    if (card.blockedReason !== null) {
        line = `${line} !blocked(${card.blockedReason})`
    }

    if (card.date && !isToday) {
        line = `${line} @{${card.date}}`
    }

    if (card.backlog) {
        line = `${line} @backlog`
    }

    line = `${line} @id:${card.id}`

    return line
}

function sortRecordKeys<TValue>(record: Record<string, TValue>): Record<string, TValue> {
    const sorted: Record<string, TValue> = {}

    for (const key of Object.keys(record).sort((first, second) => {
        return first.localeCompare(second)
    })) {
        const value = record[key]

        if (value !== undefined) {
            sorted[key] = value
        }
    }

    return sorted
}

function sortCardsByCompletionStatus(cards: CardType[]): CardType[] {
    return [...cards].sort((first, second) => {
        const completedFirst = first.completed ? 1 : 0
        const completedSecond = second.completed ? 1 : 0

        return completedFirst - completedSecond
    })
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
                const { description, linesConsumed, subtasks } = collectSubtasksAndDescription(
                    lines,
                    lineIndex,
                )

                card.description = description
                card.subtasks = subtasks
                lineIndex = lineIndex + linesConsumed // eslint-disable-line sonarjs/updated-loop-counter -- must skip consumed subtask/description lines

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

        const sortedCards = sortCardsByCompletionStatus(project.cards)

        for (const card of sortedCards) {
            lines.push(serializeCard(card))

            for (const subtask of card.subtasks) {
                const subtaskCheckbox = subtask.completed ? "- [x] " : "- [ ] "

                lines.push(`  ${subtaskCheckbox}${subtask.title} @id:${subtask.id}`)
            }

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
        settingsObject["today-order"] = sortRecordKeys(board.settings.todayOrder)
    }

    if (Object.keys(board.settings.projectColors).length > 0) {
        settingsObject["project-colors"] = sortRecordKeys(board.settings.projectColors)
    }

    if (Object.keys(board.settings.projectIcons).length > 0) {
        settingsObject["project-icons"] = sortRecordKeys(board.settings.projectIcons)
    }

    lines.push("%% kanban:settings", "```json", JSON.stringify(settingsObject), "```", "%%")

    return lines.join("\n")
}
