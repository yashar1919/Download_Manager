import React, { useState, useEffect } from "react";
import URLInput from "./components/URLInput";
import DownloadDialog from "./components/DownloadDialog";
import DownloadItem from "./components/DownloadItem";
import ThemeSwitch from "./components/ThemeSwitch";

export default function App() {
  const [downloads, setDownloads] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [currentMetadata, setCurrentMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState("system");
  const [error, setError] = useState("");

  const applyTheme = (t) => {
    const resolved =
      t === "system"
        ? window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : t;

    document.documentElement.setAttribute("data-theme", resolved);
  };

  useEffect(() => {
    const saved = localStorage.getItem("dm-theme") || "system";
    setTheme(saved);
    applyTheme(saved);

    const systemMedia =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    const onSysChange = () => {
      if (localStorage.getItem("dm-theme") === "system") {
        applyTheme("system");
      }
    };

    if (systemMedia && systemMedia.addEventListener) {
      systemMedia.addEventListener("change", onSysChange);
      return () => systemMedia.removeEventListener("change", onSysChange);
    }
  }, []);

  // Listen for download progress updates
  useEffect(() => {
    if (!window.electron) return;

    const handleProgress = (event, downloadId, downloadData) => {
      setDownloads((prev) => {
        const existing = prev.find((d) => d.id === downloadId);
        if (existing) {
          return prev.map((d) =>
            d.id === downloadId ? { ...d, ...downloadData } : d,
          );
        } else {
          return [...prev, { ...downloadData, id: downloadId }];
        }
      });
    };

    window.electron.on?.("download-progress", handleProgress);

    return () => {
      window.electron.removeListener?.("download-progress", handleProgress);
    };
  }, []);

  // Fetch initial download list
  useEffect(() => {
    const loadDownloads = async () => {
      try {
        const list = await window.electron?.download?.list?.();
        if (list && !list.error) {
          setDownloads(list);
        }
      } catch (err) {
        console.error("Failed to load downloads:", err);
      }
    };

    loadDownloads();
  }, []);

  const handleUrlSubmit = async (url) => {
    setIsLoading(true);
    setError("");

    try {
      const metadata = await window.electron?.download?.fetchMetadata?.(url);

      if (metadata?.error) {
        setError(metadata.error);
        setIsLoading(false);
        return;
      }

      setCurrentUrl(url);
      setCurrentMetadata(metadata);
      setShowDialog(true);
    } catch (err) {
      setError("Failed to fetch file information: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("dm-theme", newTheme);
    applyTheme(newTheme);
  };

  const handleDownloadConfirm = async (destination, filename) => {
    setIsLoading(true);
    setError("");

    try {
      const downloadId = `download_${Date.now()}`;

      const result = await window.electron?.download?.start?.(
        downloadId,
        currentUrl,
        destination,
      );

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      // Add to downloads list
      const newDownload = {
        id: downloadId,
        url: currentUrl,
        destinationPath: destination,
        state: "downloading",
        bytesDownloaded: 0,
        totalBytes: currentMetadata?.fileSize || 0,
        speed: 0,
        eta: null,
      };

      setDownloads((prev) => [newDownload, ...prev]);
      setShowDialog(false);
      setCurrentUrl("");
      setCurrentMetadata(null);
    } catch (err) {
      setError("Failed to start download: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogCancel = () => {
    setShowDialog(false);
    setCurrentUrl("");
    setCurrentMetadata(null);
    setError("");
  };

  const handlePause = async (downloadId) => {
    try {
      const result = await window.electron?.download?.pause?.(downloadId);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to pause: " + err.message);
    }
  };

  const handleResume = async (downloadId) => {
    try {
      const result = await window.electron?.download?.resume?.(downloadId);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to resume: " + err.message);
    }
  };

  const handleCancel = async (downloadId) => {
    try {
      const result = await window.electron?.download?.cancel?.(downloadId);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to cancel: " + err.message);
    }
  };

  const handleClear = async (downloadId) => {
    try {
      await window.electron?.download?.clear?.(downloadId);
      setDownloads((prev) => prev.filter((d) => d.id !== downloadId));
    } catch (err) {
      setError("Failed to clear: " + err.message);
    }
  };

  const activeDownloads = downloads.filter(
    (d) => d.state === "downloading" || d.state === "paused",
  );
  const historyDownloads = downloads.filter(
    (d) =>
      d.state === "completed" || d.state === "cancelled" || d.state === "error",
  );

  const handleClearHistory = async () => {
    try {
      await Promise.all(
        historyDownloads.map((d) => window.electron?.download?.clear?.(d.id)),
      );
      setDownloads((prev) =>
        prev.filter(
          (d) =>
            d.state === "downloading" ||
            d.state === "paused" ||
            d.state === "queued",
        ),
      );
    } catch (err) {
      setError("Failed to clear history: " + err.message);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <img
            className="brand-logo"
            src="./logo.png"
            alt="Univision Studio logo"
          />
          <h1 className="app-title">Download Manager</h1>
        </div>
        <div className="header-controls">
          <ThemeSwitch theme={theme} onThemeChange={handleThemeChange} />
        </div>
      </header>

      <main className="main-content">
        {/* Error message */}
        {error && (
          <div className="global-error">
            <p>{error}</p>
            <button
              className="btn btn-icon"
              onClick={() => setError("")}
              title="Close"
            >
              ✕
            </button>
          </div>
        )}

        {/* URL Input Section */}
        <URLInput onSubmit={handleUrlSubmit} isLoading={isLoading} />

        {/* Active Downloads */}
        {activeDownloads.length > 0 && (
          <div className="downloads-section">
            <div className="section-header">
              <h2>Active Downloads ({activeDownloads.length})</h2>
            </div>

            <div className="downloads-list">
              {activeDownloads.map((download) => (
                <DownloadItem
                  key={download.id}
                  download={download}
                  onPause={handlePause}
                  onResume={handleResume}
                  onCancel={handleCancel}
                  onClear={handleClear}
                />
              ))}
            </div>
          </div>
        )}

        {/* Download History */}
        {historyDownloads.length > 0 && (
          <div className="downloads-section history-section">
            <div className="section-header">
              <h2>Download History ({historyDownloads.length})</h2>
              <button
                className="btn btn-secondary"
                onClick={handleClearHistory}
              >
                Clear History
              </button>
            </div>

            <div className="downloads-list">
              {historyDownloads.map((download) => (
                <DownloadItem
                  key={download.id}
                  download={download}
                  onPause={handlePause}
                  onResume={handleResume}
                  onCancel={handleCancel}
                  onClear={handleClear}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Download Dialog Modal */}
      {showDialog && (
        <DownloadDialog
          url={currentUrl}
          metadata={currentMetadata}
          onConfirm={handleDownloadConfirm}
          onCancel={handleDialogCancel}
          isLoading={isLoading}
        />
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Made with <span className="heart">❤</span> by{" "}
          <strong>Univision Studio</strong>
        </p>
      </footer>
    </div>
  );
}
