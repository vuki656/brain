import { Notice, setIcon } from "obsidian"

import { openQuickAddDialog } from "../quick-add"
import { selfUpdate } from "../../plugin/self-update"

import type { ToolbarOptionsType } from "./toolbar.types"

export function setButtonContent(button: HTMLElement, iconName: string, label: string): void {
    button.empty()

    const iconSpan = button.createSpan({ cls: "kanban-toolbar__button-icon" })

    setIcon(iconSpan, iconName)

    button.createSpan({ text: label })
}

export function createToolbar(options: ToolbarOptionsType): HTMLElement {
    const { app, board, onMutation, onViewStateChange, viewState } = options
    const toolbar = document.createElement("div")

    toolbar.className = "kanban-toolbar"

    const addTaskButton = document.createElement("button")

    addTaskButton.className = "kanban-toolbar__button"
    setButtonContent(addTaskButton, "plus", "Add task")
    addTaskButton.addEventListener("click", () => {
        openQuickAddDialog({ board, onMutation })
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

    const toolbarSpacer = document.createElement("div")

    toolbarSpacer.className = "kanban-toolbar__spacer"

    const pluginManifest = (app as any).plugins.plugins["obsidian-vuki-kanban"]?.manifest
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

    toolbar.append(addTaskButton, todayButton, hideCompletedButton, toolbarSpacer, versionLabel, updateButton)

    return toolbar
}
