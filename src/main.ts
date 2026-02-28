import { around } from "monkey-around"
import { Plugin, WorkspaceLeaf } from "obsidian"

import { VukiKanbanSettingTab } from "./settings"
import {
    DEFAULT_PLUGIN_SETTINGS,
    FRONTMATTER_KEY,
    KANBAN_VIEW_TYPE,
    type PluginSettingsType,
} from "./types"
import { KanbanView } from "./view"

export default class VukiKanbanPlugin extends Plugin {
    public settings: PluginSettingsType = DEFAULT_PLUGIN_SETTINGS

    private uninstallMonkeyPatch: (() => void) | null = null

    public async loadSettings(): Promise<void> {
        this.settings = { ...DEFAULT_PLUGIN_SETTINGS, ...(await this.loadData()) }
    }

    public async onload(): Promise<void> {
        await this.loadSettings()

        this.registerView(KANBAN_VIEW_TYPE, (leaf) => {
            return new KanbanView(leaf, this)
        })

        this.addSettingTab(new VukiKanbanSettingTab(this.app, this))

        this.patchWorkspaceLeaf()
    }

    public onunload(): void {
        if (this.uninstallMonkeyPatch) {
            this.uninstallMonkeyPatch()
            this.uninstallMonkeyPatch = null
        }
    }

    public async saveSettings(): Promise<void> {
        await this.saveData(this.settings)
    }

    private patchWorkspaceLeaf(): void {
        // eslint-disable-next-line @typescript-eslint/no-this-alias, unicorn/no-this-assignment, consistent-this -- monkey-around requires outer this reference
        const pluginInstance = this

        this.uninstallMonkeyPatch = around(WorkspaceLeaf.prototype, {
            setViewState(original) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, func-names -- monkey-around API requires anonymous function with untyped args
                return function (this: WorkspaceLeaf, state: any, ...rest: any[]) {
                    if (state.type === "markdown" && state.state?.file) {
                        const fileCache = pluginInstance.app.metadataCache.getCache(
                            state.state.file,
                        )

                        if (fileCache?.frontmatter?.["kanban-plugin"] === FRONTMATTER_KEY) {
                            const kanbanState = {
                                ...state,
                                type: KANBAN_VIEW_TYPE,
                            }

                            return original.call(this, kanbanState, ...rest)
                        }
                    }

                    return original.call(this, state, ...rest)
                }
            },
        })

        this.register(() => {
            if (this.uninstallMonkeyPatch) {
                this.uninstallMonkeyPatch()
                this.uninstallMonkeyPatch = null
            }
        })
    }
}
