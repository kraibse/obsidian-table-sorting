import TableSort from "main";
import { App, PluginSettingTab, Setting } from "obsidian";


export interface TableSortSettings {
	isEnabled: boolean;
	isDevmodeEnabled: boolean;
}

export const DEFAULT_SETTINGS: Partial<TableSortSettings> = {
	isEnabled: true,
    isDevmodeEnabled: false,
}


export class TableSortSettingsTab extends PluginSettingTab {
    plugin: TableSort;

    constructor(app: App, plugin: TableSort) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        
        const general_heading = containerEl.createEl("div");
        general_heading.createEl("h2", { text: "General Settings" });

        new Setting(containerEl)
            .setName("Toggle table sorting")
            .setDesc("This toggles the activation state of this plugin.")
            .addToggle((toggle) => {
                toggle
                    .setDisabled(false)
                    .setValue(this.plugin.settings.isEnabled)
                    .onChange(async (value) => {
                        this.plugin.settings.isEnabled = value;
                        await this.plugin.saveSettings();
                    })
            });

        const developer_heading = containerEl.createEl("div");
        developer_heading.createEl("h2", { text: "Developer Settings" });

        new Setting(containerEl)
            .setName("Developer mode")
            .setDesc("This enables development logging in the console.")
            .addToggle((toggle) => {
                toggle
                    .setDisabled(true)
                    .setValue(this.plugin.settings.isDevmodeEnabled)
                    .onChange(async (value) => {
                        this.plugin.settings.isDevmodeEnabled = value;
                        await this.plugin.saveSettings();
                    })
            });
    }
}