(() => {
	const SETTING_DEFAULTS = {
		enabled: false,
		height: 0.7,
		opacity: 0.8,
		edge: 85,
		blur: 3,
		color: "#000000",
		showSettingsBtn: true,
	};
	const SETTING_KEYS = [
		"enabled",
		"height",
		"opacity",
		"edge",
		"blur",
		"color",
		"showSettingsBtn",
	];
	const IDS = {
		INPUT_BLUR: "screencalm-input-blur",
		INPUT_COLOR: "screencalm-input-color",
		INPUT_EDGE: "screencalm-input-edge",
		INPUT_ENABLED: "screencalm-input-enabled",
		INPUT_HEIGHT: "screencalm-input-height",
		INPUT_OPACITY: "screencalm-input-opacity",
		INPUT_PREFIX: "screencalm-input-",
		INPUT_SHOW_SETTINGS_BTN: "screencalm-input-showSettingsBtn",
		OVERLAY_BOTTOM: "screencalm-overlay-bottom",
		OVERLAY_TOP: "screencalm-overlay-top",
		SETTINGS_BTN_CLOSE: "screencalm-settings-btn-close",
		SETTINGS_BTN: "screencalm-settings-btn",
		SETTINGS_CONTAINER_BODY: "screencalm-settings-container-body",
		SETTINGS_CONTAINER_POPUP: "screencalm-settings-container-popup",
		SETTINGS_TITLE: "screencalm-settings-title",
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
	const PAGE_MARGIN_EXTRA_OFFSET = 8;

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

	const loadSettings = () => {
		chrome.storage.sync.get(SETTING_KEYS, (data) => {
			for (const key of SETTING_KEYS) {
				const input = document.getElementById(IDS.INPUT_PREFIX + key);

				if (input) {
					if (input.type === "checkbox") {
						console.log({ key, input, saved: data[key] });
						input.checked = data[key] ?? SETTING_DEFAULTS[key];
					} else {
						input.value = data[key] ?? SETTING_DEFAULTS[key];
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
	};

	const attachInputListeners = () => {
		for (const key of SETTING_KEYS) {
			const input = document.getElementById(IDS.INPUT_PREFIX + key);

			if (input) {
				input.addEventListener("input", () => {
					const value = input.type === "checkbox" ? input.checked : input.value;

					debouncedSaveSetting(key, value);
				});
			}
		}
	};

	const injectSettingsPanel = () => {
		const existingSettingsPanel = document.getElementById(
			window.screenCalm.IDS.SETTINGS_CONTAINER_BODY,
		);
		if (existingSettingsPanel) {
			return;
		}

		const settingsPanel = document.createElement("div");

		settingsPanel.id = window.screenCalm.IDS.SETTINGS_CONTAINER_BODY;
		settingsPanel.className = window.screenCalm.CLASS_NAMES.SETTINGS_CONTAINER;
		settingsPanel.innerHTML = window.screenCalm.makeSettingsHtml({
			withCloseButton: true,
		});

		document.body.appendChild(settingsPanel);
		document
			.getElementById(window.screenCalm.IDS.SETTINGS_BTN_CLOSE)
			.addEventListener("click", () => {
				settingsPanel.remove();
			});

		loadSettings();
		attachInputListeners();
	};

	const toggleSettingsButton = ({ showSettingsBtn }) => {
		const existingSettingsButton = document.getElementById(IDS.SETTINGS_BTN);

		if (existingSettingsButton && !showSettingsBtn) {
			existingSettingsButton.remove();

			return;
		}

		const isInBody = window.location.pathname !== "/popup.html";

		if (showSettingsBtn && isInBody) {
			const settingsBtn = document.createElement("button");

			settingsBtn.id = window.screenCalm.IDS.SETTINGS_BTN;
			settingsBtn.className = window.screenCalm.CLASS_NAMES.BTN;
			settingsBtn.innerHTML = "<b>Screen</b>Calm";

			settingsBtn.addEventListener("click", () => {
				injectSettingsPanel();
			});

			document.body.appendChild(settingsBtn);
		}
	};

	const makeSettingsHtml = ({ withCloseButton = false }) => {
		const closeBtn = `
			<button
				type="button"
				id="${IDS.SETTINGS_BTN_CLOSE}"
				class="${CLASS_NAMES.BTN}"
			>
				Close
			</button>
		`;

		const os = navigator.userAgentData?.platform;
		const SYMBOLS = {
			OPTION: "&#8997;",
			SHIFT: "&#8679;",
		};

		const shortCuts =
			os === "macOS"
				? `
					<p>
						Toggle ScreenCalm: <kbd>${SYMBOLS.OPTION}</kbd> + <kbd>${SYMBOLS.SHIFT}</kbd> + <kbd>S</kbd>
					</p>
					<p>
						Toggle Options Panel: <kbd>${SYMBOLS.OPTION}</kbd> + <kbd>${SYMBOLS.SHIFT}</kbd> + <kbd>O</kbd>
					</p>
				`
				: `
					<p>
						Toggle ScreenCalm: <kbd>Alt</kbd> + <kbd>${SYMBOLS.SHIFT}</kbd> + <kbd>S</kbd>
					</p>
					<p>
						Toggle Options Panel: <kbd>Alt</kbd> + <kbd>${SYMBOLS.SHIFT}</kbd> + <kbd>O</kbd>
					</p>
				`;

		return `
			<h1 id="${IDS.SETTINGS_TITLE}"><b>Screen</b>Calm</h1>

			<div class="screencalm-toggle-row">
				<label for="${IDS.INPUT_ENABLED}">Enabled</label>
				<label class="screencalm-toggle">
					<input type="checkbox" id="${IDS.INPUT_ENABLED}" />
					<span class="screencalm-toggle-slider"></span>
				</label>
			</div>

			<div class="screencalm-toggle-row">
				<label for="${IDS.INPUT_SHOW_SETTINGS_BTN}">
					📌 Options Button
				</label>
				<label class="screencalm-toggle">
					<input type="checkbox" id="${IDS.INPUT_SHOW_SETTINGS_BTN}" />
					<span class="screencalm-toggle-slider"></span>
				</label>
			</div>

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
					<span>Edge Sharpness</span>
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

			<h3>Keyboard Shortcuts</h3>

			${shortCuts}

			${withCloseButton ? closeBtn : ""}
		`;
	};

	const screenCalm = {
		IDS,
		CLASS_NAMES,
		makeSettingsHtml,
		loadSettings,
		attachInputListeners,
		toggleSettingsButton,
		injectSettingsPanel,
	};

	const redrawOverlays = ({ enabled, height, opacity, edge, blur, color }) => {
		const overlayTop = document.getElementById(IDS.OVERLAY_TOP);
		const overlayBottom = document.getElementById(IDS.OVERLAY_BOTTOM);

		const opacityHexDigits = Math.round(opacity * 255).toString(16);
		const colorAlpha = `${color}${opacityHexDigits}`;
		const heightCalc = `${Math.round(50 * height)}`;
		const heightInPercent = `${heightCalc}%`;
		const bodyOffsetPercent = `${Math.round(heightCalc / 2) + PAGE_MARGIN_EXTRA_OFFSET}%`;

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
		showSettingsBtn = SETTING_DEFAULTS.showSettingsBtn,
	}) => {
		redrawOverlays({
			enabled,
			height,
			opacity,
			edge,
			blur,
			color,
		});

		toggleSettingsButton({ showSettingsBtn });

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
