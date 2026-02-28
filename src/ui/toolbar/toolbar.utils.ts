import { setIcon } from "obsidian"

export function setButtonContent(button: HTMLElement, iconName: string, label: string): void {
    button.empty()

    const iconSpan = button.createSpan({ cls: "kanban-toolbar__button-icon" })

    setIcon(iconSpan, iconName)

    button.createSpan({ text: label })
}
