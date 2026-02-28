import { setIcon } from "obsidian"

import { ICON_PICKER_ICONS } from "./icon-picker.constants"
import type { IconPickerOptionsType } from "./icon-picker.types"

export function showIconPicker(options: IconPickerOptionsType): void {
    const { currentIcon, onSelect } = options

    const overlay = document.createElement("div")

    overlay.className = "kanban-icon-picker-overlay"

    const modal = document.createElement("div")

    modal.className = "kanban-icon-picker-modal"

    const cleanup = () => {
        overlay.remove()
        modal.remove()
    }

    overlay.addEventListener("click", cleanup)

    const searchInput = document.createElement("input")

    searchInput.className = "kanban-icon-picker__search"
    searchInput.type = "text"
    searchInput.placeholder = "Search icons..."
    modal.append(searchInput)

    const grid = document.createElement("div")

    grid.className = "kanban-icon-picker__grid"
    modal.append(grid)

    const renderGrid = (filter: string) => {
        grid.empty()

        const normalizedFilter = filter.toLowerCase()
        const filteredIcons = normalizedFilter
            ? ICON_PICKER_ICONS.filter((iconName) => {
                  return iconName.includes(normalizedFilter)
              })
            : ICON_PICKER_ICONS

        for (const iconName of filteredIcons) {
            const cell = document.createElement("div")

            cell.className = "kanban-icon-picker__cell"

            if (iconName === currentIcon) {
                cell.classList.add("kanban-icon-picker__cell--active")
            }

            setIcon(cell, iconName)
            cell.title = iconName

            cell.addEventListener("click", () => {
                onSelect(iconName)
                cleanup()
            })

            grid.append(cell)
        }
    }

    renderGrid("")

    searchInput.addEventListener("input", () => {
        renderGrid(searchInput.value.trim())
    })

    const removeButton = document.createElement("div")

    removeButton.className = "kanban-icon-picker__remove"
    setIcon(removeButton, "rotate-ccw")
    removeButton.append(document.createTextNode(" Remove icon"))
    removeButton.addEventListener("click", () => {
        onSelect(null)
        cleanup()
    })
    modal.append(removeButton)

    modal.addEventListener("keydown", (keyboardEvent) => {
        if (keyboardEvent.key === "Escape") {
            cleanup()
        }
    })

    document.body.append(overlay, modal)
    searchInput.focus()
}
