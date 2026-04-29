import { TextFileView, type WorkspaceLeaf } from "obsidian"
// eslint-disable-next-line import-x/no-named-as-default -- sortablejs exports default class
import type Sortable from "sortablejs"

import { parseBoard, serializeBoard } from "../parser"
import type { BoardType, ViewStateType } from "../shared"
import { KANBAN_VIEW_TYPE, toDateString } from "../shared"
import { renderBoard } from "../ui/board"
import { cleanupFocusTimer } from "../ui/focus-timer"
import type VukiKanbanPlugin from "./plugin"

export class KanbanView extends TextFileView {
    private board: BoardType = {
        projects: [],
        settings: {
            archivedProjects: [],
            collapsedProjects: [],
            focusTimer: null,
            projectColors: {},
            projectIcons: {},
            ticketOrder: {},
            todayOrder: {},
        },
    }

    private readonly boardContainer: HTMLElement

    private lastRenderedDate: string = toDateString(new Date())

    private readonly plugin: VukiKanbanPlugin

    private sortableInstances: Sortable[] = []

    private viewState: ViewStateType = {
        activeRightTab: "tickets",
        hideCompletedActive: true,
        todayFilterActive: true,
    }

    constructor(leaf: WorkspaceLeaf, plugin: VukiKanbanPlugin) {
        super(leaf)
        this.plugin = plugin
        this.boardContainer = this.contentEl.createDiv({ cls: "kanban-container" })

        this.registerDomEvent(document, "visibilitychange", () => {
            if (document.visibilityState !== "visible") {
                return
            }

            const currentDate = toDateString(new Date())

            if (currentDate === this.lastRenderedDate) {
                return
            }

            this.render()
        })
    }

    public clear(): void {
        this.board = {
            projects: [],
            settings: {
                archivedProjects: [],
                collapsedProjects: [],
                focusTimer: null,
                projectColors: {},
                projectIcons: {},
                ticketOrder: {},
            todayOrder: {},
            },
        }
        this.boardContainer.empty()
    }

    private destroySortable(): void {
        for (const instance of this.sortableInstances) {
            instance.destroy()
        }

        this.sortableInstances = []
    }

    public getDisplayText(): string {
        return this.file?.basename ?? "Kanban"
    }

    public getViewData(): string {
        return serializeBoard(this.board)
    }

    public getViewType(): string {
        return KANBAN_VIEW_TYPE
    }

    // eslint-disable-next-line @typescript-eslint/require-await -- Obsidian base class requires async signature
    public async onClose(): Promise<void> {
        cleanupFocusTimer()
        this.destroySortable()
    }

    private render(): void {
        this.lastRenderedDate = toDateString(new Date())
        this.destroySortable()

        this.sortableInstances = renderBoard({
            app: this.app,
            board: this.board,
            container: this.boardContainer,
            onBoardCleanup: (newBoard) => {
                this.board = newBoard
                this.render()
            },
            onMutation: (newBoard) => {
                this.board = newBoard
                this.requestSave()
                this.render()
            },
            onViewStateChange: (newViewState) => {
                this.viewState = newViewState
                this.render()
            },
            pluginSettings: this.plugin.settings,
            vault: this.app.vault,
            viewState: this.viewState,
        })
    }

    public setViewData(data: string, clear: boolean): void {
        this.board = parseBoard(data)

        if (clear) {
            this.viewState = {
                activeRightTab: "tickets",
                hideCompletedActive: true,
                todayFilterActive: true,
            }
        }

        this.render()
    }
}
