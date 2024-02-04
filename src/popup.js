// popup.js
chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    let url = tabs[0].url;
    if (!url || !url.includes("https://selfservice.campus-dual.de/room")){
        document.body.style = "display:none";
    }
});

const sendMessage = async(action, content) => {
    let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab) return;
    chrome.tabs.sendMessage(tab.id, { action: action, modData: content });
}

const removeElement = (name)=>{
    let row = document.getElementById(name);
    row.remove();

    chrome.storage.sync.get(["modData"]).then((result) => {
        console.info("Got data", result.modData);
        let modData = result.modData.filter((data) => data.name !== name);
        chrome.storage.sync.set({modData: modData}).then(() => {
            console.log("Color stored.");
        })
        sendMessage('updateContent', modData);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const applyColorButton = document.getElementById('applyColor');
    const elementPickerButton = document.getElementById('elementPicker');

    chrome.storage.sync.get(["modData"]).then((result) => {
    console.info("Got data", result.modData);
    for(let data of result.modData){
        ((data) => { // Necessary to create a new scope for the data. Otherwise only the last element would be used for the removal
            let row = document.createElement('tr');
            row.id = data.name;
            let name = document.createElement('td');
            let color = document.createElement('input');
            color.type = 'color';
            let hide = document.createElement('input');
            hide.type = 'checkbox';
            let remove = document.createElement('button');
            remove.innerText = 'X';
            remove.onclick = ()=>{removeElement(data.name)};

            name.innerText = data.name;
            color.value = data.color;
            hide.checked = data.hide;

            row.appendChild(name);
            row.appendChild(color);
            row.appendChild(hide);
            row.appendChild(remove);
            document.getElementById('content').appendChild(row);
        })(data);
    }
});

    applyColorButton.addEventListener('click', async function () {
        let modData = [];
        let rows = document.getElementById('content').children;
        for (let row of rows) {
            let name = row.id;
            let color = row.children[1].value;
            let hide = row.children[2].checked;
            modData.push({ name: name, color: color, hide: hide });
        }
        console.log('Sending message', modData);
        sendMessage('updateContent', modData);

        chrome.storage.sync.set({modData: modData}).then(() => {
            console.log("Color stored.");
        })
    });
    elementPickerButton.addEventListener('click', async function () {
        sendMessage('startPicker');
    })
});