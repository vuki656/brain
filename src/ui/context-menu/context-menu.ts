import { addDays, nextMonday, startOfTomorrow } from "date-fns"
import type { App } from "obsidian"
import { ButtonComponent, Menu, Modal, Notice, TFile } from "obsidian"

import type { SubtaskType } from "../../shared"
import { generateId, toDateString } from "../../shared"
import { immutableAddSubtask, immutableSpliceCard, immutableUpdateCard } from "../card"
import { showDatePicker } from "../date-picker"
import { openQuickAddDialog } from "../quick-add"
import type { CardContextMenuOptionsType, PriorityMenuOptionsType } from "./context-menu.types"

class TextPromptModal extends Modal {
    private readonly label: string

    private readonly onSubmit: (value: string) => void

    private readonly placeholder: string

    private readonly submitLabel: string

    constructor(
        app: App,
        options: {
            label: string
            onSubmit: (value: string) => void
            placeholder: string
            submitLabel: string
        },
    ) {
        super(app)
        this.label = options.label
        this.placeholder = options.placeholder
        this.submitLabel = options.submitLabel
        this.onSubmit = options.onSubmit
    }

    public onClose(): void {
        this.contentEl.empty()
    }

    public onOpen(): void {
        const { contentEl, label, onSubmit, placeholder, submitLabel, titleEl } = this

        titleEl.setText(label)

        const inputElement = contentEl.createEl("input", {
            cls: "kanban-text-prompt__input",
            type: "text",
        })

        inputElement.placeholder = placeholder

        const submit = () => {
            const trimmed = inputElement.value.trim()

            if (!trimmed) {
                inputElement.focus()

                return
            }

            this.close()
            onSubmit(trimmed)
        }

        inputElement.addEventListener("keydown", (keyboardEvent) => {
            if (keyboardEvent.key === "Enter") {
                keyboardEvent.preventDefault()
                submit()
            }
        })

        const buttonRow = contentEl.createDiv({ cls: "kanban-text-prompt__buttons" })

        new ButtonComponent(buttonRow).setButtonText(submitLabel).setCta().onClick(submit)

        window.setTimeout(() => {
            inputElement.focus()
        }, 0)
    }
}

export function showPriorityMenu(options: PriorityMenuOptionsType): void {
    const { board, cardIndex, event, onMutation, projectIndex } = options
    const menu = new Menu()

    menu.addItem((item) => {
        return item
            .setIcon("circle")
            .setTitle("None")
            .onClick(() => {
                const newProjects = immutableUpdateCard({
                    cardIndex,
                    projectIndex,
                    projects: board.projects,
                    update: { priority: null },
                })
                onMutation({ ...board, projects: newProjects })
            })
    })

    menu.addItem((item) => {
        return item
            .setIcon("alert-circle")
            .setTitle("Important")
            .onClick(() => {
                const newProjects = immutableUpdateCard({
                    cardIndex,
                    projectIndex,
                    projects: board.projects,
                    update: { priority: "important" },
                })
                onMutation({ ...board, projects: newProjects })
            })
    })

    menu.showAtMouseEvent(event)
}

