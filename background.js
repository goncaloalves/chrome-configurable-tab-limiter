const STORAGE_KEY = 'maxTabsPerWindow';
let maxTabsPerWindow = 20; // Default value
let windowCounts = {};
let totalTabCount = -1;

async function getStoredMaxTabs() {
    try {
        const data = await chrome.storage.sync.get(STORAGE_KEY);
        return data[STORAGE_KEY] || 20;
    } catch (error) {
        console.error('Error retrieving stored max tabs:', error);
        return 20;
    }
}

async function setStoredMaxTabs(value) {
    try {
        await chrome.storage.sync.set({ [STORAGE_KEY]: value });
    } catch (error) {
        console.error('Error storing max tabs:', error);
    }
}

function getImageData(maxWindows) {
    const canvas = new OffscreenCanvas(100, 100);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "green";
    ctx.font = "normal 80px Arial";
    ctx.fillText(maxWindows.toString(), 10, 65);

    return ctx.getImageData(10, 10, 100, 100);
}

async function updateBadge() {
    try {
        const tabs = await chrome.tabs.query({});
        
        windowCounts = {};
        for (const tab of tabs) {
            windowCounts[tab.windowId] = (windowCounts[tab.windowId] || 0) + 1;
        }

        totalTabCount = tabs.length;

        for (const tab of tabs) {
            const windowTabCount = windowCounts[tab.windowId];
            const badgeText = `${windowTabCount}/${totalTabCount}`;
            await chrome.action.setBadgeText({ tabId: tab.id, text: badgeText });

            let color;
            if (windowTabCount >= maxTabsPerWindow) {
                color = "#FF0000";
            } else if (windowTabCount >= maxTabsPerWindow * 0.75) {
                color = "#FFBD33";
            } else {
                color = "#33FF57";
            }
            await chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color });
        }
    } catch (error) {
        console.error('Error updating badge:', error);
    }
}

chrome.runtime.onInstalled.addListener(async () => {
    console.log("Configurable Tab Limiter extension installed!");
    maxTabsPerWindow = await getStoredMaxTabs();
    console.log(`Installed - Max Tabs per Window: ${maxTabsPerWindow}`);
    await chrome.action.setIcon({ imageData: getImageData(maxTabsPerWindow) });
    await updateBadge();
});

// Modify the tabs.onCreated listener to respect the isLimitEnabled setting
chrome.tabs.onCreated.addListener(async (tab) => {
    try {
        const { isLimitEnabled } = await chrome.storage.sync.get('isLimitEnabled');
        if (isLimitEnabled) {
            const tabs = await chrome.tabs.query({ currentWindow: true });
            if (tabs.length > maxTabsPerWindow) {
                await chrome.tabs.remove(tab.id);
                console.log("Tab closed! Reached the maximum limit.");
            }
        }
        await updateBadge();
    } catch (error) {
        console.error('Error handling new tab:', error);
    }
});

chrome.tabs.onRemoved.addListener(updateBadge);
chrome.tabs.onAttached.addListener(updateBadge);

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (totalTabCount > -1) {
        try {
            const windowTabCount = windowCounts[tab.windowId];
            const badgeText = `${windowTabCount}/${totalTabCount}`;
            await chrome.action.setBadgeText({ tabId: tab.id, text: badgeText });

            let color;
            if (windowTabCount >= maxTabsPerWindow) {
                color = "#FF0000";
            } else if (windowTabCount >= maxTabsPerWindow * 0.75) {
                color = "#FFBD33";
            } else {
                color = "#33FF57";
            }
            await chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color });
        } catch (error) {
            console.error('Error updating badge for tab:', error);
        }
    } else {
        await updateBadge();
    }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'updateExtensionState') {
        const { isEnabled, maxTabs } = message.data;
        if (typeof isEnabled === 'boolean') {
            await chrome.storage.sync.set({ isLimitEnabled: isEnabled });
        }
        if (typeof maxTabs === 'number' && maxTabs > 0) {
            maxTabsPerWindow = maxTabs;
            await setStoredMaxTabs(maxTabsPerWindow);
            await chrome.action.setIcon({ imageData: getImageData(maxTabsPerWindow) });
        }
        await updateBadge();
    }
});

updateBadge();