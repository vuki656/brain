import { TFile, TFolder, type Vault } from "obsidian"

import type { TicketEntryType, TicketStatusType, TicketType } from "./ticket.types"

const ENTRY_REGEX = /^- (\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2})?) — (.*)$/

type TicketContextType = {
    notePathPrefix: string
    projectTitle: string
    vault: Vault
}

type TicketByNameOptionsType = TicketContextType & {
    name: string
}

type CreateTicketOptionsType = TicketByNameOptionsType & {
    link: string | null
}

type AddEntryOptionsType = TicketByNameOptionsType & {
    text: string
}

type UpdateLinkOptionsType = TicketByNameOptionsType & {
    newLink: string | null
}

type UpdateStatusOptionsType = TicketByNameOptionsType & {
    newStatus: TicketStatusType
}

type UpdateHiddenOptionsType = TicketByNameOptionsType & {
    newHidden: boolean
}

type UpdateEntriesOptionsType = TicketByNameOptionsType & {
    transform: (entries: TicketEntryType[]) => TicketEntryType[]
}

type RenameTicketOptionsType = TicketContextType & {
    newName: string
    oldName: string
}

function getTicketsFolderPath(notePathPrefix: string, projectTitle: string): string {
    return `${notePathPrefix}/${projectTitle}/Tickets`
}

function getTicketFilePath(notePathPrefix: string, projectTitle: string, name: string): string {
    return `${getTicketsFolderPath(notePathPrefix, projectTitle)}/${name}.md`
}

