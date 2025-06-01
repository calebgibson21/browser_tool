// background/storageManager.js
const StorageManager = {
    async storeInitialBookmarks(bookmarks) {
      console.log(`Storing ${bookmarks.length} bookmarks...`);
      
      try {
        // Check if we have enough storage space
        await this.checkStorageQuota(bookmarks);
        
        // Store the main bookmark data
        await chrome.storage.local.set({
          'allBookmarks': bookmarks,
          'totalBookmarks': bookmarks.length,
          'lastSyncTime': Date.now(),
          'syncStatus': 'completed'
        });
        
        // Create initial search index for fast searching
        await this.buildSearchIndex(bookmarks);
        
        console.log('Storage completed successfully');
        
      } catch (error) {
        // Handle storage failures gracefully
        await chrome.storage.local.set({
          'syncStatus': 'failed',
          'lastSyncAttempt': Date.now(),
          'errorMessage': error.message
        });
        throw error;
      }
    },
    
    async checkStorageQuota(bookmarks) {
      const estimatedSize = JSON.stringify(bookmarks).length;
      const quota = chrome.storage.local.QUOTA_BYTES; // ~5MB
      
      if (estimatedSize > quota * 0.8) {
        throw new Error('Not enough storage space for bookmarks');
      }
    },
    
    async buildSearchIndex(bookmarks) {
      // Create optimized search structures
      const searchIndex = {};
      
      bookmarks.forEach(bookmark => {
        const words = bookmark.searchText.split(' ');
        words.forEach(word => {
          if (!searchIndex[word]) searchIndex[word] = [];
          searchIndex[word].push(bookmark.id);
        });
      });
      
      await chrome.storage.local.set({ 'searchIndex': searchIndex });
    }
  };