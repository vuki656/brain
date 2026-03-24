// eslint-disable-next-line import-x/no-named-as-default -- SortableJS exports Sortable as both default and named
import Sortable, { type SortableEvent } from "sortablejs"

import type { CardType } from "../../shared"
import { createCardElement, immutableUpdateCard } from "../card"
import { renderFocusTimer } from "../focus-timer"
import { createProjectElement, getProjectColor, getProjectIcon } from "../project"
import { openQuickAddDialog } from "../quick-add"
import { createCardSortableOptions, createProjectCardMoveHandler } from "../sortable"
import { parseWeatherLocation, renderWeatherSection } from "../weather"
import type { TodayViewOptionsType } from "./today-view.types"
import {
    collectCardsByDateGroup,
    collectTodayOrderFromSections,
    formatDateGroupSubtitle,
    getDateForSection,
} from "./today-view.utils"

function isTodayOrderChanged(
    current: Partial<Record<string, string[]>>,
    cleaned: Record<string, string[]>,
): boolean {
    const currentKeys = Object.keys(current).sort((first, second) => {
        return first.localeCompare(second)
    })
    const cleanedKeys = Object.keys(cleaned).sort((first, second) => {
        return first.localeCompare(second)
    })

    if (currentKeys.length !== cleanedKeys.length) {
        return true
    }

    for (const [index, key] of currentKeys.entries()) {
        if (key !== cleanedKeys[index]) {
            return true
        }

        const currentIds = current[key] ?? []
        const cleanedIds = cleaned[key] ?? []

        if (currentIds.length !== cleanedIds.length) {
            return true
        }

        for (const [idIndex, currentId] of currentIds.entries()) {
            if (currentId !== cleanedIds[idIndex]) {
                return true
            }
        }
    }

    return false
}

export function renderTodayView(options: TodayViewOptionsType): Sortable[] {
    const {
        board,
        container,
        onMutation,
        onPluginSettingsChange,
        pluginSettings,
        vault,
        viewState,
    } = options
    const { cleanedTodayOrder, groups: dateGroups } = collectCardsByDateGroup(board)

    if (isTodayOrderChanged(board.settings.todayOrder, cleanedTodayOrder)) {
        queueMicrotask(() => {
            onMutation({
                ...board,
                settings: { ...board.settings, todayOrder: cleanedTodayOrder },
            })
        })
    }

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

        if (group.dateKey === "backlog") {
            section.classList.add("kanban-today__section--backlog")
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

        if (group.dateKey !== "overdue" && group.dateKey !== "backlog") {
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
            emptyMessage.textContent =
                group.dateKey === "backlog" ? "No backlog tasks" : "No tasks for today"
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

    const weatherLocation = parseWeatherLocation(
        pluginSettings.weatherLatitude,
        pluginSettings.weatherLongitude,
    )

    if (weatherLocation) {
        const weatherContainer = document.createElement("div")

        weatherContainer.className = "kanban-weather-container"
        projectsPanel.append(weatherContainer)
        void renderWeatherSection(weatherContainer, weatherLocation)
    }

    const focusTimerContainer = document.createElement("div")

    focusTimerContainer.className = "kanban-focus-timer-container"
    projectsPanel.append(focusTimerContainer)

    renderFocusTimer({
        board,
        container: focusTimerContainer,
        focusTimerState: pluginSettings.focusTimer,
        onFocusTimerStateChange: (newState) => {
            onPluginSettingsChange({ ...pluginSettings, focusTimer: newState })
        },
    })

    for (let projectIndex = 0; projectIndex < board.projects.length; projectIndex++) {
        const project = board.projects[projectIndex]

        if (!project) {
            continue
        }

        if (board.settings.archivedProjects.includes(project.title)) {
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
                    if (targetDateKey === "backlog") {
                        const newProjects = immutableUpdateCard({
                            cardIndex: movedCardIndex,
                            projectIndex: movedProjectIndex,
                            projects: board.projects,
                            update: { backlog: true, date: null },
                        })

                        const newTodayOrder = collectTodayOrderFromSections(sectionCardLists)

                        onMutation({
                            ...board,
                            projects: newProjects,
                            settings: { ...board.settings, todayOrder: newTodayOrder },
                        })

                        return
                    }

                    const targetDate = getDateForSection(targetDateKey)
                    const update: Partial<CardType> =
                        sourceDateKey === "backlog"
                            ? { backlog: false, date: targetDate }
                            : { date: targetDate }

                    if (targetDate) {
                        const newProjects = immutableUpdateCard({
                            cardIndex: movedCardIndex,
                            projectIndex: movedProjectIndex,
                            projects: board.projects,
                            update,
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
