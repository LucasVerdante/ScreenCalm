document.addEventListener("DOMContentLoaded", () => {
	const containerInPopup = document.getElementById(
		window.screenCalm.IDS.SETTINGS_CONTAINER_POPUP,
	);

	containerInPopup.innerHTML = window.screenCalm.makeSettingsHtml({
		withCloseButton: false,
	});

	window.screenCalm.loadSettings();
	window.screenCalm.attachInputListeners();
});
