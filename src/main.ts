import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, VimiumSettings, VimiumSettingTab } from './settings';
import tlds from './tlds';
import { MarkerData } from './types';
import { createMarker, findMarkerMatch, updateMarkerText } from './utils';

export default class Vimium extends Plugin {
	settings: VimiumSettings;
	showMarkers = false;
	markers: MarkerData[] = [];
	containerEl: HTMLElement;
	input = "";
	scrollInterval: NodeJS.Timeout | null = null;
	scrollAmount = 50; // Amount to scroll each interval
	scrollSpeed = 50; // Milliseconds between scrolls

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'show-markers',
			name: 'Show markers',
			callback: () => {
				if (this.showMarkers) {
					this.destroyMarkers();
					this.input = "";
				}
				this.showMarkers = true;
				this.createMarkers();
			}
		});

		this.registerDomEvent(document, "keydown", (event: KeyboardEvent) => this.handleKeyDown(event));
		this.registerDomEvent(document, "keyup", (event: KeyboardEvent) => this.handleKeyUp(event));

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
				this.input += event.key.toLowerCase();

				const result = findMarkerMatch(this.input, this.markers);
				if (result) {
					// Interact with element
					const clickableEl = result.parentEl;
					if (clickableEl.getAttribute('contenteditable') === 'true') {
						clickableEl.focus();
					} else {
						clickableEl.click();
					}

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

		this.registerDomEvent(document, "mousedown", () => {
			if (!this.showMarkers) {
				return;
			}

			this.showMarkers = false;
			this.input = "";
			this.destroyMarkers();
		});

		this.registerEvent(this.app.workspace.on("resize", () => {
			if (this.showMarkers) {
				this.updateMarkers();
			}
		}));

		this.addSettingTab(new VimiumSettingTab(this.app, this));
	}



	startScrolling(direction: 'up' | 'down') {
		if (this.scrollInterval) return; // Prevent multiple intervals

		this.scrollInterval = setInterval(() => {
			const activeLeaf = this.app.workspace.activeLeaf;

			if (activeLeaf) {
				const activeView = activeLeaf.view;
				if (activeView && activeView.getViewType() === 'markdown') {
					const previewEl = activeView.containerEl.querySelector('.markdown-preview-view');
					if (previewEl) {
						const scrollDelta = direction === 'down' ? this.scrollAmount : -this.scrollAmount;
						previewEl.scrollBy(0, scrollDelta);
					}
				}
			}
		}, this.scrollSpeed);
	}

	stopScrolling() {
		if (this.scrollInterval) {
			clearInterval(this.scrollInterval);
			this.scrollInterval = null; // Reset the interval
		}
	}

	handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'j') {
			this.startScrolling('down');
		}
		if (event.key === 'k') {
			this.startScrolling('up');
		}
	}
	
	handleKeyUp(event: KeyboardEvent) {
		if (event.key === 'j' || event.key === 'k') {
			this.stopScrolling();
		}
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
		for (let i = 0; i < Math.min(clickableElements.length, tlds.length); i++) {
			const clickableEl = clickableElements[i] as HTMLElement;
			const text = tlds[i];
			const marker = createMarker(text, clickableEl, this.input);
			if (marker) {
				this.markers.push(marker);
				containerInnerEl.appendChild(marker.el);
			}
		}
	}

	updateMarkers() {
		for (const marker of this.markers) {
			const rect = marker.parentEl.getBoundingClientRect();
			marker.el.setCssProps({
				"--top": `${rect.top}px`,
				"--left": `${rect.left}px`,
				display: marker.text.startsWith(this.input) ? "block" : "none"
			});
			updateMarkerText(marker, this.input);
		}
	}

	destroyMarkers() {
		// Remove parent container
		this.containerEl.parentNode?.removeChild(this.containerEl);

		// Delete markers
		this.markers = [];
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async onunload() {
		document.removeEventListener('keydown', this.handleKeyDown);
		document.removeEventListener('keyup', this.handleKeyUp);
	}
	
}

