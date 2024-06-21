export const CLICKABLE_SELECTOR_LIST = [
	".clickable",
	".clickable-icon",
	".is-clickable",
	".mod-clickable",
	".workspace-tab-header",
	".empty-state-action",
	".workspace-tab-header-inner-close-button",
	".menu-item",
	".workspace-drawer-vault-switcher",
	// Canvas
	".canvas-control-item",
	".canvas-card-menu-button",
	".canvas-color-picker-item",
	// Elements
	"a",
	"button",
	"input[type='button']",
	"input[type='submit']",
	"input[type='reset']",
	"[role='button']",
	"[tabindex]",
];

export const CLICKABLE_SELECTOR = CLICKABLE_SELECTOR_LIST.join(", ");
