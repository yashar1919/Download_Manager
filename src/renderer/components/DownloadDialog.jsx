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
  defaultDirectory,
  onConfirm,
  onCancel,
  isLoading,
}) {
  const [filename, setFilename] = useState("");
  const [destination, setDestination] = useState("");
  const [destinationDir, setDestinationDir] = useState("");
  const [error, setError] = useState("");

  const extractDirectory = (filePath) => {
    if (!filePath) return "";
    const slashIndex = Math.max(
      filePath.lastIndexOf("/"),
      filePath.lastIndexOf("\\"),
    );
    return slashIndex > 0 ? filePath.slice(0, slashIndex) : "";
  };

  const joinPath = (dir, file) => {
    if (!dir) return file;
    const separator = dir.includes("\\") ? "\\" : "/";
    return dir.endsWith(separator)
      ? `${dir}${file}`
      : `${dir}${separator}${file}`;
  };

  useEffect(() => {
    if (metadata && metadata.fileName) {
      setFilename(metadata.fileName);
    }
  }, [metadata]);

  useEffect(() => {
    if (!destination && defaultDirectory) {
      setDestinationDir(defaultDirectory);
    }
  }, [defaultDirectory, destination]);

  useEffect(() => {
    if (!destinationDir || !filename.trim()) return;
    setDestination(joinPath(destinationDir, filename.trim()));
  }, [destinationDir, filename]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "Unknown";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
  };

  const selectDestination = async () => {
    try {
      const defaultDir = destinationDir || defaultDirectory || "";
      const selected = await window.electron?.download?.selectDestination?.(
        filename,
        defaultDir,
      );
      if (selected) {
        setDestination(selected);
        setDestinationDir(extractDirectory(selected));
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
