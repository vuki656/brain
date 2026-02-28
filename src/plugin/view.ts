import { TextFileView, type WorkspaceLeaf } from "obsidian"
// eslint-disable-next-line import-x/no-named-as-default -- sortablejs exports default class
import type Sortable from "sortablejs"

import { parseBoard, serializeBoard } from "../parser"
import type { BoardType, ViewStateType } from "../shared"
import { KANBAN_VIEW_TYPE } from "../shared"
import { renderBoard } from "../ui/board"
import type VukiKanbanPlugin from "./plugin"

export class KanbanView extends TextFileView {
    private board: BoardType = {
        projects: [],
        settings: {
            archivedProjects: [],
            collapsedProjects: [],
            projectColors: {},
            projectIcons: {},
            todayOrder: {},
        },
    }

    private readonly boardContainer: HTMLElement

    private readonly plugin: VukiKanbanPlugin

    private sortableInstances: Sortable[] = []

    private viewState: ViewStateType = { hideCompletedActive: true, todayFilterActive: true }

    constructor(leaf: WorkspaceLeaf, plugin: VukiKanbanPlugin) {
        super(leaf)
        this.plugin = plugin
        this.boardContainer = this.contentEl.createDiv({ cls: "kanban-container" })
    }

    public clear(): void {
        this.board = {
            projects: [],
            settings: {
                archivedProjects: [],
                collapsedProjects: [],
                projectColors: {},
                projectIcons: {},
                todayOrder: {},
            },
        }
        this.boardContainer.empty()
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
        this.destroySortable()
    }

    public setViewData(data: string, clear: boolean): void {
        this.board = parseBoard(data)

        if (clear) {
            this.viewState = { hideCompletedActive: true, todayFilterActive: true }
        }

        this.render()
    }

    private destroySortable(): void {
        for (const instance of this.sortableInstances) {
            instance.destroy()
        }

        this.sortableInstances = []
    }

    private render(): void {
        this.destroySortable()

        this.sortableInstances = renderBoard({
            app: this.app,
            board: this.board,
            container: this.boardContainer,
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
}
