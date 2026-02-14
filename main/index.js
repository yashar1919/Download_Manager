const { app, BrowserWindow, ipcMain, dialog, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const DownloadManager = require('./downloadManager');

// Initialize download manager
const downloadManager = new DownloadManager();

// Store last clipboard content to detect changes
let lastClipboardContent = '';

/**
 * IPC Handler: Fetch metadata about a URL without downloading
 */
ipcMain.handle('download-fetch-metadata', async (event, url) => {
    try {
        if (!downloadManager.isValidUrl(url)) {
            return { error: 'Invalid URL' };
        }
        const metadata = await downloadManager.fetchMetadata(url);
        return metadata;
    } catch (err) {
        console.error('fetch-metadata error:', err);
        return { error: err.message };
    }
});

/**
 * IPC Handler: Select download destination directory
 */
ipcMain.handle(
    'download-select-destination',
    async (event, defaultFilename, defaultDirectory) => {
        try {
            const baseDirectory =
                defaultDirectory && defaultDirectory.trim()
                    ? defaultDirectory
                    : path.join(os.homedir(), 'Downloads');
            const result = await dialog.showSaveDialog({
                defaultPath: path.join(baseDirectory, defaultFilename),
                properties: ['createDirectory'],
            });

            if (result.canceled) {
                return null;
            }

            return result.filePath;
        } catch (err) {
            console.error('select-destination error:', err);
            return { error: err.message };
        }
    }
);

/**
 * IPC Handler: Start a download
 */
ipcMain.handle('download-start', async (event, downloadId, url, destinationPath) => {
    try {
        await downloadManager.startDownload(downloadId, url, destinationPath);
        return { success: true };
    } catch (err) {
        console.error('download-start error:', err);
        return { error: err.message };
    }
});

/**
 * IPC Handler: Pause a download
 */
ipcMain.handle('download-pause', async (event, downloadId) => {
    try {
        downloadManager.pauseDownload(downloadId);
        return { success: true };
    } catch (err) {
        console.error('download-pause error:', err);
        return { error: err.message };
    }
});

/**
 * IPC Handler: Resume a download
 */
ipcMain.handle('download-resume', async (event, downloadId) => {
    try {
        await downloadManager.resumeDownload(downloadId);
        return { success: true };
    } catch (err) {
        console.error('download-resume error:', err);
        return { error: err.message };
    }
});

/**
 * IPC Handler: Cancel a download
 */
ipcMain.handle('download-cancel', async (event, downloadId) => {
    try {
        downloadManager.cancelDownload(downloadId);
        return { success: true };
    } catch (err) {
        console.error('download-cancel error:', err);
        return { error: err.message };
    }
});

/**
 * IPC Handler: Get download status
 */
ipcMain.handle('download-status', async (event, downloadId) => {
    try {
        const status = downloadManager.getDownloadStatus(downloadId);
        return status || { error: 'Download not found' };
    } catch (err) {
        console.error('download-status error:', err);
        return { error: err.message };
    }
});

/**
 * IPC Handler: Get all downloads
 */
ipcMain.handle('download-list', async (event) => {
    try {
        return downloadManager.getAllDownloads();
    } catch (err) {
        console.error('download-list error:', err);
        return { error: err.message };
    }
});

/**
 * IPC Handler: Clear a download from history
 */
ipcMain.handle('download-clear', async (event, downloadId) => {
    try {
        downloadManager.clearDownload(downloadId);
        return { success: true };
    } catch (err) {
        console.error('download-clear error:', err);
        return { error: err.message };
    }
});

/**
 * Monitor clipboard for URLs
 */
function startClipboardMonitor() {
    setInterval(() => {
        try {
            const currentContent = clipboard.readText();
            if (currentContent !== lastClipboardContent) {
                lastClipboardContent = currentContent;

                // Check if it looks like a URL
                if (downloadManager.isValidUrl(currentContent)) {
                    // Send to all renderer windows
                    const wins = BrowserWindow.getAllWindows();
                    wins.forEach((win) => {
                        win.webContents.send('clipboard-url-detected', currentContent);
                    });
                }
            }
        } catch (err) {
            // Clipboard access might fail in some environments, ignore
        }
    }, 500); // Check every 500ms
}

function createWindow() {
    const win = new BrowserWindow({
        width: 700,
        height: 600,
        minWidth: 600,
        minHeight: 500,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            // Disable sandbox for Linux compatibility
            sandbox: false
        }
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL);
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

// App lifecycle
app.whenReady().then(() => {
    downloadManager.setStoragePath(app.getPath('userData'));
    createWindow();
    startClipboardMonitor();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Handle second-instance for single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, focus our window
        const win = BrowserWindow.getAllWindows()[0];
        if (win) {
            if (win.isMinimized()) win.restore();
            win.focus();
        }
    });
}