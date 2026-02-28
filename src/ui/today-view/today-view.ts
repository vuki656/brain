// eslint-disable-next-line import-x/no-named-as-default -- SortableJS exports Sortable as both default and named
import Sortable, { type SortableEvent } from "sortablejs"

import { createCardElement, immutableUpdateCard } from "../card"
import { createProjectElement, getProjectColor, getProjectIcon } from "../project"
import { openQuickAddDialog } from "../quick-add"
import { createCardSortableOptions, createProjectCardMoveHandler } from "../sortable"
import type { TodayViewOptionsType } from "./today-view.types"
import {
    collectCardsByDateGroup,
    collectTodayOrderFromSections,
    formatDateGroupSubtitle,
    getDateForSection,
} from "./today-view.utils"

export function renderTodayView(options: TodayViewOptionsType): Sortable[] {
    const { board, container, onMutation, pluginSettings, vault, viewState } = options
    const dateGroups = collectCardsByDateGroup(board)
    const todayPanel = document.createElement("div")

    todayPanel.className = "kanban-today"

    const sortableInstances: Sortable[] = []
    const sectionCardLists: { dateKey: string; element: HTMLElement }[] = []

    for (const group of dateGroups) {
        const section = document.createElement("div")

        section.className = "kanban-today__section"

        if (group.dateKey === "overdue") {
            section.classList.add("kanban-today__section--overdue")
        }

        const header = document.createElement("div")

        header.className = "kanban-today__header"

        const title = document.createElement("div")

        title.className = "kanban-today__title"

        if (group.dateKey === "overdue") {
            title.classList.add("kanban-today__title--overdue")
        }

        title.textContent = group.label

        const count = document.createElement("span")

        count.className = "kanban-today__count"
        count.textContent = String(group.cards.length)

        header.append(title, count)

        const subtitle = formatDateGroupSubtitle(group.dateKey)

        if (subtitle) {
            const subtitleSpan = document.createElement("span")

            subtitleSpan.className = "kanban-today__title-date"
            subtitleSpan.textContent = subtitle
            header.append(subtitleSpan)
        }

        if (group.dateKey !== "overdue") {
            const addButton = document.createElement("span")

            addButton.className = "kanban-today__add-button"
            addButton.textContent = "+"
            addButton.addEventListener("click", () => {
                openQuickAddDialog({
                    board,
                    onMutation,
                    prefillDate: getDateForSection(group.dateKey),
                })
            })
            header.append(addButton)
        }

        section.append(header)

        const cardListElement = document.createElement("div")

        cardListElement.className = "kanban-today__cards"
        cardListElement.dataset.dateKey = group.dateKey

        for (const todayCard of group.cards) {
            const pill = {
                color: getProjectColor(todayCard.projectTitle, todayCard.projectIndex, board),
                icon: getProjectIcon(todayCard.projectTitle, board),
                title: todayCard.projectTitle,
            }

            const cardElement = createCardElement({
                board,
                card: todayCard.card,
                cardIndex: todayCard.cardIndex,
                onMutation,
                pluginSettings,
                projectIndex: todayCard.projectIndex,
                projectPill: pill,
                vault,
            })

            cardListElement.append(cardElement)
        }

        if (group.cards.length === 0) {
            const emptyMessage = document.createElement("div")

            emptyMessage.className = "kanban-today__empty"
            emptyMessage.textContent = "No tasks for today"
            cardListElement.append(emptyMessage)
        }

        section.append(cardListElement)
        todayPanel.append(section)
        sectionCardLists.push({ dateKey: group.dateKey, element: cardListElement })
    }

    const layout = document.createElement("div")

    layout.className = "kanban-today-layout"
    layout.append(todayPanel)

    const projectsPanel = document.createElement("div")

    projectsPanel.className = "kanban-today-layout__projects"

    for (let projectIndex = 0; projectIndex < board.projects.length; projectIndex++) {
        const project = board.projects[projectIndex]

        if (!project) {
            continue
        }

        const projectElement = createProjectElement({
            board,
            onMutation,
            pluginSettings,
            project,
            projectIndex,
            vault,
            viewState,
        })

        projectsPanel.append(projectElement)
    }

    layout.append(projectsPanel)
    container.append(layout)

    for (const { element: cardListElement } of sectionCardLists) {
        const sectionSortable = Sortable.create(
            cardListElement,
            createCardSortableOptions((sortableEvent: SortableEvent) => {
                const targetDateKey = sortableEvent.to.dataset.dateKey
                const sourceDateKey = sortableEvent.from.dataset.dateKey
                const cardId = sortableEvent.item.dataset.cardId
                const movedCardIndex = Number(sortableEvent.item.dataset.cardIndex)
                const movedProjectIndex = Number(sortableEvent.item.dataset.projectIndex)

                if (cardId && targetDateKey && sourceDateKey !== targetDateKey) {
                    const targetDate = getDateForSection(targetDateKey)

                    if (targetDate) {
                        const newProjects = immutableUpdateCard({
                            cardIndex: movedCardIndex,
                            projectIndex: movedProjectIndex,
                            projects: board.projects,
                            update: { date: targetDate },
                        })

                        const newTodayOrder = collectTodayOrderFromSections(sectionCardLists)

                        onMutation({
                            ...board,
                            projects: newProjects,
                            settings: { ...board.settings, todayOrder: newTodayOrder },
                        })

                        return
                    }
                }

                const newTodayOrder = collectTodayOrderFromSections(sectionCardLists)

                onMutation({
                    ...board,
                    settings: { ...board.settings, todayOrder: newTodayOrder },
                })
            }, "kanban-today-cards"),
        )

        sortableInstances.push(sectionSortable)
    }

    const cardLists = projectsPanel.querySelectorAll<HTMLElement>(".kanban-project__cards")

    for (const cardList of Array.from(cardLists)) {
        const instance = Sortable.create(
            cardList,
            createCardSortableOptions(createProjectCardMoveHandler(board, onMutation)),
        )

        sortableInstances.push(instance)
    }

    return sortableInstances
}
