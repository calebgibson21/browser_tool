// Store structure
const storageData = {
    'allBookmarks': [
      {
        id: 'bookmark_id',
        title: 'Page Title',
        url: 'https://example.com',
        dateAdded: 1234567890,
        folderPath: 'Work/Development',
        searchText: 'page title https://example.com work development',
        isProcessed: false,
        content: null // Will be filled later
      }
    ],
    'searchIndex': { /* Processed search data */ },
    'lastSyncTime': 1234567890,
    'settings': { /* User preferences */ }
  };