const ILLEGAL_FILENAME_CHARS = /["*/:<>?\\|]/g
const WHITESPACE_RUN = /\s+/g

function sanitizeTicketName(name: string): string {
    return name.replaceAll(ILLEGAL_FILENAME_CHARS, "-").replaceAll(WHITESPACE_RUN, " ").trim()
}

function formatTicketTimestamp(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    return `${year}-${month}-${day} ${hours}:${minutes}`
}

function parseStatus(value: string): TicketStatusType {
    if (value === "mine" || value === "waiting" || value === "done" || value === "in-progress") {
        return value
    }

    return null
}

function parseTicketFile(content: string): {
    entries: TicketEntryType[]
    hidden: boolean
    link: string | null
    status: TicketStatusType
} {
    const lines = content.split("\n")
    let link: string | null = null
    let status: TicketStatusType = null
    let hidden = false
    const entries: TicketEntryType[] = []

    let inFrontmatter = false
    let pastFrontmatter = false

    for (const line of lines) {
        const trimmed = line.trim()

        if (!pastFrontmatter) {
            if (trimmed === "---" && !inFrontmatter) {
                inFrontmatter = true
                continue
            }

            if (trimmed === "---" && inFrontmatter) {
                pastFrontmatter = true
                continue
            }

            if (inFrontmatter && trimmed.startsWith("link:")) {
                const value = trimmed.slice("link:".length).trim()

                link = value.length > 0 ? value : null
            }

            if (inFrontmatter && trimmed.startsWith("status:")) {
                const value = trimmed.slice("status:".length).trim()

                status = parseStatus(value)
            }

            if (inFrontmatter && trimmed.startsWith("hidden:")) {
                const value = trimmed.slice("hidden:".length).trim()

                hidden = value === "true"
            }

            continue
        }

        const match = ENTRY_REGEX.exec(trimmed)

        if (match) {
            entries.push({ text: match[2] ?? "", timestamp: match[1] ?? "" })
        }
    }

    return { entries, hidden, link, status }
}

type SerializeTicketFileOptionsType = {
    entries: TicketEntryType[]
    hidden?: boolean
    link: string | null
    status?: TicketStatusType
}

function serializeTicketFile(options: SerializeTicketFileOptionsType): string {
    const { entries, hidden = false, link, status = null } = options
    const frontmatterLines: string[] = ["---", `link: ${link ?? ""}`]

    if (status) {
        frontmatterLines.push(`status: ${status}`)
    }

    if (hidden) {
        frontmatterLines.push("hidden: true")
    }

    frontmatterLines.push("---", "")

    const lines = [...frontmatterLines]

    for (const entry of entries) {
        lines.push(`- ${entry.timestamp} — ${entry.text}`)
    }

    return lines.join("\n")
}

function buildTicket(
    name: string,
    projectTitle: string,
    parsed: {
        entries: TicketEntryType[]
        hidden: boolean
        link: string | null
        status: TicketStatusType
    },
): TicketType {
    const lastUpdated = parsed.entries[0]?.timestamp ?? null

    return {
        entries: parsed.entries,
        hidden: parsed.hidden,
        lastUpdated,
        link: parsed.link,
        name,
        projectTitle,
        status: parsed.status,
    }
}

async function readTicket(options: TicketByNameOptionsType): Promise<TicketType | null> {
    const { name, notePathPrefix, projectTitle, vault } = options
    const path = getTicketFilePath(notePathPrefix, projectTitle, name)
    const file = vault.getAbstractFileByPath(path)

    if (!(file instanceof TFile)) {
        return null
    }

    const content = await vault.read(file)
    const parsed = parseTicketFile(content)

    return buildTicket(name, projectTitle, parsed)
}

async function listProjectTickets(options: TicketContextType): Promise<TicketType[]> {
    const { notePathPrefix, projectTitle, vault } = options
    const folderPath = getTicketsFolderPath(notePathPrefix, projectTitle)
    const folder = vault.getAbstractFileByPath(folderPath)

    if (!(folder instanceof TFolder)) {
        return []
    }

    const ticketFiles = folder.children.filter((child): child is TFile => {
        return child instanceof TFile && child.extension === "md"
    })

    const tickets = await Promise.all(
        ticketFiles.map(async (file) => {
            const content = await vault.read(file)
            const parsed = parseTicketFile(content)

            return buildTicket(file.basename, projectTitle, parsed)
        }),
    )

    tickets.sort((first, second) => {
        const firstUpdate = first.lastUpdated ?? ""
        const secondUpdate = second.lastUpdated ?? ""

        return secondUpdate.localeCompare(firstUpdate)
    })

    return tickets
}

async function ensureFolder(vault: Vault, path: string): Promise<void> {
    const existing = vault.getAbstractFileByPath(path)

    if (existing instanceof TFolder) {
        return
    }

    try {
        await vault.createFolder(path)
    } catch {
        // Folder may already exist due to a race; ignore.
    }
}

async function createTicket(options: CreateTicketOptionsType): Promise<void> {
    const { link, name, notePathPrefix, projectTitle, vault } = options
    const safeName = sanitizeTicketName(name)

    if (safeName.length === 0) {
        throw new Error("Ticket name cannot be empty after removing illegal characters")
    }

    await ensureFolder(vault, notePathPrefix)
    await ensureFolder(vault, `${notePathPrefix}/${projectTitle}`)
    await ensureFolder(vault, getTicketsFolderPath(notePathPrefix, projectTitle))

    const path = getTicketFilePath(notePathPrefix, projectTitle, safeName)
    const content = serializeTicketFile({ entries: [], link })

    await vault.create(path, content)
}

async function addTicketEntry(options: AddEntryOptionsType): Promise<void> {
    const { name, notePathPrefix, projectTitle, text, vault } = options
    const path = getTicketFilePath(notePathPrefix, projectTitle, name)
    const file = vault.getAbstractFileByPath(path)

    if (!(file instanceof TFile)) {
        return
    }

    const content = await vault.read(file)
    const parsed = parseTicketFile(content)
    const newEntry: TicketEntryType = {
        text,
        timestamp: formatTicketTimestamp(new Date()),
    }
    const newContent = serializeTicketFile({
        entries: [newEntry, ...parsed.entries],
        hidden: parsed.hidden,
        link: parsed.link,
        status: parsed.status,
    })

    await vault.modify(file, newContent)
}

async function updateTicketEntries(options: UpdateEntriesOptionsType): Promise<void> {
    const { name, notePathPrefix, projectTitle, transform, vault } = options
    const path = getTicketFilePath(notePathPrefix, projectTitle, name)
    const file = vault.getAbstractFileByPath(path)

    if (!(file instanceof TFile)) {
        return
    }

    const content = await vault.read(file)
    const parsed = parseTicketFile(content)
    const newEntries = transform(parsed.entries)
    const newContent = serializeTicketFile({
        entries: newEntries,
        hidden: parsed.hidden,
        link: parsed.link,
        status: parsed.status,
    })

    await vault.modify(file, newContent)
}

async function updateTicketStatus(options: UpdateStatusOptionsType): Promise<void> {
    const { name, newStatus, notePathPrefix, projectTitle, vault } = options
    const path = getTicketFilePath(notePathPrefix, projectTitle, name)
    const file = vault.getAbstractFileByPath(path)

    if (!(file instanceof TFile)) {
        return
    }

    const content = await vault.read(file)
    const parsed = parseTicketFile(content)
    const newContent = serializeTicketFile({
        entries: parsed.entries,
        hidden: parsed.hidden,
        link: parsed.link,
        status: newStatus,
    })

    await vault.modify(file, newContent)
}

async function updateTicketHidden(options: UpdateHiddenOptionsType): Promise<void> {
    const { name, newHidden, notePathPrefix, projectTitle, vault } = options
    const path = getTicketFilePath(notePathPrefix, projectTitle, name)
    const file = vault.getAbstractFileByPath(path)

    if (!(file instanceof TFile)) {
        return
    }

    const content = await vault.read(file)
    const parsed = parseTicketFile(content)
    const newContent = serializeTicketFile({
        entries: parsed.entries,
        hidden: newHidden,
        link: parsed.link,
        status: parsed.status,
    })

    await vault.modify(file, newContent)
}

async function updateTicketLink(options: UpdateLinkOptionsType): Promise<void> {
    const { name, newLink, notePathPrefix, projectTitle, vault } = options
    const path = getTicketFilePath(notePathPrefix, projectTitle, name)
    const file = vault.getAbstractFileByPath(path)

    if (!(file instanceof TFile)) {
        return
    }

    const content = await vault.read(file)
    const parsed = parseTicketFile(content)
    const newContent = serializeTicketFile({
        entries: parsed.entries,
        hidden: parsed.hidden,
        link: newLink,
        status: parsed.status,
    })

    await vault.modify(file, newContent)
}

async function renameTicket(options: RenameTicketOptionsType): Promise<string> {
    const { newName, notePathPrefix, oldName, projectTitle, vault } = options
    const safeName = sanitizeTicketName(newName)

    if (safeName.length === 0) {
        throw new Error("Ticket name cannot be empty after removing illegal characters")
    }

    const oldPath = getTicketFilePath(notePathPrefix, projectTitle, oldName)
    const newPath = getTicketFilePath(notePathPrefix, projectTitle, safeName)
    const file = vault.getAbstractFileByPath(oldPath)

    if (!(file instanceof TFile)) {
        return safeName
    }

    await vault.rename(file, newPath)

    return safeName
}

async function deleteTicket(options: TicketByNameOptionsType): Promise<void> {
    const { name, notePathPrefix, projectTitle, vault } = options
    const path = getTicketFilePath(notePathPrefix, projectTitle, name)
    const file = vault.getAbstractFileByPath(path)

    if (!(file instanceof TFile)) {
        return
    }

    await vault.trash(file, true)
}

function formatRelativeTime(timestamp: string | null): string {
    if (!timestamp) {
        return "no updates yet"
    }

    const datePart = timestamp.slice(0, 10)
    const timePart = timestamp.slice(11)
    const isoCandidate = timePart ? `${datePart}T${timePart}:00` : `${datePart}T00:00:00`
    const entryDate = new Date(isoCandidate)

    if (Number.isNaN(entryDate.getTime())) {
        return timestamp
    }

    const diffMs = Date.now() - entryDate.getTime()
    const diffMinutes = Math.floor(diffMs / (60 * 1000))

    if (diffMinutes < 1) {
        return "just now"
    }

    if (diffMinutes < 60) {
        return `${diffMinutes}m ago`
    }

    const diffHours = Math.floor(diffMinutes / 60)

    if (diffHours < 24) {
        return `${diffHours}h ago`
    }

    const diffDays = Math.floor(diffHours / 24)

    if (diffDays < 30) {
        return `${diffDays}d ago`
    }

    const diffMonths = Math.floor(diffDays / 30)

    return `${diffMonths}mo ago`
}

export {
    addTicketEntry,
    createTicket,
    deleteTicket,
    formatRelativeTime,
    listProjectTickets,
    parseTicketFile,
    readTicket,
    renameTicket,
    serializeTicketFile,
    updateTicketEntries,
    updateTicketHidden,
    updateTicketLink,
    updateTicketStatus,
}
