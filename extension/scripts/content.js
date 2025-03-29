const overlayTop = document.createElement("div");
const overlayBottom = document.createElement("div");

overlayTop.id = window.screenCalm.IDS.OVERLAY_TOP;
overlayTop.className = window.screenCalm.CLASS_NAMES.OVERLAY;

overlayBottom.id = window.screenCalm.IDS.OVERLAY_BOTTOM;
overlayBottom.className = window.screenCalm.CLASS_NAMES.OVERLAY;

document.body.appendChild(overlayTop);
document.body.appendChild(overlayBottom);

const toggleSettingsPanel = () => {
	const settingsPanel = document.getElementById(
		window.screenCalm.IDS.SETTINGS_CONTAINER_BODY,
	);

	if (settingsPanel) {
		settingsPanel.remove();
	} else {
		window.screenCalm.injectSettingsPanel();
	}
};

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
	console.log(request.action);
	if (request.action === "toggle-options") {
		toggleSettingsPanel();
	}
});
