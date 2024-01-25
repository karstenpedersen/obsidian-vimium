import { MarkerData } from "./types";

export function createMarkerEl(text: string, written: string, x: number, y: number): HTMLElement {
	const markerEl = createSpan()
	markerEl.addClass("vimium-marker");
	markerEl.setText(text);
	markerEl.setAttr("data-written", written);
	markerEl.setCssProps({
		"--top": `${y}px`, 
		"--left": `${x}px`,
	});
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
