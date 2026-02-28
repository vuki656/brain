export function startInlineEdit(
    element: HTMLElement,
    currentValue: string,
    onConfirm: (newValue: string) => void,
): void {
    const input = document.createElement("input")

    input.type = "text"
    input.className = "kanban-inline-edit"
    input.value = currentValue

    const originalChildren: Node[] = []

    while (element.firstChild) {
        const child = element.firstChild

        child.remove()
        originalChildren.push(child)
    }

    element.append(input)
    input.focus()
    input.select()

    const restoreOriginal = () => {
        input.remove()

        for (const child of originalChildren) {
            element.append(child)
        }
    }

    const commit = () => {
        const newValue = input.value.trim()

        if (newValue && newValue !== currentValue) {
            onConfirm(newValue)
        } else {
            restoreOriginal()
        }
    }

    input.addEventListener("blur", commit)
    input.addEventListener("keydown", (keyboardEvent) => {
        if (keyboardEvent.key === "Enter") {
            keyboardEvent.preventDefault()
            input.blur()
        }

        if (keyboardEvent.key === "Escape") {
            input.removeEventListener("blur", commit)
            restoreOriginal()
        }
    })
}
