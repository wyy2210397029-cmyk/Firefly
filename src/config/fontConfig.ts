// Font configuration.
// For faster access in mainland China, the default setup uses system fonts only.
export const fontConfig = {
	enable: false,
	preload: false,
	selected: ["system"],

	fonts: {
		system: {
			id: "system",
			name: "System Font",
			src: "",
			family:
				"system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
		},
	},

	fallback: [
		"system-ui",
		"-apple-system",
		"BlinkMacSystemFont",
		"Segoe UI",
		"Roboto",
		"Noto Sans SC",
		"PingFang SC",
		"Microsoft YaHei",
		"sans-serif",
	],
};
