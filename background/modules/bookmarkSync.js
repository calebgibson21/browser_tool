import { processAndStoreBookmarks, flattenBookmarkTree } from './bookmarkProcessor.js'

export default async function performInitialBookmarkSync() {
    try {
        console.log("Starting bookmark sync process...");

        // 1. Get current bookmarks from the browser
        const bookmarkTree = await chrome.bookmarks.getTree();
        const currentBrowserBookmarks = flattenBookmarkTree(bookmarkTree);
        console.log(`Found ${currentBrowserBookmarks.length} bookmarks in the browser.`);

        // 2. Get previously synced bookmarks from local storage
        const data = await chrome.storage.local.get('allBookmarks');
        const storedBookmarks = data.allBookmarks || []; // data.allBookmarks is the array from processAndStoreBookmarks
        console.log(`Found ${storedBookmarks.length} bookmarks in local storage.`);

        // 3. Identify new bookmarks (bookmarks in browser but not in local storage by ID)
        const newBookmarks = currentBrowserBookmarks.filter(
            browserBmk => !storedBookmarks.some(storedBmk => storedBmk.id === browserBmk.id)
        );

        if (newBookmarks.length > 0) {
            console.log(`Found ${newBookmarks.length} new bookmarks to sync to the API.`);

            // 4. Send ONLY new bookmarks to the backend API
            try {
                const response = await fetch('http://127.0.0.1:5000/api/bookmarks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newBookmarks), // Send only the new ones
                });
                if (response.ok) {
                    const result = await response.json();
                    console.log(`New bookmarks sent to API successfully: ${result.message}`);
                } else {
                    console.error(`Failed to send new bookmarks to API: ${response.status}`, await response.text());
                }
            } catch (apiError) {
                console.error('Error sending new bookmarks to API:', apiError);
            }

            // 5. Update local storage with ALL current browser bookmarks
            await processAndStoreBookmarks(currentBrowserBookmarks);
            console.log(`Local storage updated with ${currentBrowserBookmarks.length} total bookmarks. ${newBookmarks.length} were new and sent to API.`);

        } else {
            console.log('No new bookmarks found. All bookmarks are already in local storage. API sync not needed.');
            // Still update local storage to catch modifications or deletions and update sync time
            await processAndStoreBookmarks(currentBrowserBookmarks);
            console.log(`Local storage refreshed with ${currentBrowserBookmarks.length} total bookmarks. No new bookmarks were sent to the API.`);
        }

    } catch (error) {
        console.error('Failed to sync bookmarks', error);
    }
}

