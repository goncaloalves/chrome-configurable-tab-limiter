const STORAGE_KEY = 'maxTabsPerWindow';
let maxTabsPerWindow = 20; // Default value

chrome.storage.sync.get(STORAGE_KEY, (data) => {
    maxTabsPerWindow = data[STORAGE_KEY] || 20;
});

let windowCounts = {};
let totalTabCount = -1;

function getImageData(maxWindows) {
    let canvas = new OffscreenCanvas(100, 100);;
    let ctx = canvas.getContext("2d");

    //ctx.fillStyle = "green";
    //ctx.fillRect(10, 10, 100, 100);

    ctx.fillStyle = "green";
    ctx.font = "normal 80px Arial";
    ctx.fillText(maxWindows, 10, 65);

    return ctx.getImageData(10, 10, 100, 100);
}

function updateBadge() {
    chrome.tabs.query({}, (tabs) => {
        
        windowCounts = {}; // Object to store window ID as key and tab count as value

        for (const tab of tabs) {
            if (!windowCounts.hasOwnProperty(tab.windowId)) {
                windowCounts[tab.windowId] = 0;
            }
            windowCounts[tab.windowId]++; // Increment count for the tab's window
        }

        totalTabCount = tabs.length;

        tabs.forEach((tab) => {
            const windowTabCount = windowCounts[tab.windowId];
            const badgeText = `${windowTabCount}/${totalTabCount}`;
            chrome.action.setBadgeText({ tabId: tab.id, text: badgeText });

            if (windowTabCount >= maxTabsPerWindow) {
                chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: "#FF0000" }); // Set badge color to red
                //console.log(`Window ${tab.windowId} - Tab ID ${tab.id} - Max Tabs per Window ${maxTabsPerWindow} - Tab Count Per Window ${tabCountPerWindow[g]} - RED`)
            } else if (windowTabCount >= maxTabsPerWindow * 0.75) {
                chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: "#FFBD33" }); // Set badge color to yellow
                //console.log(`Window ${tab.windowId} - Tab ID ${tab.id} - Max Tabs per Window ${maxTabsPerWindow} - Tab Count Per Window ${tabCountPerWindow[g]} - YELLOW`)
            } else {
                chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: "#33FF57" }); // Set badge color to green
                //console.log(`Window ${tab.windowId} - Tab ID ${tab.id} - Max Tabs per Window ${maxTabsPerWindow} - Tab Count Per Window ${tabCountPerWindow[g]} - GREEN`)
            }

        });
    });
}

//
// On Installed
//

chrome.runtime.onInstalled.addListener(() => {
    console.log("Configurable Tab Limiter extension installed!");

    chrome.storage.sync.get(STORAGE_KEY, (data) => {
        maxTabsPerWindow = data[STORAGE_KEY] || 20; // Use default if not set
        console.log(`Installed - Max Tabs per Window: ${maxTabsPerWindow}`);
        chrome.action.setIcon({ imageData: getImageData(maxTabsPerWindow) });
    });

    updateBadge();
});

//
// On Created
//

chrome.tabs.onCreated.addListener((tab) => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => { //tabs per window
        console.log(`Tabs Length ${tabs.length}`)
        if (tabs.length > maxTabsPerWindow) {
            chrome.tabs.remove(tab.id);
            console.log("Tab closed! Reached the maximum limit.");
        }else{
            updateBadge();
        }
    });
});

//
// On Removed
//

chrome.tabs.onRemoved.addListener((tabId, changeInfo, tab) => {

    updateBadge();

});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    if (totalTabCount > -1) {
        console.log(`updating from cache...`)

        const windowTabCount = windowCounts[tab.windowId];
        const badgeText = `${windowTabCount}/${totalTabCount}`;
        chrome.action.setBadgeText({ tabId: tab.id, text: badgeText });

        //const color = getBadgeColor(windowTabCount, maxTabsPerWindow);
        //chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color });

        if (windowTabCount >= maxTabsPerWindow) {
            chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: "#FF0000" }); // Set badge color to red
            //console.log(`Window ${tab.windowId} - Tab ID ${tab.id} - Max Tabs per Window ${maxTabsPerWindow} - Tab Count Per Window ${tabCountPerWindow[g]} - RED`)
        } else if (windowTabCount >= maxTabsPerWindow * 0.75) {
            chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: "#FFBD33" }); // Set badge color to yellow
            //console.log(`Window ${tab.windowId} - Tab ID ${tab.id} - Max Tabs per Window ${maxTabsPerWindow} - Tab Count Per Window ${tabCountPerWindow[g]} - YELLOW`)
        } else {
            chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: "#33FF57" }); // Set badge color to green
            //console.log(`Window ${tab.windowId} - Tab ID ${tab.id} - Max Tabs per Window ${maxTabsPerWindow} - Tab Count Per Window ${tabCountPerWindow[g]} - GREEN`)
        }

    }
    else {
        updateBadge();
    }

    console.log(`Updated - Max Tabs Per Window: ${maxTabsPerWindow}`)
});

//
// On Message
//

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateMaxTabs') {
        maxTabsPerWindow = message.data.maxTabs;
        chrome.storage.sync.set({ [STORAGE_KEY]: maxTabsPerWindow });
        console.log(`Max tabs per window updated to: ${maxTabsPerWindow}`);
    }
});

chrome.tabs.onAttached.addListener((tabId, changeInfo, tab) => {

    updateBadge();

});