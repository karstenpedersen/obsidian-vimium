import { App, ButtonComponent, PluginSettingTab, Setting } from "obsidian";
import { CLICKABLE_SELECTOR } from "./constants";
import Vimium from "./main";

export interface VimiumSettings {
	clickableCssSelector: string;
	markerOpacity: number;
	markerBackgroundColor: string;
	markerColor: string;
	markerSize: number;
}

export const DEFAULT_SETTINGS: VimiumSettings = {
	clickableCssSelector: CLICKABLE_SELECTOR,
	markerOpacity: 1,
	markerSize: 12,
	markerBackgroundColor: "#FFFF00",
	markerColor: "#000000"
}

export class VimiumSettingTab extends PluginSettingTab {
	plugin: Vimium;

	constructor(app: App, plugin: Vimium) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Marker font size')
			.setDesc('The size of text in markers.')
			.addText(text => text
				.setValue(this.plugin.settings.markerSize.toString())
				.onChange(async (value) => {
					const num = parseInt(value);
					if (isNaN(num)) {
						this.plugin.settings.markerSize = DEFAULT_SETTINGS.markerSize;
					} else {
						this.plugin.settings.markerSize = num;
					}
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Marker color')
			.setDesc('The text color of markers.')
			.addColorPicker(component => component
				.setValue(this.plugin.settings.markerColor)
				.onChange(async (value) => {
					this.plugin.settings.markerColor = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Marker background color')
			.setDesc('The background color of markers.')
			.addColorPicker(component => component
				.setValue(this.plugin.settings.markerBackgroundColor)
				.onChange(async (value) => {
					this.plugin.settings.markerBackgroundColor = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Marker opacity')
			.setDesc('The opacity of markers.')
			.addSlider(slider => slider
				.setValue(this.plugin.settings.markerOpacity)
				.setLimits(10, 100, 5)
				.onChange(async (value) => {
					this.plugin.settings.markerOpacity = value / 100;
					await this.plugin.saveSettings();
				}));

		new ButtonComponent(containerEl)
			.setButtonText("Reset style")
			.setTooltip("Reset marker styles")
			.onClick(async () => {
				this.plugin.settings.markerOpacity = DEFAULT_SETTINGS.markerOpacity * 100;
				this.plugin.settings.markerColor = DEFAULT_SETTINGS.markerColor;
				this.plugin.settings.markerBackgroundColor = DEFAULT_SETTINGS.markerBackgroundColor;
				this.plugin.settings.markerSize = DEFAULT_SETTINGS.markerSize;
				await this.plugin.saveSettings();
				this.display()
			});

		new Setting(containerEl)
			.setName('Clickable CSS selector')
			.setDesc('Used for selecting clickable HTML elements.')
			.addTextArea(text => text
				.setPlaceholder('CSS selector..')
				.setValue(this.plugin.settings.clickableCssSelector)
				.onChange(async (value) => {
					this.plugin.settings.clickableCssSelector = value;
					await this.plugin.saveSettings();
				}));
	}
}
