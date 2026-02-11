import React from "react";

/**
 * DownloadItem - Individual download row
 * Displays progress, status, controls, and metadata
 */
export default function DownloadItem({
  download,
  onPause,
  onResume,
  onCancel,
  onClear,
}) {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds === Infinity) return "--:--";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m}m ${s}s`;
  };

  const getProgressPercentage = () => {
    if (!download.totalBytes || download.totalBytes === 0) return 0;
    return Math.min(
      100,
      (download.bytesDownloaded / download.totalBytes) * 100
    );
  };

  const getStatusIcon = () => {
    switch (download.state) {
      case "downloading":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        );
      case "paused":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        );
      case "completed":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        );
      case "error":
      case "cancelled":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusLabel = () => {
    switch (download.state) {
      case "downloading":
        return "Downloading";
      case "paused":
        return "Paused";
      case "completed":
        return "Completed";
      case "error":
        return `Error: ${download.error}`;
      case "cancelled":
        return "Cancelled";
      default:
        return download.state;
    }
  };

  const progress = getProgressPercentage();

  return (
    <div className={`download-item download-${download.state}`}>
      <div className="download-header">
        <div className="download-title">
          <span className="status-icon">{getStatusIcon()}</span>
          <div className="title-text">
            <h4>{download.id}</h4>
            <p className="status">{getStatusLabel()}</p>
          </div>
        </div>
        <div className="download-actions">
          {download.state === "downloading" && (
            <button
              className="btn btn-icon"
              onClick={() => onPause(download.id)}
              title="Pause"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            </button>
          )}
          {download.state === "paused" && (
            <button
              className="btn btn-icon"
              onClick={() => onResume(download.id)}
              title="Resume"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}
          {(download.state === "downloading" ||
            download.state === "paused") && (
            <button
              className="btn btn-icon btn-danger"
              onClick={() => onCancel(download.id)}
              title="Cancel"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          )}
          {(download.state === "completed" ||
            download.state === "cancelled" ||
            download.state === "error") && (
            <button
              className="btn btn-icon"
              onClick={() => onClear(download.id)}
              title="Clear"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {download.state === "downloading" || download.state === "paused" ? (
        <>
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{Math.round(progress)}%</span>
          </div>

          {/* Details */}
          <div className="download-details">
            <div className="detail">
              {formatFileSize(download.bytesDownloaded)} /{" "}
              {formatFileSize(download.totalBytes)}
            </div>
            <div className="detail">
              {download.speed > 0
                ? formatFileSize(download.speed) + "/s"
                : "-- B/s"}
            </div>
            <div className="detail">ETA: {formatTime(download.eta)}</div>
          </div>
        </>
      ) : null}

      {/* Completed/Error details */}
      {download.state === "completed" && (
        <div className="download-details">
          <div className="detail">
            Total: {formatFileSize(download.totalBytes)}
          </div>
        </div>
      )}
    </div>
  );
}
