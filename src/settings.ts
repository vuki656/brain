import { type App, PluginSettingTab, Setting } from "obsidian"

import type VukiKanbanPlugin from "./main"

export class VukiKanbanSettingTab extends PluginSettingTab {
    public plugin: VukiKanbanPlugin

    constructor(app: App, plugin: VukiKanbanPlugin) {
        super(app, plugin)
        this.plugin = plugin
    }

    public display(): void {
        const { containerEl } = this
        const { plugin } = this
        const { settings } = plugin

        containerEl.empty()

        new Setting(containerEl)
            .setName("Note path prefix")
            .setDesc("Base folder path for notes created via 'Create linked note' (e.g. Projects)")
            .addText((text) => {
                return text
                    .setPlaceholder("Projects")
                    .setValue(settings.notePathPrefix)
                    .onChange(async (value) => {
                        settings.notePathPrefix = value
                        await plugin.saveSettings()
                    })
            })
    }
}
