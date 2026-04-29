import { Menu, Notice } from "obsidian"

import { selfUpdate } from "../../plugin/self-update"
import { openQuickAddDialog } from "../quick-add"
import type { ToolbarOptionsType } from "./toolbar.types"
import { setButtonContent } from "./toolbar.utils"

export function createToolbar(options: ToolbarOptionsType): HTMLElement {
    const { app, board, onMutation, onViewStateChange, pluginSettings, viewState } = options
    const toolbar = document.createElement("div")

    toolbar.className = "kanban-toolbar"

    const addTaskButton = document.createElement("button")

    addTaskButton.className = "kanban-toolbar__button"
    setButtonContent(addTaskButton, "plus", "Add task")
    addTaskButton.addEventListener("click", () => {
        openQuickAddDialog({ board, onMutation, pluginSettings, vault: app.vault })
    })

    const todayButton = document.createElement("button")

    todayButton.className = "kanban-toolbar__button"

    if (viewState.todayFilterActive) {
        todayButton.classList.add("kanban-toolbar__button--active")
    }

    setButtonContent(todayButton, viewState.todayFilterActive ? "calendar-check" : "sun", "Today")
    todayButton.addEventListener("click", () => {
        onViewStateChange({ ...viewState, todayFilterActive: !viewState.todayFilterActive })
    })

    const hideCompletedButton = document.createElement("button")

    hideCompletedButton.className = "kanban-toolbar__button"

    if (viewState.hideCompletedActive) {
        hideCompletedButton.classList.add("kanban-toolbar__button--active")
    }

    setButtonContent(
        hideCompletedButton,
        viewState.hideCompletedActive ? "eye-off" : "eye",
        "Hide completed",
    )
    hideCompletedButton.addEventListener("click", () => {
        onViewStateChange({ ...viewState, hideCompletedActive: !viewState.hideCompletedActive })
    })

    const archivedCount = board.settings.archivedProjects.length
    let archivedButton: HTMLElement | null = null

    if (archivedCount > 0) {
        archivedButton = document.createElement("button")
        archivedButton.className = "kanban-toolbar__button"
        setButtonContent(archivedButton, "archive", `Archived (${archivedCount})`)
        archivedButton.addEventListener("click", (clickEvent) => {
            const menu = new Menu()

            for (const archivedTitle of board.settings.archivedProjects) {
                menu.addItem((item) => {
                    return item
                        .setIcon("archive-restore")
                        .setTitle(archivedTitle)
                        .onClick(() => {
                            const newArchived = board.settings.archivedProjects.filter((name) => {
                                return name !== archivedTitle
                            })

                            onMutation({
                                ...board,
                                settings: { ...board.settings, archivedProjects: newArchived },
                            })
                        })
                })
            }

            menu.showAtMouseEvent(clickEvent as MouseEvent)
        })
    }

    const toolbarSpacer = document.createElement("div")

    toolbarSpacer.className = "kanban-toolbar__spacer"

    const pluginManifest = app.plugins.plugins["obsidian-vuki-kanban"]?.manifest
    const versionLabel = document.createElement("span")

    versionLabel.className = "kanban-toolbar__version"
    versionLabel.textContent = pluginManifest ? `v${pluginManifest.version}` : ""

    const updateButton = document.createElement("button")

    updateButton.className = "kanban-toolbar__button"
    setButtonContent(updateButton, "download", "Update")
    updateButton.addEventListener("click", async () => {
        setButtonContent(updateButton, "loader-2", "Updating...")
        updateButton.disabled = true

        try {
            await selfUpdate(app)
        } catch (error) {
            new Notice(`Update failed: ${error}`)
        }

        setButtonContent(updateButton, "download", "Update")
        updateButton.disabled = false
    })

    const toolbarButtons: HTMLElement[] = [addTaskButton, todayButton, hideCompletedButton]

    if (archivedButton) {
        toolbarButtons.push(archivedButton)
    }

    toolbarButtons.push(toolbarSpacer, versionLabel, updateButton)
    toolbar.append(...toolbarButtons)

    return toolbar
}
