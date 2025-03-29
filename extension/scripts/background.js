chrome.commands.onCommand.addListener((command) => {
	if (command === "toggle-screencalm") {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const tabId = tabs[0].id;

			chrome.scripting.executeScript({
				target: { tabId },
				func: () => {
					chrome.storage.sync.get(["enabled"], ({ enabled }) => {
						chrome.storage.sync.set({ enabled: !enabled });
					});
				},
			});
		});
	}

	if (command === "toggle-options") {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			chrome.tabs.sendMessage(tabs[0].id, { action: command });
		});
	}
});
