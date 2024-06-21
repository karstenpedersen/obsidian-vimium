import { MarkerData } from "./types";

export function createMarkerText(text: string, markerEl: HTMLElement, input = "") {
	Array.from(text).forEach((char, index) => {
		const charEl = createSpan();
		charEl.setText(char.toUpperCase());
		if (input.length >= index && char === input[index]) {
			charEl.addClass("vimium-marker-char-match");
		}
		markerEl.appendChild(charEl);
	});
}

export function updateMarkerText(marker: MarkerData, input = "") {
	while (marker.el.firstChild) {
		marker.el.removeChild(marker.el.firstChild);
	}
	createMarkerText(marker.text, marker.el, input);
}

export function createMarkerEl(text: string, written: string, x: number, y: number): HTMLElement {
	const markerEl = createSpan()
	markerEl.addClass("vimium-marker");
	markerEl.setCssProps({
		"--top": `${y}px`, 
		"--left": `${x}px`,
	});
	createMarkerText(text, markerEl);
	return markerEl;
}

export function createMarker(text: string, parentEl: HTMLElement, written = ""): MarkerData | null {
	const rect = parentEl.getBoundingClientRect();

	if (rect.width === 0 || rect.height === 0) {
		return null;
	}

	const data: MarkerData = {
		el: createMarkerEl(text, written, rect.left, rect.top),
		parentEl,
		text
	};

	return data;
}

export function findMarkerMatch(text: string, markers: MarkerData[]): MarkerData | null {
	for (const marker of markers) {
		if (text === marker.text) {
			return marker;
		}
	}

	return null;
}

export function intToLetters(num: number) {
	return String.fromCharCode(97 + (num % 26));
}
