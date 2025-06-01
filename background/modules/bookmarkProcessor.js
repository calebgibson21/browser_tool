export function flattenBookmarkTree(bookmarkNodes) {
    const bookmarks = [];

    function traverse(nodes, folderPath = '') {
        for (const node of nodes) {
            if (node.url) {
                bookmarks.push({
                    id: node.id,
                    title: node.title,
                    url: node.url,
                    dateAdded: node.dateAdded,
                    folderPath: folderPath,
                    parentId: node.parentId
                });
            } else if (node.children) {
                // traverse the folder
                const newPath = folderPath ? `${folderPath}/${node.title}` : node.title;
                traverse(node.children, newPath);
            }
        }
    }
    traverse(bookmarkNodes);
    return bookmarks;
}

export async function processAndStoreBookmarks(bookmarks) {
    // Create searchable index
    const searchableBookmarks = bookmarks.map(bookmark => ({
      ...bookmark,
      searchText: `${bookmark.title} ${bookmark.url} ${bookmark.folderPath}`.toLowerCase(),
      isProcessed: false // Flag for content extraction later
    }));
    
    // Store in chrome.storage.local
    await chrome.storage.local.set({
      'allBookmarks': searchableBookmarks,
      'lastSyncTime': Date.now(),
      'totalBookmarks': searchableBookmarks.length
    });
    
    // Set up for future content processing
    // scheduleContentExtraction(searchableBookmarks);
  }


