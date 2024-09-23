# Configurable Tab Limiter

## Description
Configurable Tab Limiter is a Chrome extension that helps users manage their browser tabs by limiting the number of tabs that can be opened in each window. The limit is configurable, and users can enable or disable the limiting feature as needed.

## Features
- Set a maximum number of tabs per window
- Enable or disable tab limiting
- Visual indicator of tab count and limit status
- Customizable icon showing the current tab limit

## File Structure
The extension consists of the following files:

1. `manifest.json`: This file is the extension's configuration file. It defines the extension's permissions, background script, popup, and other metadata.

2. `background.js`: This is the main script that runs in the background. It handles:
   - Tab creation and removal
   - Updating the extension's icon and badge
   - Storing and retrieving user settings
   - Communicating with the popup

3. `popup.html`: This file defines the structure of the popup that appears when users click the extension icon in the toolbar.

4. `popup.js`: This script handles the user interface in the popup, including:
   - Displaying the current tab limit
   - Allowing users to change the tab limit
   - Enabling or disabling the tab limiting feature

## How It Works
- The extension monitors tab creation events.
- If a new tab would exceed the user-set limit, it is automatically closed.
- The extension icon displays the current tab limit.
- The badge on the icon shows the current number of tabs in the window and the total number of tabs across all windows.
- Users can adjust settings via the popup interface.

## Installation (Unpacked Extension)
To install the Configurable Tab Limiter as an unpacked extension:

1. Clone or download this repository to your local machine.

2. Open Google Chrome and navigate to `chrome://extensions`.

3. In the top right corner, enable "Developer mode" if it's not already enabled.

4. Click on the "Load unpacked" button that appears.

5. Navigate to the directory where you saved the extension files and select the folder.

6. The extension should now appear in your list of installed extensions and in your toolbar.

## Usage
- Click on the extension icon in the toolbar to open the popup.
- Use the slider to adjust the maximum number of tabs allowed per window.
- Use the toggle switch to enable or disable tab limiting.
- The extension icon will update to show the current tab limit.
- The badge on the icon will show the current tab count for the window and the total tab count.

## Troubleshooting
If you encounter any issues:
- Ensure all files are in the correct location.
- Try reloading the extension from the `chrome://extensions` page.
- Check the browser console for any error messages.

## Contributing
Contributions to improve Configurable Tab Limiter are welcome. Please feel free to submit pull requests or create issues for bugs and feature requests.

## License
This extension is licensed under the MIT License: https://opensource.org/licenses/MIT.