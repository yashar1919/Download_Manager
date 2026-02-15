const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { EventEmitter } = require('events');
const { BrowserWindow } = require('electron');

/**
 * DownloadManager - Handles all download operations
 * Features:
 * - Stream-based downloading (memory efficient)
 * - Pause/Resume support via HTTP Range requests
 * - Progress tracking
 * - Error handling and recovery
 * - Multiple concurrent downloads
 */
class DownloadManager extends EventEmitter {
    constructor() {
        super();
        this.downloads = new Map(); // id -> download metadata
        this.downloadStreams = new Map(); // id -> stream
        this.storagePath = null;
        this.saveTimer = null;
    }

    setStoragePath(userDataDir) {
        this.storagePath = path.join(userDataDir, 'downloads.json');
        this.loadFromDisk();
    }

    loadFromDisk() {
        if (!this.storagePath || !fs.existsSync(this.storagePath)) {
            return;
        }

        try {
            const raw = fs.readFileSync(this.storagePath, 'utf8');
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                return;
            }

            parsed.forEach((entry) => {
                if (!entry || !entry.id) return;
                const normalized = {
                    ...entry,
                    state: entry.state === 'downloading' ? 'paused' : entry.state,
                };
                this.downloads.set(entry.id, normalized);
            });
        } catch (err) {
            console.error('Failed to load downloads history:', err);
        }
    }

    scheduleSave() {
        if (!this.storagePath) return;
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }

        this.saveTimer = setTimeout(() => {
            this.saveTimer = null;
            this.persistDownloads();
        }, 300);
    }

    persistDownloads() {
        if (!this.storagePath) return;
        try {
            const data = Array.from(this.downloads.values());
            fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2), 'utf8');
        } catch (err) {
            console.error('Failed to save downloads history:', err);
        }
    }

    /**
     * Follow HTTP redirects (3xx status codes)
     * @param {string} urlString - Initial URL
     * @param {number} maxRedirects - Maximum redirects to follow (default: 5)
     * @returns {Promise<string>} - Final URL after following redirects
     */
    async followRedirects(urlString, maxRedirects = 5) {
        if (maxRedirects <= 0) {
            throw new Error('Too many redirects');
        }

        const url = new URL(urlString);
        const protocol = url.protocol === 'https:' ? https : http;

        return new Promise((resolve, reject) => {
            const request = protocol.request(url, { method: 'HEAD' }, (res) => {
                // Handle redirects (3xx)
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    request.destroy();
                    let nextUrl = res.headers.location;

                    // Handle relative URLs
                    if (!nextUrl.startsWith('http://') && !nextUrl.startsWith('https://')) {
                        nextUrl = new URL(nextUrl, urlString).href;
                    }

                    // Recursively follow the redirect
                    this.followRedirects(nextUrl, maxRedirects - 1)
                        .then(resolve)
                        .catch(reject);
                } else {
                    // No redirect, return the current URL
                    request.destroy();
                    resolve(urlString);
                }
            });

            request.on('error', (err) => {
                reject(err);
            });

            request.setTimeout(5000, () => {
                request.destroy();
                reject(new Error('Redirect follow timeout'));
            });

            request.end();
        });
    }

    /**
     * Validates if a URL is downloadable
     * @param {string} urlString - URL to validate
     * @returns {boolean}
     */
    isValidUrl(urlString) {
        try {
            const url = new URL(urlString);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
            return false;
        }
    }

    /**
     * Get file extension from URL or Content-Type header
     * @param {string} urlString - Download URL
     * @param {object} headers - HTTP response headers
     * @returns {Promise<string>} - File extension with dot (e.g., '.mp4')
     */
    async getFileExtension(urlString, headers = {}) {
        // Try to extract from URL pathname
        const urlPath = new URL(urlString).pathname;
        const urlExt = path.extname(urlPath);
        if (urlExt && urlExt.length > 1 && urlExt.length < 10) {
            return urlExt;
        }

        // Try Content-Disposition header
        const contentDisposition = headers['content-disposition'];
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (filenameMatch) {
                return path.extname(filenameMatch[1]);
            }
        }

        // Try Content-Type header
        const contentType = headers['content-type'] || '';
        const mimeToExt = {
            'application/pdf': '.pdf',
            'video/mp4': '.mp4',
            'video/x-matroska': '.mkv',
            'audio/mpeg': '.mp3',
            'audio/mp4': '.m4a',
            'application/zip': '.zip',
            'application/x-rar-compressed': '.rar',
            'application/x-iso9660-image': '.iso',
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'application/x-gzip': '.gz',
            'application/x-tar': '.tar',
        };

        for (const [mime, ext] of Object.entries(mimeToExt)) {
            if (contentType.includes(mime)) {
                return ext;
            }
        }

        return '.download'; // Default fallback
    }

    /**
     * Get file name from URL or headers
     * @param {string} urlString - Download URL
     * @param {object} headers - HTTP response headers
     * @returns {string} - Filename without path
     */
    getFileName(urlString, headers = {}) {
        // Try Content-Disposition header first
        const contentDisposition = headers['content-disposition'];
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (filenameMatch) {
                return filenameMatch[1];
            }
        }

        // Extract from URL pathname
        const urlPath = new URL(urlString).pathname;
        const filename = path.basename(urlPath);

        // If filename looks reasonable, use it
        if (filename && filename.length > 0 && filename !== '/') {
            return decodeURIComponent(filename);
        }

        // Generate a default name
        return `download_${Date.now()}`;
    }

    /**
     * Fetch file metadata (size, filename, etc.) without downloading
     * @param {string} urlString - Download URL
     * @returns {Promise<object>} - Metadata object
     */
    async fetchMetadata(urlString) {
        // Follow redirects first
        try {
            urlString = await this.followRedirects(urlString);
        } catch (err) {
            console.warn('Redirect follow failed, trying original URL:', err.message);
            // Continue with original URL if redirect fails
        }

        return new Promise((resolve, reject) => {
            const url = new URL(urlString);
            const protocol = url.protocol === 'https:' ? https : http;

            const request = protocol.request(url, { method: 'HEAD' }, (res) => {
                // Handle redirects in metadata fetch too
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    request.destroy();
                    const nextUrl = res.headers.location.startsWith('http')
                        ? res.headers.location
                        : new URL(res.headers.location, urlString).href;
                    this.fetchMetadata(nextUrl).then(resolve).catch(reject);
                    return;
                }

                const supportsRange = res.headers['accept-ranges'] === 'bytes';
                const contentLength = parseInt(res.headers['content-length'] || '0', 10);
                const fileName = this.getFileName(urlString, res.headers);
                const fileExt = path.extname(fileName) || '.download';

                request.destroy();

                resolve({
                    fileName,
                    fileExtension: fileExt,
                    fileSize: contentLength,
                    supportsResume: supportsRange && contentLength > 0,
                });
            });

            request.on('error', (err) => {
                reject(err);
            });

            request.setTimeout(5000, () => {
                request.destroy();
                reject(new Error('Metadata fetch timeout'));
            });

            request.end();
        });
    }

    /**
     * Start a new download
     * @param {string} downloadId - Unique identifier for this download
     * @param {string} urlString - URL to download
     * @param {string} destinationPath - Full file path to save to
     * @param {object} options - Optional parameters (resume, redirectCount)
     * @returns {Promise<void>}
     */
    async startDownload(downloadId, urlString, destinationPath, options = {}) {
        // Limit redirects to prevent infinite loops
        if (!options.redirectCount) {
            options.redirectCount = 0;
        }
        if (options.redirectCount > 5) {
            throw new Error('Too many redirects');
        }

        // Allow resuming existing downloads
        if (this.downloads.has(downloadId) && !options.resume) {
            throw new Error(`Download ${downloadId} already exists`);
        }

        if (!this.isValidUrl(urlString)) {
            throw new Error('Invalid URL');
        }

        // Get or create download metadata
        let downloadData = this.downloads.get(downloadId);
        if (!downloadData) {
            downloadData = {
                id: downloadId,
                url: urlString,
                destinationPath,
                startTime: Date.now(),
                bytesDownloaded: 0,
                totalBytes: 0,
                state: 'downloading', // downloading, paused, completed, error
                error: null,
                speed: 0,
                eta: null,
                supportsResume: false,
            };
            this.downloads.set(downloadId, downloadData);
            this.scheduleSave();
        } else {
            // Resuming existing download
            downloadData.state = 'downloading';
            downloadData.error = null;
            this.scheduleSave();
        }

        try {
            // Follow redirects to get final URL
            try {
                urlString = await this.followRedirects(urlString);
                downloadData.url = urlString; // Update stored URL to final URL
            } catch (err) {
                console.warn('Redirect follow failed, trying original URL:', err.message);
                // Continue with original URL if redirect fails
            }

            // If resuming a partial download, get current file size
            let startByte = 0;
            if (options.resume && fs.existsSync(destinationPath)) {
                startByte = fs.statSync(destinationPath).size;
                downloadData.bytesDownloaded = startByte;
            }

            // Fetch metadata only for new downloads
            if (!options.resume || downloadData.totalBytes === 0) {
                const metadata = await this.fetchMetadata(urlString);
                downloadData.totalBytes = metadata.fileSize || 0;
                downloadData.supportsResume = metadata.supportsResume;

                if (downloadData.totalBytes === 0) {
                    downloadData.supportsResume = false;
                }
            }

            // Open file for appending (if resuming)
            const fileStream = fs.createWriteStream(destinationPath, {
                flags: options.resume ? 'a' : 'w',
            });

            // Setup download request
            const url = new URL(urlString);
            const protocol = url.protocol === 'https:' ? https : http;

            const headers = {};
            if (startByte > 0 && downloadData.supportsResume) {
                headers['Range'] = `bytes=${startByte}-`;
            }

            const request = protocol.request(url, { headers }, (res) => {
                // Handle redirects in download request too
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    fileStream.destroy();
                    request.destroy();
                    const nextUrl = res.headers.location.startsWith('http')
                        ? res.headers.location
                        : new URL(res.headers.location, urlString).href;
                    // Retry with redirect URL
                    options.redirectCount = (options.redirectCount || 0) + 1;
                    this.startDownload(downloadId, nextUrl, destinationPath, options).catch((err) => {
                        downloadData.state = 'error';
                        downloadData.error = err.message;
                        this.downloads.set(downloadId, downloadData);
                        this.emitProgress(downloadId);
                        this.scheduleSave();
                    });
                    return;
                }

                // Update total bytes if not already set
                if (res.statusCode === 206 || res.statusCode === 200) {
                    if (res.headers['content-length']) {
                        const contentLength = parseInt(res.headers['content-length'], 10);
                        if (res.statusCode === 206 && startByte > 0) {
                            // Range response - total is original + new
                            downloadData.totalBytes = startByte + contentLength;
                        } else {
                            downloadData.totalBytes = contentLength;
                        }
                    }

                    // Pipe to file
                    res.pipe(fileStream);

                    // Track progress
                    let lastUpdateTime = Date.now();
                    let lastBytes = startByte;

                    res.on('data', (chunk) => {
                        downloadData.bytesDownloaded += chunk.length;

                        // Update speed and ETA every 100ms
                        const now = Date.now();
                        if (now - lastUpdateTime > 100) {
                            const bytesDelta = downloadData.bytesDownloaded - lastBytes;
                            const timeDelta = (now - lastUpdateTime) / 1000; // seconds
                            downloadData.speed = bytesDelta / timeDelta;

                            if (downloadData.speed > 0 && downloadData.totalBytes > 0) {
                                const bytesRemaining = downloadData.totalBytes - downloadData.bytesDownloaded;
                                downloadData.eta = bytesRemaining / downloadData.speed;
                            }

                            lastUpdateTime = now;
                            lastBytes = downloadData.bytesDownloaded;

                            // Emit progress update
                            this.emitProgress(downloadId);
                            this.scheduleSave();
                        }
                    });

                    res.on('error', (err) => {
                        // Skip error handling if download was paused
                        if (downloadData.state === 'paused') {
                            return;
                        }
                        downloadData.state = 'error';
                        downloadData.error = err.message;
                        fileStream.destroy();
                        this.downloads.set(downloadId, downloadData);
                        this.emitProgress(downloadId);
                        this.scheduleSave();
                    });
                } else {
                    downloadData.state = 'error';
                    downloadData.error = `HTTP ${res.statusCode}`;
                    fileStream.destroy();
                    this.downloads.set(downloadId, downloadData);
                    this.emitProgress(downloadId);
                    this.scheduleSave();
                }
            });

            request.on('error', (err) => {
                downloadData.state = 'error';
                downloadData.error = err.message;
                fileStream.destroy();
                this.downloads.set(downloadId, downloadData);
                this.emitProgress(downloadId);
                this.scheduleSave();
            });

            // Store stream reference for pause/resume
            this.downloadStreams.set(downloadId, { request, fileStream, isPausing: false });

            // Handle completion
            fileStream.on('finish', () => {
                if (downloadData.state !== 'error') {
                    downloadData.state = 'completed';
                    downloadData.bytesDownloaded = downloadData.totalBytes;
                    this.downloads.set(downloadId, downloadData);
                    this.emitProgress(downloadId);
                    this.downloadStreams.delete(downloadId);
                    this.scheduleSave();
                }
            });

            fileStream.on('error', (err) => {
                downloadData.state = 'error';
                downloadData.error = err.message;
                this.downloads.set(downloadId, downloadData);
                this.emitProgress(downloadId);
                this.downloadStreams.delete(downloadId);
                this.scheduleSave();
            });

            request.end();
        } catch (err) {
            downloadData.state = 'error';
            downloadData.error = err.message;
            this.downloads.set(downloadId, downloadData);
            this.emitProgress(downloadId);
            this.scheduleSave();
        }
    }

    /**
     * Pause an active download
     * @param {string} downloadId - Download identifier
     */
    pauseDownload(downloadId) {
        const downloadData = this.downloads.get(downloadId);
        if (!downloadData) {
            throw new Error(`Download ${downloadId} not found`);
        }

        if (downloadData.state !== 'downloading') {
            throw new Error(`Download is ${downloadData.state}, cannot pause`);
        }

        // First, update state to paused BEFORE destroying streams
        downloadData.state = 'paused';
        this.downloads.set(downloadId, downloadData);
        this.emitProgress(downloadId);

        const streams = this.downloadStreams.get(downloadId);
        if (streams) {
            try {
                // Replace response error handler to ignore expected errors
                streams.request.on('error', () => {
                    // Ignore errors during pause
                });

                // Destroy request to stop receiving data
                streams.request.destroy();

                // Gracefully close file stream so pause/resume works
                if (streams.fileStream && !streams.fileStream.destroyed) {
                    streams.fileStream.destroy();
                }

                this.downloadStreams.delete(downloadId);
            } catch (err) {
                console.warn('Error while destroying streams:', err.message);
            }
        }

        this.scheduleSave();
    }

    /**
     * Resume a paused download
     * @param {string} downloadId - Download identifier
     */
    async resumeDownload(downloadId) {
        const downloadData = this.downloads.get(downloadId);
        if (!downloadData) {
            throw new Error(`Download ${downloadId} not found`);
        }

        if (downloadData.state !== 'paused') {
            throw new Error(`Download is ${downloadData.state}, cannot resume`);
        }

        downloadData.state = 'downloading';
        this.downloads.set(downloadId, downloadData);
        this.scheduleSave();

        // Restart download from where we left off
        await this.startDownload(downloadId, downloadData.url, downloadData.destinationPath, {
            resume: true,
        });
    }

    /**
     * Cancel a download
     * @param {string} downloadId - Download identifier
     */
    cancelDownload(downloadId) {
        const downloadData = this.downloads.get(downloadId);
        if (!downloadData) {
            throw new Error(`Download ${downloadId} not found`);
        }

        // Destroy streams
        const streams = this.downloadStreams.get(downloadId);
        if (streams) {
            streams.request.destroy();
            streams.fileStream.destroy();
            this.downloadStreams.delete(downloadId);
        }

        downloadData.state = 'cancelled';
        this.downloads.set(downloadId, downloadData);

        // Optionally delete partial file
        if (fs.existsSync(downloadData.destinationPath)) {
            try {
                fs.unlinkSync(downloadData.destinationPath);
            } catch (err) {
                console.error('Failed to delete partial file:', err);
            }
        }

        this.emitProgress(downloadId);
        this.scheduleSave();
    }

    /**
     * Get download status
     * @param {string} downloadId - Download identifier
     * @returns {object} - Download metadata
     */
    getDownloadStatus(downloadId) {
        return this.downloads.get(downloadId) || null;
    }

    /**
     * Get all downloads
     * @returns {Array<object>}
     */
    getAllDownloads() {
        return Array.from(this.downloads.values());
    }

    /**
     * Emit progress update to renderer
     * @param {string} downloadId - Download identifier
     */
    emitProgress(downloadId) {
        const downloadData = this.downloads.get(downloadId);
        if (downloadData) {
            // Send to all renderer windows
            const wins = require('electron').BrowserWindow.getAllWindows();
            wins.forEach((win) => {
                win.webContents.send('download-progress', downloadId, downloadData);
            });
        }
    }

    /**
     * Clear completed/cancelled downloads
     * @param {string} downloadId - Download identifier (optional, clears all if not provided)
     */
    clearDownload(downloadId) {
        if (downloadId) {
            this.downloads.delete(downloadId);
        } else {
            // Clear all completed/cancelled
            for (const [id, data] of this.downloads.entries()) {
                if (data.state === 'completed' || data.state === 'cancelled' || data.state === 'error') {
                    this.downloads.delete(id);
                }
            }
        }
        this.scheduleSave();
    }
}

module.exports = DownloadManager;
