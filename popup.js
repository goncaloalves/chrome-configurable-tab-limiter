function getImageData(maxWindows) {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");

  ctx.fillStyle = "green";
  ctx.font = "normal 80px Arial";
  ctx.fillText(maxWindows, 10, 65);

  return ctx.getImageData(10, 10, 100, 100);
}


document.addEventListener('DOMContentLoaded', () => {
  const MAX_TABS_KEY = 'maxTabsPerWindow';
  const LIMIT_ENABLED_KEY = 'isLimitEnabled';
  const maxTabsDisplay = document.getElementById('max-tabs-display');
  const maxTabsInput = document.getElementById('max-tabs-input');
  const switchButton = document.getElementById('switch-button');

  // Load saved values
  chrome.storage.sync.get([MAX_TABS_KEY, LIMIT_ENABLED_KEY], (data) => {
    const savedMaxTabs = data[MAX_TABS_KEY] || 20;
    const isLimitEnabled = data[LIMIT_ENABLED_KEY] !== undefined ? data[LIMIT_ENABLED_KEY] : true;

    maxTabsDisplay.textContent = savedMaxTabs;
    maxTabsInput.value = savedMaxTabs;
    switchButton.checked = isLimitEnabled;
    chrome.action.setIcon({ imageData: getImageData(savedMaxTabs) });
  });

  maxTabsInput.addEventListener('input', () => {
    const newMax = parseInt(maxTabsInput.value);
    if (isNaN(newMax) || newMax < 1) {
      console.error('Invalid input: Please enter a number greater than 0');
      return;
    }
    maxTabsDisplay.textContent = newMax;
    chrome.storage.sync.set({ [MAX_TABS_KEY]: newMax }, () => {
      console.log('Max tabs value saved:', newMax);
    });
    chrome.action.setIcon({ imageData: getImageData(newMax) });
    updateExtensionState(switchButton.checked, newMax);
  });

  switchButton.addEventListener('change', () => {
    const isLimitEnabled = switchButton.checked;
    chrome.storage.sync.set({ [LIMIT_ENABLED_KEY]: isLimitEnabled }, () => {
      console.log('Tab limit enabled state saved:', isLimitEnabled);
    });
    updateExtensionState(isLimitEnabled, parseInt(maxTabsInput.value));
  });

  function updateExtensionState(isLimitEnabled, maxTabs) {
    chrome.runtime.sendMessage({ 
      action: 'updateExtensionState', 
      data: { isEnabled: isLimitEnabled, maxTabs } 
    });
  }
});