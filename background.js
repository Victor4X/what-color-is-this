chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.message == 'capture') {
		chrome.tabs.captureVisibleTab(chrome.windows.WINDOW_ID_CURRENT, function(dataUri) {
			sendResponse({imgSrc: dataUri, message: 'done'});
			return true;
		});
	}
	return true;
  });