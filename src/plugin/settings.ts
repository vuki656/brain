import { type App, PluginSettingTab, Setting } from "obsidian"

import type VukiKanbanPlugin from "./plugin"

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

        new Setting(containerEl)
            .setName("Weather latitude")
            .setDesc("Latitude for weather forecast in today view (e.g. 48.8566)")
            .addText((text) => {
                return text
                    .setPlaceholder("48.8566")
                    .setValue(settings.weatherLatitude)
                    .onChange(async (value) => {
                        settings.weatherLatitude = value
                        await plugin.saveSettings()
                    })
            })

        new Setting(containerEl)
            .setName("Weather longitude")
            .setDesc("Longitude for weather forecast in today view (e.g. 2.3522)")
            .addText((text) => {
                return text
                    .setPlaceholder("2.3522")
                    .setValue(settings.weatherLongitude)
                    .onChange(async (value) => {
                        settings.weatherLongitude = value
                        await plugin.saveSettings()
                    })
            })
    }
}
