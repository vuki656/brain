import { setIcon, type Vault } from "obsidian"

import type { BoardType, PluginSettingsType } from "../../shared"
import { getProjectColor, getProjectIcon } from "../project"
import { openAddTicketDialog } from "./add-ticket-dialog"
import { formatRelativeTime, listProjectTickets } from "./ticket"
import { openTicketModal } from "./ticket-modal"
import type { TicketType } from "./ticket.types"

type RenderTicketsTabOptionsType = {
    board: BoardType
    container: HTMLElement
    onMutation: (board: BoardType) => void
    pluginSettings: PluginSettingsType
    vault: Vault
}

type TicketRowOptionsType = {
    board: BoardType
    onMutation: (board: BoardType) => void
    pluginSettings: PluginSettingsType
    ticket: TicketType
    vault: Vault
}

function createTicketRow(options: TicketRowOptionsType): HTMLElement {
    const { board, onMutation, pluginSettings, ticket, vault } = options

    const row = document.createElement("div")

    row.className = "kanban-tickets__row"

    const main = document.createElement("div")

    main.className = "kanban-tickets__row-main"

    const name = document.createElement("div")

    name.className = "kanban-tickets__row-name"
    name.textContent = ticket.name
    main.append(name)

    const lastEntry = ticket.entries[0]
    const subtitle = document.createElement("div")

    subtitle.className = "kanban-tickets__row-subtitle"

    subtitle.textContent = lastEntry
        ? `${formatRelativeTime(ticket.lastUpdated)}: ${lastEntry.text}`
        : "No updates yet"

    main.append(subtitle)

    row.append(main)

    row.addEventListener("click", () => {
        openTicketModal({
            board,
            onChange: () => {
                onMutation({ ...board })
            },
            pluginSettings,
            ticket,
            vault,
        })
    })

    return row
}

function renderTicketsTab(options: RenderTicketsTabOptionsType): void {
    const { board, container, onMutation, pluginSettings, vault } = options

    container.empty()

    for (let projectIndex = 0; projectIndex < board.projects.length; projectIndex++) {
        const project = board.projects[projectIndex]

        if (!project) {
            continue
        }

        if (board.settings.archivedProjects.includes(project.title)) {
            continue
        }

        const section = document.createElement("div")

        section.className = "kanban-tickets__section"

        const header = document.createElement("div")

        header.className = "kanban-tickets__header"

        const colorDot = document.createElement("span")

        colorDot.className = "kanban-project__color-dot"
        colorDot.style.background = getProjectColor(project.title, projectIndex, board)
        header.append(colorDot)

        const projectIcon = getProjectIcon(project.title, board)

        if (projectIcon) {
            const iconSpan = document.createElement("span")

            iconSpan.className = "kanban-project__icon"
            setIcon(iconSpan, projectIcon)
            header.append(iconSpan)
        }

        const title = document.createElement("div")

        title.className = "kanban-tickets__title"
        title.textContent = project.title
        header.append(title)

        const addButton = document.createElement("span")

        addButton.className = "kanban-tickets__add"
        addButton.textContent = "+ Add ticket"
        addButton.addEventListener("click", () => {
            openAddTicketDialog({
                board,
                onCreated: () => {
                    onMutation({ ...board })
                },
                pluginSettings,
                preselectedProjectIndex: projectIndex,
                vault,
            })
        })
        header.append(addButton)

        section.append(header)

        const list = document.createElement("div")

        list.className = "kanban-tickets__list"

        const placeholder = document.createElement("div")

        placeholder.className = "kanban-tickets__empty"
        placeholder.textContent = "Loading…"
        list.append(placeholder)
        section.append(list)
        container.append(section)

        const projectTitle = project.title

        void (async () => {
            const tickets = await listProjectTickets({
                notePathPrefix: pluginSettings.notePathPrefix,
                projectTitle,
                vault,
            })

            list.empty()

            if (tickets.length === 0) {
                const empty = document.createElement("div")

                empty.className = "kanban-tickets__empty"
                empty.textContent = "No tickets yet"
                list.append(empty)

                return
            }

            for (const ticket of tickets) {
                list.append(
                    createTicketRow({
                        board,
                        onMutation,
                        pluginSettings,
                        ticket,
                        vault,
                    }),
                )
            }
        })()
    }
}

export { renderTicketsTab }
