// popup.js
chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    let url = tabs[0].url;
    if (!url || !url.includes("https://selfservice.campus-dual.de/room")){
        document.body.style = "display:none";
    }
});
document.addEventListener('DOMContentLoaded', function () {
    const colorPicker = document.getElementById('colorPicker');
    const hideDisabledCheckbox = document.getElementById('hideDisabledCheckbox');
    const applyColorButton = document.getElementById('applyColor');
    const getDeaktivatedButton = document.getElementById('getDeaktivated');

    chrome.storage.sync.get(["disabledColor", "hideDisabled"]).then((result) => {
        console.info("Got default color", result.disabledColor);
        colorPicker.value = result.disabledColor ?? "#ffffff";
        hideDisabledCheckbox.checked = result.hideDisabled ?? false;
    });

    applyColorButton.addEventListener('click', async function () {
        const selectedColor = colorPicker.value;
        const hideDisabled = hideDisabledCheckbox.checked;
        let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        chrome.tabs.sendMessage(tab.id, { action: 'updateContent', disabledColor: selectedColor, hideDisabled: hideDisabled });

        chrome.storage.sync.set({disabledColor: selectedColor, hideDisabled: hideDisabled}).then(() => {
            console.log("Color stored.");
        })
    });
    getDeaktivatedButton.addEventListener('click', async function () {
        console.log("heyyy")
    })
});

