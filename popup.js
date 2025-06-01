document.addEventListener('DOMContentLoaded', function() {
    const syncButton = document.getElementById('syncButton');
    if (syncButton) {
        syncButton.addEventListener('click', function() {
            console.log("Sync button clicked, sending message to background to sync bookmarks.");
            chrome.runtime.sendMessage({ action: "syncBookmarksOnPopupOpen" }, function(response) {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError.message);
                } else if (response && response.status === "success") {
                    console.log("Bookmarks sync initiated successfully by popup.");
                } else if (response && response.status === "error") {
                    console.error("Background script reported an error during sync:", response.message);
                } else {
                    console.log("Background script response:", response);
                }
            });
        });
    } else {
        console.error('Sync button not found.');
    }
});
