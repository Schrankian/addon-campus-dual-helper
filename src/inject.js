
function injectScript(src, modData) {
    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('data-modifications', JSON.stringify(modData));
    scriptElement.src = chrome.runtime.getURL(src);
    scriptElement.onload = () => scriptElement.remove();
    (document.head || document.documentElement).append(scriptElement);
}

chrome.storage.sync.get(["modData"]).then((result) => {
    console.info("Got default color", result.modData);
    if(!result.modData){
        result.modData = [];
    }
    injectScript('src/content.js', result.modData)
});

function elementPickedEvent(event){
    // Disable all other click functionality on the site
    event.stopPropagation();
    event.preventDefault();

    // Check if the clicked element or its ancestors have the 'fc-event-title' class
    const fcCalendarElement = event.target.closest('#calendar');
    if (!fcCalendarElement) {
        console.log('Not clicked inside calendar');
        console.log('Removing listener')
        removeOverlayStyle();
        document.removeEventListener('click', elementPickedEvent);
        return;
    };
    const fcEventElement = event.target.closest('.fc-event');
    if(!fcEventElement) return;
    const fcEventTitleElement = fcEventElement.querySelector('.fc-event-title');
    if(!fcEventTitleElement) return;

    // If clicked inside the 'fc-event-title' element, get its innerHTML
    const fcEventTitleInnerHTML = fcEventTitleElement.innerHTML.trim();
    console.log('Picked element', fcEventTitleInnerHTML);

    // Save this and send it to content script
    chrome.storage.sync.get(["modData"]).then((result) => {
        console.info("Got data", result.modData);
        if (!result.modData) {
            result.modData = [];
        }

        // Check if name is already in the list
        for(data of result.modData){
            if(data.name === fcEventTitleInnerHTML){
                console.log('Name already exists');
                return;
            }
        }

        result.modData.push({name: fcEventTitleInnerHTML, color: '#ff0000', hide: false});
        chrome.storage.sync.set({modData: result.modData}).then(() => {
            console.log("Data stored.");
            window.postMessage(result.modData);
        })
        // Remove the click listener after processing the click
        console.log('Removing listener')
        removeOverlayStyle();
        document.removeEventListener('click', elementPickedEvent, true);
    });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'updateContent') {
        window.postMessage(message.modData);
    }
    if(message.action === 'startPicker'){
        console.log('Starting picker')
        addOverlayStyle();
        document.addEventListener('click', elementPickedEvent, true);
    }
});

function addOverlayStyle(){
 document.body.style = "cursor: crosshair;"
    const overlayElement = document.createElement('div');
    overlayElement.style = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 1000; pointer-events: none;";
    overlayElement.id = "overlay";
    document.body.appendChild(overlayElement);
}

function removeOverlayStyle(){
    document.body.style = ""
    const overlayElement = document.querySelector('#overlay');
    if(overlayElement){
        overlayElement.remove();
    }
}