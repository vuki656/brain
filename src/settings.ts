import { App, PluginSettingTab, Setting } from "obsidian";

import type VukiKanbanPlugin from "./main";

export class VukiKanbanSettingTab extends PluginSettingTab {
    plugin: VukiKanbanPlugin;

    constructor(app: App, plugin: VukiKanbanPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName("Note path prefix")
            .setDesc("Base folder path for notes created via 'Create linked note' (e.g. Projects)")
            .addText((text) =>
                text
                    .setPlaceholder("Projects")
                    .setValue(this.plugin.settings.notePathPrefix)
                    .onChange(async (value) => {
                        this.plugin.settings.notePathPrefix = value;
                        await this.plugin.saveSettings();
                    }),
            );
    }
}
