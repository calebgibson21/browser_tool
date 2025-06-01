import performInitialBookmarkSync from './modules/bookmarkSync.js'

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log("Extension installed");
                performInitialBookmarkSync();
    } else if (details.reason === "update") {
        console.log('Extension updated');
        // Optionally, you might want to sync on update as well
        // performInitialBookmarkSync(); 
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "syncBookmarksOnPopupOpen") {
        console.log("Popup opened, syncing bookmarks...");
        performInitialBookmarkSync().then(() => {
            sendResponse({status: "success"});
        }).catch(error => {
            console.error("Error syncing bookmarks from popup request:", error);
            sendResponse({status: "error", message: error.message});
        });
        return true; // Indicates that the response will be sent asynchronously
    } else if (request.action === "syncBookmarks") {
        console.log("Syncing bookmarks...");
        performInitialBookmarkSync().then(() => {
            sendResponse({status: "success"});
        }).catch(error => {
            console.error("Error syncing bookmarks:", error);
            sendResponse({status: "error", message: error.message});
        });
        return true; // Indicates that the response will be sent asynchronously
    }
});