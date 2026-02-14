const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    versions: process.versions,

    // Download management IPC
    download: {
        // Fetch metadata about a URL
        fetchMetadata: (url) => ipcRenderer.invoke('download-fetch-metadata', url),

        // Select download destination
        selectDestination: (defaultFilename, defaultDirectory) =>
            ipcRenderer.invoke('download-select-destination', defaultFilename, defaultDirectory),

        // Start a download
        start: (downloadId, url, destinationPath) =>
            ipcRenderer.invoke('download-start', downloadId, url, destinationPath),

        // Pause a download
        pause: (downloadId) => ipcRenderer.invoke('download-pause', downloadId),

        // Resume a download
        resume: (downloadId) => ipcRenderer.invoke('download-resume', downloadId),

        // Cancel a download
        cancel: (downloadId) => ipcRenderer.invoke('download-cancel', downloadId),

        // Get status of a download
        getStatus: (downloadId) => ipcRenderer.invoke('download-status', downloadId),

        // Get all downloads
        list: () => ipcRenderer.invoke('download-list'),

        // Clear download from history
        clear: (downloadId) => ipcRenderer.invoke('download-clear', downloadId),
    },

    // Event listeners
    on: (channel, listener) => {
        // Whitelist allowed channels
        const validChannels = ['download-progress', 'clipboard-url-detected'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, listener);
        }
    },

    // Remove listener
    removeListener: (channel, listener) => {
        ipcRenderer.removeListener(channel, listener);
    },
});