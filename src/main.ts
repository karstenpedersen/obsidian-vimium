import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, VimiumSettings, VimiumSettingTab } from './settings';
import tlds from './tlds';
import { MarkerData } from './types';
import { createMarker, findMarkerMatch } from './utils';

export default class Vimium extends Plugin {
	settings: VimiumSettings;
	showMarkers = false;
	markers: MarkerData[] = [];
	containerEl: HTMLElement;
	input = "";

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'show-markers',
			name: 'Show Vimium Markers',
			callback: () => {
				if (this.showMarkers) {
					this.destroyMarkers();
					this.input = "";
				}
				this.showMarkers = true;
				this.createMarkers();
			}
		});

		this.registerDomEvent(document, "keydown", (event: KeyboardEvent) => {
			if (!this.showMarkers) {
				return;
			}
			
			if (event.key === "Escape") {
				this.showMarkers = false;
				this.input = "";
				this.destroyMarkers();
			} else if (event.key === "Backspace") {
				if (this.input === "") {
					return;
				}
				this.input = this.input.slice(0, -1);
				this.updateMarkers();
			} else if (event.key.length === 1 && event.key.match(/[a-zA-Z]/)) {
				this.input += event.key;

				const result = findMarkerMatch(this.input, this.markers);
				if (result) {
					// Click element
					const clickableEl = result.parentEl;
					clickableEl.click();

					// Reset
					this.showMarkers = false;
					this.destroyMarkers();
					this.input = "";
				} else {
					this.updateMarkers();
				}
			}
			
			event.preventDefault();
		});

		this.registerEvent(this.app.workspace.on("resize", () => {
			if (this.showMarkers) {
				this.updateMarkers();
			}
		}));

		this.addSettingTab(new VimiumSettingTab(this.app, this));
	}

	createMarkers() {
		// Select clickable elements
		const clickableElements = document.querySelectorAll(this.settings.clickableCssSelector);

		// Create container
		this.containerEl = createDiv();
		this.containerEl.addClass("vimium-container");
		this.app.workspace.containerEl.appendChild(this.containerEl);
		const containerInnerEl = createDiv();
		containerInnerEl.addClass("vimium-container-inner");
		this.containerEl.appendChild(containerInnerEl);

		this.containerEl.setCssProps({
			"--marker-size": `${this.settings.markerSize}px`,
			"--marker-color": this.settings.markerColor,
			"--marker-background-color": this.settings.markerBackgroundColor,
			"--marker-opacity": `${this.settings.markerOpacity}`,
		});
		
		// Create markers
		for (let i = 0; i < clickableElements.length; i++) {
			const clickableEl = clickableElements[i] as HTMLElement;

			const text = tlds[i];
			const markerData = createMarker(text, clickableEl, this.input);
			if (!markerData) {
				continue;
			}

			this.markers.push(markerData);
			containerInnerEl.appendChild(markerData.el);
		}
	}

	updateMarkers() {
		for (const marker of this.markers) {
			marker.el.setAttr("data-written", this.input);
			const rect = marker.parentEl.getBoundingClientRect();
			marker.el.setCssProps({
				"--top": `${rect.top}px`, 
				"--left": `${rect.left}px`,
				display: marker.text.startsWith(this.input) ? "block" : "none"
			});
		}
	}

	destroyMarkers() {
		// Delete markers
		for (const marker of this.markers) {
			marker.el.parentNode?.removeChild(marker.el);
		}
		this.markers = [];

		// Remove parent container
		this.containerEl.parentNode?.removeChild(this.containerEl);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

