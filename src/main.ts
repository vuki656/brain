import { Plugin, WorkspaceLeaf } from "obsidian";
import { around } from "monkey-around";

import { migrateFromOldKanban } from "./migration";
import { VukiKanbanSettingTab } from "./settings";
import { KanbanView } from "./view";
import { DEFAULT_PLUGIN_SETTINGS, FRONTMATTER_KEY, KANBAN_VIEW_TYPE, PluginSettings } from "./types";

export default class VukiKanbanPlugin extends Plugin {
    settings: PluginSettings = DEFAULT_PLUGIN_SETTINGS;
    private uninstallMonkeyPatch: (() => void) | null = null;

    async onload(): Promise<void> {
        await this.loadSettings();

        this.registerView(KANBAN_VIEW_TYPE, (leaf) => new KanbanView(leaf, this));

        this.addCommand({
            id: "migrate-old-kanban",
            name: "Migrate from old kanban format",
            callback: () => migrateFromOldKanban(this.app),
        });

        this.addSettingTab(new VukiKanbanSettingTab(this.app, this));

        this.patchWorkspaceLeaf();
    }

    onunload(): void {
        if (this.uninstallMonkeyPatch) {
            this.uninstallMonkeyPatch();
            this.uninstallMonkeyPatch = null;
        }
    }

    async loadSettings(): Promise<void> {
        this.settings = Object.assign({}, DEFAULT_PLUGIN_SETTINGS, await this.loadData());
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }

    private patchWorkspaceLeaf(): void {
        const self = this;

        this.uninstallMonkeyPatch = around(WorkspaceLeaf.prototype, {
            setViewState(original) {
                return function (this: WorkspaceLeaf, state: any, ...rest: any[]) {
                    if (
                        state.type === "markdown" &&
                        state.state?.file
                    ) {
                        const fileCache = self.app.metadataCache.getCache(state.state.file);

                        if (fileCache?.frontmatter?.["kanban-plugin"] === FRONTMATTER_KEY) {
                            const kanbanState = {
                                ...state,
                                type: KANBAN_VIEW_TYPE,
                            };

                            return original.call(this, kanbanState, ...rest);
                        }
                    }

                    return original.call(this, state, ...rest);
                };
            },
        });

        this.register(() => {
            if (this.uninstallMonkeyPatch) {
                this.uninstallMonkeyPatch();
                this.uninstallMonkeyPatch = null;
            }
        });
    }
}
