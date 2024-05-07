function getImageData(maxWindows) {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");

  ctx.fillStyle = "green";
  ctx.font = "normal 80px Arial";
  ctx.fillText(maxWindows, 10, 65);

  return ctx.getImageData(10, 10, 100, 100);
}


document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'maxTabsPerWindow';
  const maxTabsDisplay = document.getElementById('max-tabs-display');
  const maxTabsInput = document.getElementById('max-tabs-input');
  const saveButton = document.getElementById('save-button');

  chrome.storage.sync.get(STORAGE_KEY, (data) => {
    maxTabsDisplay.textContent = data[STORAGE_KEY] || 20;
    maxTabsInput.value = data[STORAGE_KEY] || 20;

    chrome.action.setIcon({ imageData: getImageData(maxTabsInput.value) });
  });

  saveButton.addEventListener('click', () => {
    const newMax = parseInt(maxTabsInput.value);
    if (isNaN(newMax) || newMax < 1) {
      console.error('Invalid input: Please enter a number greater than 0');
      return;
    }
    chrome.runtime.sendMessage({ action: 'updateMaxTabs', data: {maxTabs: newMax} });
    chrome.action.setIcon({ imageData: getImageData(newMax)});
    window.close();
  });
});