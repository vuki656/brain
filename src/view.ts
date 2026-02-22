import { TextFileView, WorkspaceLeaf } from "obsidian";
import Sortable from "sortablejs";

import { renderBoard } from "./board";
import { parseBoard, serializeBoard } from "./parser";
import { Board, KANBAN_VIEW_TYPE, ViewState, PluginSettings } from "./types";

import type VukiKanbanPlugin from "./main";

export class KanbanView extends TextFileView {
    private board: Board = { columns: [], settings: { collapsedColumns: [], todayOrder: [] } };
    private viewState: ViewState = { todayFilterActive: false, hideCompletedActive: false };
    private sortableInstances: Sortable[] = [];
    private plugin: VukiKanbanPlugin;
    private boardContainer: HTMLElement;

    constructor(leaf: WorkspaceLeaf, plugin: VukiKanbanPlugin) {
        super(leaf);
        this.plugin = plugin;
        this.boardContainer = this.contentEl.createDiv({ cls: "kanban-container" });
    }

    getViewType(): string {
        return KANBAN_VIEW_TYPE;
    }

    getDisplayText(): string {
        return this.file?.basename ?? "Kanban";
    }

    getViewData(): string {
        return serializeBoard(this.board);
    }

    setViewData(data: string, clear: boolean): void {
        this.board = parseBoard(data);

        if (clear) {
            this.viewState = { todayFilterActive: false, hideCompletedActive: false };
        }

        this.render();
    }

    clear(): void {
        this.board = { columns: [], settings: { collapsedColumns: [], todayOrder: [] } };
        this.boardContainer.empty();
    }

    onClose(): Promise<void> {
        this.destroySortable();

        return Promise.resolve();
    }

    private destroySortable(): void {
        for (const instance of this.sortableInstances) {
            instance.destroy();
        }

        this.sortableInstances = [];
    }

    private render(): void {
        this.destroySortable();

        this.sortableInstances = renderBoard(
            this.boardContainer,
            this.board,
            this.viewState,
            (newBoard) => {
                this.board = newBoard;
                this.requestSave();
                this.render();
            },
            (newViewState) => {
                this.viewState = newViewState;
                this.render();
            },
            this.app.vault,
            this.plugin.settings,
        );
    }
}
