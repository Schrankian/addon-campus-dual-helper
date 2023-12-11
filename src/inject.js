
function injectScript(src, disabledColor, hideDisabled) {
    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('data-disabledColor', disabledColor);
    scriptElement.setAttribute('data-hideDisabled', hideDisabled);
    scriptElement.src = chrome.runtime.getURL(src);
    scriptElement.onload = () => scriptElement.remove();
    (document.head || document.documentElement).append(scriptElement);
}

chrome.storage.sync.get(["disabledColor", "hideDisabled"]).then((result) => {
    console.info("Got default color", result.disabledColor, result.hideDisabled);
    injectScript('src/content.js', result.disabledColor, result.hideDisabled)
});



chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'updateContent') {
        window.postMessage({ disabledColor: message.disabledColor , hideDisabled: message.hideDisabled});
    }
});
