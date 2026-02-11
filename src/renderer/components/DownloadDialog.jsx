import React, { useState, useEffect } from "react";

/**
 * DownloadDialog - Modal for confirming download details
 * Shows:
 * - Filename (editable)
 * - File size
 * - Save destination
 */
export default function DownloadDialog({
  url,
  metadata,
  onConfirm,
  onCancel,
  isLoading,
}) {
  const [filename, setFilename] = useState("");
  const [destination, setDestination] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (metadata && metadata.fileName) {
      setFilename(metadata.fileName);
    }
  }, [metadata]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "Unknown";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
  };

  const selectDestination = async () => {
    try {
      const selected = await window.electron?.download?.selectDestination?.(
        filename
      );
      if (selected) {
        setDestination(selected);
        setError("");
      }
    } catch (err) {
      setError("Failed to select destination: " + err.message);
    }
  };

  const handleConfirm = () => {
    if (!destination.trim()) {
      setError("Please select a download destination");
      return;
    }
    if (!filename.trim()) {
      setError("Please enter a filename");
      return;
    }
    onConfirm(destination, filename);
  };

  return (
    <div className="modal-overlay">
      <div className="modal download-dialog">
        <h2>Download File</h2>

        {/* URL Display */}
        <div className="dialog-field">
          <label>URL</label>
          <div className="url-display">{url}</div>
        </div>

        {/* Filename */}
        <div className="dialog-field">
          <label htmlFor="filename">Filename</label>
          <input
            id="filename"
            type="text"
            className="input"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* File Size */}
        {metadata?.fileSize !== undefined && (
          <div className="dialog-field">
            <label>File Size</label>
            <div className="file-size">
              {formatFileSize(metadata.fileSize)}
              {!metadata.supportsResume && (
                <span className="hint">(Resume not supported)</span>
              )}
            </div>
          </div>
        )}

        {/* Destination */}
        <div className="dialog-field">
          <label>Save to</label>
          <div className="destination-selector">
            <div className="destination-path">
              {destination || "Choose location..."}
            </div>
            <button
              className="btn btn-secondary"
              onClick={selectDestination}
              disabled={isLoading}
            >
              Browse
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && <div className="error-message">{error}</div>}

        {/* Actions */}
        <div className="modal-actions">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={isLoading || !destination}
          >
            {isLoading ? "Starting..." : "Start Download"}
          </button>
        </div>
      </div>
    </div>
  );
}
