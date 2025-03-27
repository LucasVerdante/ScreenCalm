const overlayTop = document.createElement("div");
const overlayBottom = document.createElement("div");
const settingsBtn = document.createElement("button");

overlayTop.id = window.screenCalm.IDS.OVERLAY_TOP;
overlayTop.className = window.screenCalm.CLASS_NAMES.OVERLAY;

overlayBottom.id = window.screenCalm.IDS.OVERLAY_BOTTOM;
overlayBottom.className = window.screenCalm.CLASS_NAMES.OVERLAY;

settingsBtn.id = window.screenCalm.IDS.SETTINGS_BTN;
settingsBtn.className = window.screenCalm.CLASS_NAMES.BTN;
settingsBtn.innerHTML = "<b>Screen</b>Calm</span>";

settingsBtn.addEventListener("click", () => {
	if (!document.getElementById(window.screenCalm.IDS.SETTINGS_CONTAINER_BODY)) {
		injectSettingsPanel();
	}
});

document.body.appendChild(overlayTop);
document.body.appendChild(overlayBottom);
document.body.appendChild(settingsBtn);

function injectSettingsPanel() {
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

	window.screenCalm.loadSettings();
	window.screenCalm.attachInputListeners();
}
