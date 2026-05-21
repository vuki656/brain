import { Menu, Notice, setIcon } from "obsidian"

import type { BoardType, ProjectType } from "../../shared"
import { PROJECT_COLOR_LABELS, PROJECT_COLORS } from "../../shared"
import { createAddCardForm, createCardElement } from "../card"
import { showIconPicker } from "../icon-picker"
import { startInlineEdit } from "../inline-edit"
import {
    extractTicketId,
    listProjectTickets,
    openAddTicketDialog,
    openTicketModal,
} from "../ticket"
import type { ProjectElementOptionsType } from "./project.types"
import { getProjectColor, getProjectIcon } from "./project.utils"

type MutationHandlerType = (board: BoardType) => void

export function createProjectElement(options: ProjectElementOptionsType): HTMLElement {
    const { board, onMutation, pluginSettings, project, projectIndex, vault, viewState } = options
    const isCollapsed = board.settings.collapsedProjects.includes(project.title)
    const projectElement = document.createElement("div")

    projectElement.className = "kanban-project"
    projectElement.dataset.projectIndex = String(projectIndex)

    if (isCollapsed) {
        projectElement.classList.add("kanban-project--collapsed")
        projectElement.addEventListener("click", () => {
            const newCollapsed = board.settings.collapsedProjects.filter((name) => {
                return name !== project.title
            })

            onMutation({
                ...board,
                settings: { ...board.settings, collapsedProjects: newCollapsed },
            })
        })
    }

    const header = document.createElement("div")

    header.className = "kanban-project__header"

    const titleElement = document.createElement("div")

    titleElement.className = "kanban-project__title"
    titleElement.textContent = project.title

    titleElement.addEventListener("dblclick", () => {
        startInlineEdit(titleElement, project.title, (newTitle) => {
            const wasCollapsed = board.settings.collapsedProjects.includes(project.title)
            const wasArchived = board.settings.archivedProjects.includes(project.title)
            const newProjects = board.projects.map((proj, index) => {
                return index === projectIndex ? { ...proj, title: newTitle } : proj
            })
            let newCollapsedProjects = [...board.settings.collapsedProjects]
            let newArchivedProjects = [...board.settings.archivedProjects]

            if (wasCollapsed) {
                newCollapsedProjects = newCollapsedProjects.map((name) => {
                    return name === project.title ? newTitle : name
                })
            }

            if (wasArchived) {
                newArchivedProjects = newArchivedProjects.map((name) => {
                    return name === project.title ? newTitle : name
                })
            }

            onMutation({
                ...board,
                projects: newProjects,
                settings: {
                    ...board.settings,
                    archivedProjects: newArchivedProjects,
                    collapsedProjects: newCollapsedProjects,
                },
            })
        })
    })

    const visibleCardCount = viewState.hideCompletedActive
        ? project.cards.filter((card) => {
              return !card.completed
          }).length
        : project.cards.length

    const countBadge = document.createElement("span")

    countBadge.className = "kanban-project__count"
    countBadge.textContent = String(visibleCardCount)

    const dragHandle = document.createElement("span")

    dragHandle.className = "kanban-project__drag-handle"
    setIcon(dragHandle, "grip-vertical")

    const colorDot = document.createElement("span")

    colorDot.className = "kanban-project__color-dot"
    colorDot.style.background = getProjectColor(project.title, projectIndex, board)

    const projectIcon = getProjectIcon(project.title, board)

    if (projectIcon) {
        const iconSpan = document.createElement("span")

        iconSpan.className = "kanban-project__icon"
        setIcon(iconSpan, projectIcon)
        header.append(dragHandle, colorDot, iconSpan, titleElement, countBadge)
    } else {
        header.append(dragHandle, colorDot, titleElement, countBadge)
    }

    header.addEventListener("contextmenu", (headerEvent) => {
        headerEvent.preventDefault()

        const menu = new Menu()

        menu.addItem((item) => {
            return item
                .setIcon("ticket")
                .setTitle("Add ticket")
                .onClick(() => {
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
        })

        menu.addItem((item) => {
            return item
                .setIcon("eye-off")
                .setTitle("Hide project")
                .onClick(() => {
                    const newCollapsed = [...board.settings.collapsedProjects, project.title]

                    onMutation({
                        ...board,
                        settings: { ...board.settings, collapsedProjects: newCollapsed },
                    })
                })
        })

        menu.addItem((item) => {
            return item
                .setIcon("archive")
                .setTitle("Archive project")
                .onClick(() => {
                    const newArchived = [...board.settings.archivedProjects, project.title]

                    onMutation({
                        ...board,
                        settings: { ...board.settings, archivedProjects: newArchived },
                    })
                })
        })

        menu.addItem((item) => {
            return item
                .setIcon("palette")
                .setTitle("Color")
                .onClick((colorMenuEvent) => {
                    const colorMenu = new Menu()

                    for (const color of PROJECT_COLORS) {
                        const label = PROJECT_COLOR_LABELS[color] ?? color
                        const isActive = board.settings.projectColors[project.title] === color

                        colorMenu.addItem((colorItem) => {
                            const fragment = document.createDocumentFragment()
                            const dot = document.createElement("span")

                            dot.className = "kanban-menu__color-dot"
                            dot.style.background = color

                            const text = document.createElement("span")

                            text.textContent = label

                            fragment.append(dot, text)

                            colorItem.setTitle(fragment)

                            if (isActive) {
                                colorItem.setChecked(true)
                            }

                            colorItem.onClick(() => {
                                const newProjectColors = {
                                    ...board.settings.projectColors,
                                    [project.title]: color,
                                }

                                onMutation({
                                    ...board,
                                    settings: {
                                        ...board.settings,
                                        projectColors: newProjectColors,
                                    },
                                })
                            })
                        })
                    }

                    colorMenu.addSeparator()

                    colorMenu.addItem((colorItem) => {
                        return colorItem
                            .setIcon("rotate-ccw")
                            .setTitle("Reset color")
                            .onClick(() => {
                                const { [project.title]: _removedColor, ...remainingColors } =
                                    board.settings.projectColors

                                onMutation({
                                    ...board,
                                    settings: { ...board.settings, projectColors: remainingColors },
                                })
                            })
                    })

                    colorMenu.showAtMouseEvent(colorMenuEvent as MouseEvent)
                })
        })

        menu.addItem((item) => {
            return item
                .setIcon("smile")
                .setTitle("Icon")
                .onClick(() => {
                    showIconPicker({
                        currentIcon: getProjectIcon(project.title, board),
                        onSelect: (iconName) => {
                            if (iconName === null) {
                                const { [project.title]: _removed, ...remainingIcons } =
                                    board.settings.projectIcons

                                onMutation({
                                    ...board,
                                    settings: { ...board.settings, projectIcons: remainingIcons },
                                })
                            } else {
                                const newProjectIcons = {
                                    ...board.settings.projectIcons,
                                    [project.title]: iconName,
                                }

                                onMutation({
                                    ...board,
                                    settings: { ...board.settings, projectIcons: newProjectIcons },
                                })
                            }
                        },
                    })
                })
        })

        menu.addSeparator()

        menu.addItem((item) => {
            return item
                .setIcon("trash-2")
                .setTitle("Delete project")
                .setWarning(true)
                .onClick(() => {
                    if (project.cards.length > 0) {
                        new Notice("Cannot delete a project that still has cards.")

                        return
                    }

                    const newProjects = board.projects.filter((_project, index) => {
                        return index !== projectIndex
                    })
                    const newCollapsed = board.settings.collapsedProjects.filter((name) => {
                        return name !== project.title
                    })
                    const newArchived = board.settings.archivedProjects.filter((name) => {
                        return name !== project.title
                    })

                    onMutation({
                        ...board,
                        projects: newProjects,
                        settings: {
                            ...board.settings,
                            archivedProjects: newArchived,
                            collapsedProjects: newCollapsed,
                        },
                    })
                })
        })

        menu.showAtMouseEvent(headerEvent)
    })

    projectElement.append(header)

    if (!isCollapsed) {
        const inProgressSection = document.createElement("div")

        inProgressSection.className = "kanban-project__in-progress"
        inProgressSection.style.display = "none"
        projectElement.append(inProgressSection)

        const projectTitle = project.title

        void (async () => {
            const tickets = await listProjectTickets({
                notePathPrefix: pluginSettings.notePathPrefix,
                projectTitle,
                vault,
            })
            const inProgressTickets = tickets.filter((ticket) => {
                return !ticket.hidden && ticket.status === "in-progress"
            })

            if (inProgressTickets.length === 0) {
                return
            }

            inProgressSection.style.display = ""

            for (const ticket of inProgressTickets) {
                const row = document.createElement("div")

                row.className = "kanban-project__in-progress-row"

                const idMatch = extractTicketId(ticket.link)
                const badge = document.createElement("span")

                badge.className =
                    "kanban-project__in-progress-badge kanban-project__in-progress-badge--in-progress"
                badge.textContent = idMatch ? idMatch.id : "WIP"
                badge.title = idMatch ? `${idMatch.source}: ${idMatch.id}` : "In progress"
                row.append(badge)

                const name = document.createElement("span")

                name.className = "kanban-project__in-progress-name"
                name.textContent = ticket.name
                row.append(name)

                row.addEventListener("click", (clickEvent) => {
                    clickEvent.stopPropagation()
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

                inProgressSection.append(row)
            }
        })()

        const cardList = document.createElement("div")

        cardList.className = "kanban-project__cards"
        cardList.dataset.projectIndex = String(projectIndex)

        const sortedCardIndices = project.cards
            .map((_card, index) => {
                return index
            })
            .sort((indexA, indexB) => {
                const completedA = (project.cards[indexA]?.completed ?? false) ? 1 : 0
                const completedB = (project.cards[indexB]?.completed ?? false) ? 1 : 0

                return completedA - completedB
            })

        for (const cardIndex of sortedCardIndices) {
            const card = project.cards[cardIndex]

            if (!card) {
                continue
            }

            cardList.append(
                createCardElement({
                    board,
                    card,
                    cardIndex,
                    onMutation,
                    pluginSettings,
                    projectIndex,
                    projectPill: null,
                    vault,
                }),
            )
        }

        projectElement.append(cardList)
        projectElement.append(createAddCardForm(projectIndex, board, onMutation))
    }

    return projectElement
}

export function createAddProjectButton(
    board: BoardType,
    onMutation: MutationHandlerType,
): HTMLElement {
    const button = document.createElement("button")

    button.className = "kanban-add-project__button"
    button.textContent = "+ Add project"
    button.addEventListener("click", () => {
        const name = "New Project"
        const newProject: ProjectType = { cards: [], title: name }

        onMutation({
            ...board,
            projects: [...board.projects, newProject],
        })
    })

    return button
}
