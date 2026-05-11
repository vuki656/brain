import { setIcon, type Vault } from "obsidian"
// eslint-disable-next-line import-x/no-named-as-default -- SortableJS exports Sortable as both default and named
import Sortable from "sortablejs"

import type { BoardType, PluginSettingsType } from "../../shared"
import { getProjectColor, getProjectIcon } from "../project"
import { openAddTicketDialog } from "./add-ticket-dialog"
import { formatRelativeTime, listProjectTickets } from "./ticket"
import { openTicketModal } from "./ticket-modal"
import { extractTicketId } from "./ticket-providers"
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

function sortTicketsByOrder(tickets: TicketType[], savedOrder: string[]): TicketType[] {
    if (savedOrder.length === 0) {
        return tickets
    }

    const byName = new Map(
        tickets.map((ticket) => {
            return [ticket.name, ticket]
        }),
    )
    const ordered: TicketType[] = []
    const seen = new Set<string>()

    for (const name of savedOrder) {
        const ticket = byName.get(name)

        if (ticket) {
            ordered.push(ticket)
            seen.add(name)
        }
    }

    for (const ticket of tickets) {
        if (!seen.has(ticket.name)) {
            ordered.push(ticket)
        }
    }

    return ordered
}

function createTicketRow(options: TicketRowOptionsType): HTMLElement {
    const { board, onMutation, pluginSettings, ticket, vault } = options

    const row = document.createElement("div")

    row.className = "kanban-tickets__row"
    row.dataset.ticketName = ticket.name

    const dragHandle = document.createElement("span")

    dragHandle.className = "kanban-tickets__row-drag"
    setIcon(dragHandle, "grip-vertical")
    row.append(dragHandle)

    const main = document.createElement("div")

    main.className = "kanban-tickets__row-main"

    const nameRow = document.createElement("div")

    nameRow.className = "kanban-tickets__row-name-row"

    const idMatch = extractTicketId(ticket.link)
    const statusClassByStatus: Record<Exclude<TicketType["status"], null>, string> = {
        done: "kanban-tickets__row-id--done",
        mine: "kanban-tickets__row-id--mine",
        waiting: "kanban-tickets__row-id--waiting",
    }
    const statusLabelByStatus: Record<Exclude<TicketType["status"], null>, string> = {
        done: "done",
        mine: "my turn",
        waiting: "waiting",
    }
    const fallbackBadgeText: Record<Exclude<TicketType["status"], null>, string> = {
        done: "DONE",
        mine: "MINE",
        waiting: "WAIT",
    }
    const fallbackBadgeTitle: Record<Exclude<TicketType["status"], null>, string> = {
        done: "Done",
        mine: "My turn",
        waiting: "Waiting",
    }

    const statusClass = ticket.status ? statusClassByStatus[ticket.status] : ""
    const statusLabel = ticket.status ? statusLabelByStatus[ticket.status] : ""

    if (idMatch) {
        const idBadge = document.createElement("span")
        const baseTitle = `${idMatch.source}: ${idMatch.id}`
        const titleSuffix = statusLabel ? ` · ${statusLabel}` : ""

        idBadge.className = `kanban-tickets__row-id ${statusClass}`.trim()
        idBadge.textContent = idMatch.id
        idBadge.title = `${baseTitle}${titleSuffix}`
        nameRow.append(idBadge)
    } else if (ticket.status) {
        const statusDot = document.createElement("span")

        statusDot.className = `kanban-tickets__row-id ${statusClass}`.trim()
        statusDot.textContent = fallbackBadgeText[ticket.status]
        statusDot.title = fallbackBadgeTitle[ticket.status]
        nameRow.append(statusDot)
    }

    if (ticket.status === "done") {
        row.classList.add("kanban-tickets__row--done")
    }

    const name = document.createElement("div")

    name.className = "kanban-tickets__row-name"
    name.textContent = ticket.name
    nameRow.append(name)
    main.append(nameRow)

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

            const savedOrder = board.settings.ticketOrder[projectTitle] ?? []
            const orderedTickets = sortTicketsByOrder(tickets, savedOrder)
            const activeTickets = orderedTickets.filter((ticket) => {
                return ticket.status !== "done"
            })
            const doneTickets = orderedTickets.filter((ticket) => {
                return ticket.status === "done"
            })

            if (activeTickets.length === 0 && doneTickets.length === 0) {
                const empty = document.createElement("div")

                empty.className = "kanban-tickets__empty"
                empty.textContent = "No tickets yet"
                list.append(empty)

                return
            }

            if (activeTickets.length === 0) {
                const empty = document.createElement("div")

                empty.className = "kanban-tickets__empty"
                empty.textContent = "No active tickets"
                list.append(empty)
            }

            for (const ticket of activeTickets) {
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

            list.dataset.projectTitle = projectTitle
            Sortable.create(list, {
                animation: 150,
                fallbackOnBody: true,
                handle: ".kanban-tickets__row-drag",
                onEnd: () => {
                    const orderIds: string[] = []
                    const rowElements = list.querySelectorAll<HTMLElement>(
                        ".kanban-tickets__row:not(.kanban-tickets__row--done)",
                    )

                    for (const rowElement of Array.from(rowElements)) {
                        const ticketName = rowElement.dataset.ticketName

                        if (ticketName) {
                            orderIds.push(ticketName)
                        }
                    }

                    const doneNames = doneTickets.map((ticket) => {
                        return ticket.name
                    })

                    onMutation({
                        ...board,
                        settings: {
                            ...board.settings,
                            ticketOrder: {
                                ...board.settings.ticketOrder,
                                [projectTitle]: [...orderIds, ...doneNames],
                            },
                        },
                    })
                },
            })

            if (doneTickets.length === 0) {
                return
            }

            const doneSection = document.createElement("div")

            doneSection.className = "kanban-tickets__done"

            const doneToggle = document.createElement("div")

            doneToggle.className = "kanban-tickets__done-toggle"

            const doneCaret = document.createElement("span")

            doneCaret.className = "kanban-tickets__done-caret"
            setIcon(doneCaret, "chevron-right")
            doneToggle.append(doneCaret)

            const doneLabel = document.createElement("span")

            doneLabel.className = "kanban-tickets__done-label"
            doneLabel.textContent = `${doneTickets.length} done`
            doneToggle.append(doneLabel)

            const doneList = document.createElement("div")

            doneList.className = "kanban-tickets__done-list"
            doneList.style.display = "none"

            for (const ticket of doneTickets) {
                doneList.append(
                    createTicketRow({
                        board,
                        onMutation,
                        pluginSettings,
                        ticket,
                        vault,
                    }),
                )
            }

            doneToggle.addEventListener("click", () => {
                const isHidden = doneList.style.display === "none"

                doneList.style.display = isHidden ? "" : "none"
                doneSection.classList.toggle("kanban-tickets__done--open", isHidden)
                setIcon(doneCaret, isHidden ? "chevron-down" : "chevron-right")
            })

            doneSection.append(doneToggle, doneList)
            section.append(doneSection)
        })()
    }
}

export { renderTicketsTab }
