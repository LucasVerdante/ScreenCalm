(() => {
	const SETTING_DEFAULTS = {
		enabled: false,
		height: 0.7,
		opacity: 0.8,
		edge: 85,
		blur: 5,
		color: "#000000",
	};
	const SETTING_KEYS = [
		"enabled",
		"height",
		"opacity",
		"edge",
		"blur",
		"color",
	];
	const IDS = {
		INPUT_BLUR: "screencalm-input-blur",
		INPUT_COLOR: "screencalm-input-color",
		INPUT_EDGE: "screencalm-input-edge",
		INPUT_ENABLED: "screencalm-input-enabled",
		INPUT_HEIGHT: "screencalm-input-height",
		INPUT_OPACITY: "screencalm-input-opacity",
		INPUT_PREFIX: "screencalm-input-",
		OVERLAY_BOTTOM: "screencalm-overlay-bottom",
		OVERLAY_TOP: "screencalm-overlay-top",
		SETTINGS_BTN_CLOSE: "screencalm-settings-btn-close",
		SETTINGS_BTN: "screencalm-settings-btn",
		SETTINGS_CONTAINER_BODY: "screencalm-settings-container-body",
		SETTINGS_CONTAINER_POPUP: "screencalm-settings-container-popup",
		SETTINGS_SECTION_HEADER: "screencalm-settings-section-header",
		SETTINGS_SECTION_INPUTS: "screencalm-settings-section-inputs",
		VALUE_DISPLAY_BLUR: "screencalm-value-display-blur",
		VALUE_DISPLAY_EDGE: "screencalm-value-display-edge",
		VALUE_DISPLAY_HEIGHT: "screencalm-value-display-height",
		VALUE_DISPLAY_OPACITY: "screencalm-value-display-opacity",
	};
	const CLASS_NAMES = {
		BTN: "screencalm-btn",
		OVERLAY: "screencalm-overlay",
		SETTINGS_CONTAINER: "screencalm-settings-container",
		VALUE_DISPLAY: "screencalm-value-display",
	};

	const debounce = (fn, delay) => {
		let timeout;
		return (...args) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => fn(...args), delay);
		};
	};

	// Debounce to avoid overloading the storage sync on range slider input
	const debouncedSaveSetting = debounce((key, value) => {
		chrome.storage.sync.set({ [key]: value });
	}, 200);

	const screenCalm = {
		IDS,
		CLASS_NAMES,

		makeSettingsHtml: ({ withCloseButton = false }) => {
			const closeBtn = `
				<button
					type="button"
					id="${IDS.SETTINGS_BTN_CLOSE}"
					class="${CLASS_NAMES.BTN}"
				>
					Close
				</button>`;

			return `
				<div id="${IDS.SETTINGS_SECTION_HEADER}">
					<h1><b>Screen</b>Calm</h1>

					<label>
						Enabled
						<input type="checkbox" id="${IDS.INPUT_ENABLED}" />
					</label>
				</div>

				<div id="${IDS.SETTINGS_SECTION_INPUTS}">
					<label>
						<div>
							<span>Height</span>
							<span
								class="${CLASS_NAMES.VALUE_DISPLAY}"
								id="${IDS.VALUE_DISPLAY_HEIGHT}"
							></span>
						</div>
						<input
							type="range"
							id="${IDS.INPUT_HEIGHT}"
							min="0"
							max="1"
							step="0.01"
						>
					</label>

					<label>
						<div>
							<span>Opacity</span>
							<span
								class="${CLASS_NAMES.VALUE_DISPLAY}"
								id="${IDS.VALUE_DISPLAY_OPACITY}"
							></span>
						</div>
						<input
							type="range"
							id="${IDS.INPUT_OPACITY}"
							min="0"
							max="1"
							step="0.01"
						>
					</label>

					<label>
						<div>
							<span>Edge Blur</span>
							<span
								class="${CLASS_NAMES.VALUE_DISPLAY}"
								id="${IDS.VALUE_DISPLAY_EDGE}"
							></span>
						</div>
						<input
							type="range"
							id="${IDS.INPUT_EDGE}"
							min="0"
							max="100"
						>
					</label>

					<label>
						<div>
							<span>Background Blur</span>
							<span
								class="${CLASS_NAMES.VALUE_DISPLAY}"
								id="${IDS.VALUE_DISPLAY_BLUR}"
							></span>
						</div>
						<input
							type="range"
							id="${IDS.INPUT_BLUR}"
							min="0"
							max="10"
						>
					</label>

					<label>
						Color
						<input
							type="color"
							id="${IDS.INPUT_COLOR}"
							value="${SETTING_DEFAULTS.color}"
						>
					</label>
				</div>

				<h3>Keyboard Shortcuts</h3>

				<p>Windows: <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd></p>
				<p>Mac: <kbd>Option</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd></p>

				${withCloseButton ? closeBtn : ""}
			`;
		},

		loadSettings: () => {
			chrome.storage.sync.get(SETTING_KEYS, (data) => {
				for (const key of SETTING_KEYS) {
					const input = document.getElementById(IDS.INPUT_PREFIX + key);

					if (input) {
						if (input.type === "checkbox") {
							input.checked = data[key] || SETTING_DEFAULTS[key];
						} else {
							input.value = data[key] || SETTING_DEFAULTS[key];
						}
					}
				}

				updateValueDisplays({
					height: data.height || SETTING_DEFAULTS.height,
					opacity: data.opacity || SETTING_DEFAULTS.opacity,
					edge: data.edge || SETTING_DEFAULTS.edge,
					blur: data.blur || SETTING_DEFAULTS.blur,
				});
			});
		},

		attachInputListeners: () => {
			for (const key of SETTING_KEYS) {
				const input = document.getElementById(IDS.INPUT_PREFIX + key);

				if (input) {
					input.addEventListener("input", () => {
						const value =
							input.type === "checkbox" ? input.checked : input.value;

						debouncedSaveSetting(key, value);
					});
				}
			}
		},
	};

	const redrawOverlays = ({ enabled, height, opacity, edge, blur, color }) => {
		const overlayTop = document.getElementById(IDS.OVERLAY_TOP);
		const overlayBottom = document.getElementById(IDS.OVERLAY_BOTTOM);

		const opacityHexDigits = Math.round(opacity * 255).toString(16);
		const colorAlpha = `${color}${opacityHexDigits}`;
		const heightCalc = `${Math.round(50 * height)}`;
		const heightInPercent = `${heightCalc}%`;
		const bodyOffsetPercent = `${Math.round(heightCalc / 2) + 2}%`;

		if (overlayTop && overlayBottom) {
			if (enabled) {
				overlayTop.style.display = "block";
				overlayBottom.style.display = "block";
				document.body.style.marginTop = bodyOffsetPercent;
				document.body.style.marginBottom = bodyOffsetPercent;
			} else {
				overlayTop.style.display = "none";
				overlayBottom.style.display = "none";
				document.body.style.marginTop = "auto";
				document.body.style.marginBottom = "auto";
			}

			overlayTop.style.background = `linear-gradient(180deg, ${colorAlpha} ${edge}%, ${color}00 100%)`;
			overlayTop.style.height = heightInPercent;
			overlayTop.style.top = 0;
			overlayTop.style.backdropFilter = `blur(${blur}px)`;

			overlayBottom.style.background = `linear-gradient(0deg, ${colorAlpha} ${edge}%, ${color}00 100%)`;
			overlayBottom.style.height = heightInPercent;
			overlayBottom.style.top = `${100 - heightCalc}%`;
			overlayBottom.style.backdropFilter = `blur(${blur}px)`;
		}
	};

	const updateValueDisplays = ({ height, opacity, edge, blur }) => {
		const displayHeight = document.getElementById(IDS.VALUE_DISPLAY_HEIGHT);
		const displayOpacity = document.getElementById(IDS.VALUE_DISPLAY_OPACITY);
		const displayEdge = document.getElementById(IDS.VALUE_DISPLAY_EDGE);
		const displayBlur = document.getElementById(IDS.VALUE_DISPLAY_BLUR);

		console.log({ height, opacity, edge, blur });

		if (displayHeight) displayHeight.innerText = `${Math.round(height * 100)}%`;
		if (displayOpacity)
			displayOpacity.innerText = `${Math.round(opacity * 100)}%`;
		if (displayEdge) displayEdge.innerText = `${edge}%`;
		if (displayBlur) displayBlur.innerText = `${blur}px`;
	};

	const updateAllVisuals = ({
		enabled = SETTING_DEFAULTS.enabled,
		height = SETTING_DEFAULTS.height,
		opacity = SETTING_DEFAULTS.opacity,
		edge = SETTING_DEFAULTS.edge,
		blur = SETTING_DEFAULTS.blur,
		color = SETTING_DEFAULTS.color,
	}) => {
		redrawOverlays({
			enabled,
			height,
			opacity,
			edge,
			blur,
			color,
		});

		updateValueDisplays({
			height,
			opacity,
			edge,
			blur,
		});
	};

	// Add screenCalm to window for other scripts to access
	if (!window.screenCalm) {
		window.screenCalm = screenCalm;
	}

	// Initial load
	chrome.storage.sync.get(SETTING_KEYS, updateAllVisuals);

	// React to changes
	chrome.storage.onChanged.addListener((_changes, area) => {
		if (area === "sync") {
			chrome.storage.sync.get(SETTING_KEYS, updateAllVisuals);
		}
	});
})();
