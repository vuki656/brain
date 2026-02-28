import { Menu, Notice, TFile } from "obsidian"

import { getNextMonday, toDateString } from "../../shared"
import { immutableSpliceCard, immutableUpdateCard } from "../card"
import { showDatePicker } from "../date-picker"
import { openQuickAddDialog } from "../quick-add"
import type { CardContextMenuOptionsType, PriorityMenuOptionsType } from "./context-menu.types"

export function showPriorityMenu(options: PriorityMenuOptionsType): void {
    const { board, cardIndex, columnIndex, event, onMutation } = options
    const menu = new Menu()

    menu.addItem((item) => {
        return item
            .setIcon("circle")
            .setTitle("None")
            .onClick(() => {
                const newColumns = immutableUpdateCard({
                    cardIndex,
                    columnIndex,
                    columns: board.columns,
                    update: { priority: null },
                })
                onMutation({ ...board, columns: newColumns })
            })
    })

    menu.addItem((item) => {
        return item
            .setIcon("alert-circle")
            .setTitle("Important")
            .onClick(() => {
                const newColumns = immutableUpdateCard({
                    cardIndex,
                    columnIndex,
                    columns: board.columns,
                    update: { priority: "important" },
                })
                onMutation({ ...board, columns: newColumns })
            })
    })

    menu.showAtMouseEvent(event)
}

export function showCardContextMenu(options: CardContextMenuOptionsType): void {
    const { board, card, cardIndex, columnIndex, event, onMutation, pluginSettings, vault } =
        options
    const menu = new Menu()

    const todayString = toDateString(new Date())

    if (card.date === todayString) {
        menu.addItem((item) => {
            return item
                .setIcon("sun-dim")
                .setTitle("Remove from today")
                .onClick(() => {
                    const newColumns = immutableUpdateCard({
                        cardIndex,
                        columnIndex,
                        columns: board.columns,
                        update: { date: null },
                    })
                    onMutation({ ...board, columns: newColumns })
                })
        })
    } else {
        menu.addItem((item) => {
            return item
                .setIcon("sun")
                .setTitle("Add to today")
                .onClick(() => {
                    const newColumns = immutableUpdateCard({
                        cardIndex,
                        columnIndex,
                        columns: board.columns,
                        update: { date: todayString },
                    })
                    onMutation({ ...board, columns: newColumns })
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
                    editContext: { card, cardIndex, columnIndex },
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
                const newColumns = immutableUpdateCard({
                    cardIndex,
                    columnIndex,
                    columns: board.columns,
                    update: { priority: null },
                })
                onMutation({ ...board, columns: newColumns })
            })
    })
    menu.addItem((item) => {
        return item
            .setIcon("alert-circle")
            .setTitle("Priority: Important")
            .onClick(() => {
                const newColumns = immutableUpdateCard({
                    cardIndex,
                    columnIndex,
                    columns: board.columns,
                    update: { priority: "important" },
                })
                onMutation({ ...board, columns: newColumns })
            })
    })

    menu.addSeparator()

    const todayDate = new Date()
    const tomorrowDate = new Date()

    tomorrowDate.setDate(tomorrowDate.getDate() + 1)

    menu.addItem((item) => {
        return item
            .setIcon("calendar")
            .setTitle("Date: Today")
            .onClick(() => {
                const newColumns = immutableUpdateCard({
                    cardIndex,
                    columnIndex,
                    columns: board.columns,
                    update: { date: toDateString(todayDate) },
                })
                onMutation({ ...board, columns: newColumns })
            })
    })
    menu.addItem((item) => {
        return item
            .setIcon("calendar-plus")
            .setTitle("Date: Tomorrow")
            .onClick(() => {
                const newColumns = immutableUpdateCard({
                    cardIndex,
                    columnIndex,
                    columns: board.columns,
                    update: { date: toDateString(tomorrowDate) },
                })
                onMutation({ ...board, columns: newColumns })
            })
    })
    menu.addItem((item) => {
        return item
            .setIcon("calendar-range")
            .setTitle("Date: Next Monday")
            .onClick(() => {
                const newColumns = immutableUpdateCard({
                    cardIndex,
                    columnIndex,
                    columns: board.columns,
                    update: { date: toDateString(getNextMonday()) },
                })
                onMutation({ ...board, columns: newColumns })
            })
    })
    menu.addItem((item) => {
        return item
            .setIcon("calendar-search")
            .setTitle("Date: Pick...")
            .onClick(() => {
                showDatePicker({ board, card, cardIndex, columnIndex, onMutation })
            })
    })

    if (card.date) {
        menu.addItem((item) => {
            return item
                .setIcon("calendar-x")
                .setTitle("Date: Remove")
                .onClick(() => {
                    const newColumns = immutableUpdateCard({
                        cardIndex,
                        columnIndex,
                        columns: board.columns,
                        update: { date: null },
                    })
                    onMutation({ ...board, columns: newColumns })
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
                    const column = board.columns[columnIndex]

                    if (!column) return

                    const columnTitle = column.title
                    const cardTitle = card.title
                    const notePath = `${pluginSettings.notePathPrefix}/${columnTitle}/Tasks/${cardTitle}.md`

                    const folderPath = notePath.slice(0, Math.max(0, notePath.lastIndexOf("/")))

                    try {
                        if (!vault.getAbstractFileByPath(folderPath)) {
                            await vault.createFolder(folderPath)
                        }

                        await vault.create(notePath, `# ${cardTitle}\n`)

                        const newColumns = immutableUpdateCard({
                            cardIndex,
                            columnIndex,
                            columns: board.columns,
                            update: {
                                linkedNote: `${pluginSettings.notePathPrefix}/${columnTitle}/Tasks/${cardTitle}`,
                                title: "",
                            },
                        })
                        onMutation({ ...board, columns: newColumns })

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
                            const newColumns = immutableUpdateCard({
                                cardIndex,
                                columnIndex,
                                columns: board.columns,
                                update: {
                                    linkedNote: null,
                                    title: noteName,
                                },
                            })
                            onMutation({ ...board, columns: newColumns })

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
                const newColumns = immutableSpliceCard({
                    cardIndex,
                    columnIndex,
                    columns: board.columns,
                    deleteCount: 1,
                })
                onMutation({ ...board, columns: newColumns })
            })
    })

    menu.showAtMouseEvent(event)
}