export function showCardContextMenu(options: CardContextMenuOptionsType): void {
    const { board, card, cardIndex, event, onMutation, pluginSettings, projectIndex, vault } =
        options
    const menu = new Menu()

    const todayString = toDateString(new Date())

    if (card.date === todayString) {
        menu.addItem((item) => {
            return item
                .setIcon("sun-dim")
                .setTitle("Remove from today")
                .onClick(() => {
                    const newProjects = immutableUpdateCard({
                        cardIndex,
                        projectIndex,
                        projects: board.projects,
                        update: { date: null },
                    })
                    onMutation({ ...board, projects: newProjects })
                })
        })
    } else {
        menu.addItem((item) => {
            return item
                .setIcon("sun")
                .setTitle("Add to today")
                .onClick(() => {
                    const newProjects = immutableUpdateCard({
                        cardIndex,
                        projectIndex,
                        projects: board.projects,
                        update: { date: todayString },
                    })
                    onMutation({ ...board, projects: newProjects })
                })
        })
    }

    if (card.backlog) {
        menu.addItem((item) => {
            return item
                .setIcon("inbox")
                .setTitle("Remove from backlog")
                .onClick(() => {
                    const newProjects = immutableUpdateCard({
                        cardIndex,
                        projectIndex,
                        projects: board.projects,
                        update: { backlog: false },
                    })
                    onMutation({ ...board, projects: newProjects })
                })
        })
    } else {
        menu.addItem((item) => {
            return item
                .setIcon("archive")
                .setTitle("Add to backlog")
                .onClick(() => {
                    const newProjects = immutableUpdateCard({
                        cardIndex,
                        projectIndex,
                        projects: board.projects,
                        update: { backlog: true, date: null },
                    })
                    onMutation({ ...board, projects: newProjects })
                })
        })
    }

    menu.addItem((item) => {
        return item
            .setIcon("pencil")
            .setTitle("Edit")
            .onClick(() => {
                openQuickAddDialog({
                    board,
                    editContext: { card, cardIndex, projectIndex },
                    onMutation,
                    pluginSettings,
                    vault,
                })
            })
    })

    menu.addItem((item) => {
        return item
            .setIcon("list-checks")
            .setTitle("Add subtask")
            .onClick(() => {
                window.setTimeout(() => {
                    new TextPromptModal(window.app, {
                        label: "Add subtask",
                        onSubmit: (title) => {
                            const newSubtask: SubtaskType = {
                                completed: false,
                                id: generateId(),
                                title,
                            }
                            const newSubtasks = immutableAddSubtask(card.subtasks, newSubtask)
                            const newProjects = immutableUpdateCard({
                                cardIndex,
                                projectIndex,
                                projects: board.projects,
                                update: { subtasks: newSubtasks },
                            })
                            onMutation({ ...board, projects: newProjects })
                        },
                        placeholder: "Subtask title...",
                        submitLabel: "Add",
                    }).open()
                }, 150)
            })
    })

    menu.addSeparator()

    menu.addItem((item) => {
        return item
            .setIcon("circle")
            .setTitle("Priority: None")
            .onClick(() => {
                const newProjects = immutableUpdateCard({
                    cardIndex,
                    projectIndex,
                    projects: board.projects,
                    update: { priority: null },
                })
                onMutation({ ...board, projects: newProjects })
            })
    })
    menu.addItem((item) => {
        return item
            .setIcon("alert-circle")
            .setTitle("Priority: Important")
            .onClick(() => {
                const newProjects = immutableUpdateCard({
                    cardIndex,
                    projectIndex,
                    projects: board.projects,
                    update: { priority: "important" },
                })
                onMutation({ ...board, projects: newProjects })
            })
    })

    menu.addSeparator()

    const todayDate = new Date()
    const tomorrowDate = startOfTomorrow()
    const dayAfterTomorrowDate = addDays(tomorrowDate, 1)

    menu.addItem((item) => {
        return item
            .setIcon("calendar")
            .setTitle("Date: Today")
            .onClick(() => {
                const newProjects = immutableUpdateCard({
                    cardIndex,
                    projectIndex,
                    projects: board.projects,
                    update: { backlog: false, date: toDateString(todayDate) },
                })
                onMutation({ ...board, projects: newProjects })
            })
    })
    menu.addItem((item) => {
        return item
            .setIcon("calendar-plus")
            .setTitle("Date: Tomorrow")
            .onClick(() => {
                const newProjects = immutableUpdateCard({
                    cardIndex,
                    projectIndex,
                    projects: board.projects,
                    update: { backlog: false, date: toDateString(tomorrowDate) },
                })
                onMutation({ ...board, projects: newProjects })
            })
    })
    menu.addItem((item) => {
        return item
            .setIcon("calendar-plus-2")
            .setTitle("Date: Day After Tomorrow")
            .onClick(() => {
                const newProjects = immutableUpdateCard({
                    cardIndex,
                    projectIndex,
                    projects: board.projects,
                    update: { backlog: false, date: toDateString(dayAfterTomorrowDate) },
                })
                onMutation({ ...board, projects: newProjects })
            })
    })
    menu.addItem((item) => {
        return item
            .setIcon("calendar-range")
            .setTitle("Date: Next Monday")
            .onClick(() => {
                const newProjects = immutableUpdateCard({
                    cardIndex,
                    projectIndex,
                    projects: board.projects,
                    update: { backlog: false, date: toDateString(nextMonday(new Date())) },
                })
                onMutation({ ...board, projects: newProjects })
            })
    })
    menu.addItem((item) => {
        return item
            .setIcon("calendar-search")
            .setTitle("Date: Pick...")
            .onClick(() => {
                showDatePicker({ board, card, cardIndex, onMutation, projectIndex })
            })
    })

    if (card.date) {
        menu.addItem((item) => {
            return item
                .setIcon("calendar-x")
                .setTitle("Date: Remove")
                .onClick(() => {
                    const newProjects = immutableUpdateCard({
                        cardIndex,
                        projectIndex,
                        projects: board.projects,
                        update: { date: null },
                    })
                    onMutation({ ...board, projects: newProjects })
                })
        })
    }

    menu.addSeparator()

    if (card.blockedReason !== null) {
        menu.addItem((item) => {
            return item
                .setIcon("circle-check")
                .setTitle("Unblock")
                .onClick(() => {
                    const newProjects = immutableUpdateCard({
                        cardIndex,
                        projectIndex,
                        projects: board.projects,
                        update: { blockedReason: null },
                    })
                    onMutation({ ...board, projects: newProjects })
                })
        })
    } else {
        menu.addItem((item) => {
            return item
                .setIcon("ban")
                .setTitle("Block...")
                .onClick(() => {
                    const reasonInput = document.createElement("input")

                    reasonInput.type = "text"
                    reasonInput.placeholder = "Blocked reason..."
                    reasonInput.className = "kanban-blocked-reason-prompt"

                    const promptOverlay = document.createElement("div")

                    promptOverlay.className = "kanban-blocked-reason-overlay"

                    const promptDialog = document.createElement("div")

                    promptDialog.className = "kanban-blocked-reason-dialog"

                    const promptLabel = document.createElement("div")

                    promptLabel.className = "kanban-blocked-reason-dialog__label"
                    promptLabel.textContent = "Why is this card blocked?"

                    const promptSubmit = document.createElement("span")

                    promptSubmit.className = "kanban-quick-add__submit"
                    promptSubmit.textContent = "Block"

                    const cleanup = () => {
                        promptOverlay.remove()
                    }

                    const submit = () => {
                        const reason = reasonInput.value.trim()

                        if (!reason) {
                            reasonInput.focus()

                            return
                        }

                        const newProjects = immutableUpdateCard({
                            cardIndex,
                            projectIndex,
                            projects: board.projects,
                            update: { blockedReason: reason },
                        })
                        onMutation({ ...board, projects: newProjects })
                        cleanup()
                    }

                    promptSubmit.addEventListener("click", submit)
                    reasonInput.addEventListener("keydown", (keyboardEvent) => {
                        if (keyboardEvent.key === "Enter") {
                            keyboardEvent.preventDefault()
                            submit()
                        }

                        if (keyboardEvent.key === "Escape") {
                            cleanup()
                        }
                    })
                    promptOverlay.addEventListener("click", cleanup)
                    promptDialog.addEventListener("click", (dialogEvent) => {
                        dialogEvent.stopPropagation()
                    })

                    promptDialog.append(promptLabel, reasonInput, promptSubmit)
                    promptOverlay.append(promptDialog)
                    document.body.append(promptOverlay)
                    reasonInput.focus()
                })
        })
    }

    menu.addSeparator()

    if (!card.linkedNote) {
        menu.addItem((item) => {
            return item
                .setIcon("file-plus")
                .setTitle("Create linked note")
                .onClick(async () => {
                    const project = board.projects[projectIndex]

                    if (!project) {
                        return
                    }

                    const projectTitle = project.title
                    const cardTitle = card.title
                    const notePath = `${pluginSettings.notePathPrefix}/${projectTitle}/Tasks/${cardTitle}.md`

                    const folderPath = notePath.slice(0, Math.max(0, notePath.lastIndexOf("/")))

                    try {
                        if (!vault.getAbstractFileByPath(folderPath)) {
                            await vault.createFolder(folderPath)
                        }

                        await vault.create(notePath, `# ${cardTitle}\n`)

                        const newProjects = immutableUpdateCard({
                            cardIndex,
                            projectIndex,
                            projects: board.projects,
                            update: {
                                linkedNote: `${pluginSettings.notePathPrefix}/${projectTitle}/Tasks/${cardTitle}`,
                                title: "",
                            },
                        })
                        onMutation({ ...board, projects: newProjects })

                        new Notice(`Created note: ${notePath}`)
                    } catch (error) {
                        new Notice(`Failed to create note: ${error}`)
                    }
                })
        })
    } else {
        menu.addItem((item) => {
            return item
                .setIcon("file-text")
                .setTitle("View linked note")
                .onClick(() => {
                    const notePath = `${card.linkedNote}.md`
                    const file = vault.getAbstractFileByPath(notePath)

                    if (file && file instanceof TFile) {
                        void window.app.workspace.getLeaf(false).openFile(file)
                    } else {
                        new Notice(`Note not found: ${notePath}`)
                    }
                })
        })

        menu.addItem((item) => {
            return item
                .setIcon("file-x")
                .setTitle("Delete linked note")
                .setWarning(true)
                .onClick(async () => {
                    const notePath = `${card.linkedNote}.md`
                    const file = vault.getAbstractFileByPath(notePath)

                    if (file && file instanceof TFile) {
                        try {
                            await vault.trash(file, true)

                            const linkedNote = card.linkedNote
                            const noteName = linkedNote
                                ? (linkedNote.split("/").pop() ?? linkedNote)
                                : ""
                            const newProjects = immutableUpdateCard({
                                cardIndex,
                                projectIndex,
                                projects: board.projects,
                                update: {
                                    linkedNote: null,
                                    title: noteName,
                                },
                            })
                            onMutation({ ...board, projects: newProjects })

                            new Notice(`Deleted note: ${notePath}`)
                        } catch (error) {
                            new Notice(`Failed to delete note: ${error}`)
                        }
                    } else {
                        new Notice(`Note not found: ${notePath}`)
                    }
                })
        })
    }

    menu.addSeparator()

    menu.addItem((item) => {
        return item
            .setIcon("trash-2")
            .setTitle("Delete card")
            .setWarning(true)
            .onClick(() => {
                const overlay = document.createElement("div")

                overlay.className = "kanban-delete-confirm-overlay"

                const dialog = document.createElement("div")

                dialog.className = "kanban-delete-confirm-dialog"

                const label = document.createElement("div")

                label.className = "kanban-delete-confirm-dialog__label"
                label.textContent = "Delete this card?"

                const cardTitle = card.linkedNote
                    ? (card.linkedNote.split("/").pop() ?? card.linkedNote)
                    : card.title
                const preview = document.createElement("div")

                preview.className = "kanban-delete-confirm-dialog__preview"
                preview.textContent = cardTitle

                const actions = document.createElement("div")

                actions.className = "kanban-delete-confirm-dialog__actions"

                const cancelButton = document.createElement("span")

                cancelButton.className = "kanban-delete-confirm__cancel"
                cancelButton.textContent = "Cancel"

                const deleteButton = document.createElement("span")

                deleteButton.className = "kanban-delete-confirm__delete"
                deleteButton.textContent = "Delete"

                const cleanup = () => {
                    overlay.remove()
                }

                const confirmDelete = () => {
                    const newProjects = immutableSpliceCard({
                        cardIndex,
                        deleteCount: 1,
                        projectIndex,
                        projects: board.projects,
                    })
                    onMutation({ ...board, projects: newProjects })
                    cleanup()
                }

                cancelButton.addEventListener("click", cleanup)
                deleteButton.addEventListener("click", confirmDelete)
                overlay.addEventListener("click", cleanup)
                dialog.addEventListener("click", (dialogEvent) => {
                    dialogEvent.stopPropagation()
                })
                dialog.addEventListener("keydown", (keyboardEvent) => {
                    if (keyboardEvent.key === "Escape") {
                        cleanup()
                    }
                })

                actions.append(cancelButton, deleteButton)
                dialog.append(label, preview, actions)
                overlay.append(dialog)
                document.body.append(overlay)
                deleteButton.focus()
            })
    })

    menu.showAtMouseEvent(event)
}
