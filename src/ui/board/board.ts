// eslint-disable-next-line import-x/no-named-as-default -- SortableJS exports Sortable as both default and named
import Sortable, { type SortableEvent } from "sortablejs"

import { createAddProjectButton, createProjectElement } from "../project"
import { createCardSortableOptions, createProjectCardMoveHandler } from "../sortable"
import { renderTodayView } from "../today-view"
import { createToolbar } from "../toolbar"
import type { BoardProjectsOptionsType, RenderBoardOptionsType } from "./board.types"

function renderBoardProjects(options: BoardProjectsOptionsType): Sortable[] {
    const { board, container, onMutation, pluginSettings, vault, viewState } = options
    const boardElement = document.createElement("div")

    boardElement.className = "kanban-board"
    container.append(boardElement)

    const visibleProjectIndices: number[] = []

    for (let projectIndex = 0; projectIndex < board.projects.length; projectIndex++) {
        const project = board.projects[projectIndex]

        if (!project) {
            continue
        }

        if (board.settings.archivedProjects.includes(project.title)) {
            continue
        }

        visibleProjectIndices.push(projectIndex)

        const projectElement = createProjectElement({
            board,
            onMutation,
            pluginSettings,
            project,
            projectIndex,
            vault,
            viewState,
        })

        boardElement.append(projectElement)
    }

    boardElement.append(createAddProjectButton(board, onMutation))

    const sortableInstances: Sortable[] = []

    const projectSortable = Sortable.create(boardElement, {
        animation: 150,
        draggable: ".kanban-project",
        fallbackClass: "kanban-project--dragging",
        fallbackOnBody: true,
        forceFallback: true,
        ghostClass: "kanban-project--ghost",
        handle: ".kanban-project__drag-handle",
        onEnd: (sortableEvent: SortableEvent) => {
            const { newIndex, oldIndex } = sortableEvent

            if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) {
                return
            }

            const actualOldIndex = visibleProjectIndices[oldIndex]
            const actualNewIndex = visibleProjectIndices[newIndex]

            if (actualOldIndex === undefined || actualNewIndex === undefined) {
                return
            }

            const newProjects = [...board.projects]
            const [moved] = newProjects.splice(actualOldIndex, 1)

            if (!moved) {
                return
            }

            newProjects.splice(actualNewIndex, 0, moved)
            onMutation({ ...board, projects: newProjects })
        },
    })

    sortableInstances.push(projectSortable)

    const cardLists = boardElement.querySelectorAll<HTMLElement>(".kanban-project__cards")

    for (const cardList of Array.from(cardLists)) {
        const instance = Sortable.create(
            cardList,
            createCardSortableOptions(createProjectCardMoveHandler(board, onMutation)),
        )

        sortableInstances.push(instance)
    }

    return sortableInstances
}

function renderBoard(options: RenderBoardOptionsType): Sortable[] {
    const {
        app,
        board,
        container,
        onMutation,
        onViewStateChange,
        pluginSettings,
        vault,
        viewState,
    } = options
    const previousBoard = container.querySelector(".kanban-board")
    const savedScrollLeft = previousBoard ? previousBoard.scrollLeft : 0

    const previousTodayList = container.querySelector(".kanban-today")
    const savedTodayScroll = previousTodayList ? previousTodayList.scrollTop : 0

    const previousProjectsPanel = container.querySelector(".kanban-today-layout__projects")
    const savedProjectsPanelScroll = previousProjectsPanel ? previousProjectsPanel.scrollTop : 0

    container.style.visibility = "hidden"
    container.empty()

    if (viewState.hideCompletedActive) {
        container.dataset.hideCompleted = "true"
    } else {
        delete container.dataset.hideCompleted
    }

    const toolbar = createToolbar({ app, board, onMutation, onViewStateChange, viewState })

    container.append(toolbar)

    if (viewState.todayFilterActive) {
        const sortableInstances = renderTodayView({
            board,
            container,
            onMutation,
            pluginSettings,
            vault,
            viewState,
        })
        const newTodayList = container.querySelector(".kanban-today")
        const newProjectsPanel = container.querySelector(".kanban-today-layout__projects")

        if (newTodayList) {
            newTodayList.scrollTop = savedTodayScroll
        }

        if (newProjectsPanel) {
            newProjectsPanel.scrollTop = savedProjectsPanelScroll
        }

        container.style.visibility = ""

        return sortableInstances
    }

    const sortableInstances = renderBoardProjects({
        board,
        container,
        onMutation,
        pluginSettings,
        vault,
        viewState,
    })
    const newBoard = container.querySelector(".kanban-board")

    if (newBoard) {
        newBoard.scrollLeft = savedScrollLeft
    }

    container.style.visibility = ""

    return sortableInstances
}

export { renderBoard }
