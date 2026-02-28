import { Menu, Notice, TFile } from "obsidian"

import { getNextMonday, getTomorrowDate, toDateString } from "../../shared"
import { immutableSpliceCard, immutableUpdateCard } from "../card"
import { showDatePicker } from "../date-picker"
import { openQuickAddDialog } from "../quick-add"
import type { CardContextMenuOptionsType, PriorityMenuOptionsType } from "./context-menu.types"

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

    menu.addItem((item) => {
        return item
            .setIcon("pencil")
            .setTitle("Edit")
            .onClick(() => {
                openQuickAddDialog({
                    board,
                    editContext: { card, cardIndex, projectIndex },
                    onMutation,
                })
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
    const tomorrowDate = getTomorrowDate()

    menu.addItem((item) => {
        return item
            .setIcon("calendar")
            .setTitle("Date: Today")
            .onClick(() => {
                const newProjects = immutableUpdateCard({
                    cardIndex,
                    projectIndex,
                    projects: board.projects,
                    update: { date: toDateString(todayDate) },
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
                    update: { date: toDateString(tomorrowDate) },
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
                    update: { date: toDateString(getNextMonday()) },
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
                const newProjects = immutableSpliceCard({
                    cardIndex,
                    deleteCount: 1,
                    projectIndex,
                    projects: board.projects,
                })
                onMutation({ ...board, projects: newProjects })
            })
    })

    menu.showAtMouseEvent(event)
}
