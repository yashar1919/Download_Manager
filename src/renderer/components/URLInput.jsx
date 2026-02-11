import React, { useState, useEffect } from "react";

/**
 * URLInput - Component for entering download URLs
 * Features:
 * - Manual URL input
 * - Paste URL button
 * - Clipboard detection (auto-suggest)
 * - URL validation feedback
 */
export default function URLInput({ onSubmit, isLoading }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [clipboardSuggestion, setClipboardSuggestion] = useState("");

  useEffect(() => {
    // Listen for clipboard URL detection
    if (!window.electron) return;

    const handleClipboardUrl = (event, detectedUrl) => {
      setClipboardSuggestion(detectedUrl);
    };

    window.electron.on?.("clipboard-url-detected", handleClipboardUrl);

    return () => {
      window.electron.removeListener?.(
        "clipboard-url-detected",
        handleClipboardUrl
      );
    };
  }, []);

  const validateUrl = (urlString) => {
    try {
      const parsed = new URL(urlString);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUrl(value);
    setError("");
    setClipboardSuggestion("");
  };

  const handleSubmit = (urlToSubmit = url) => {
    if (!urlToSubmit.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (!validateUrl(urlToSubmit)) {
      setError("Invalid URL (must start with http:// or https://)");
      return;
    }

    setError("");
    setClipboardSuggestion("");
    setUrl("");
    onSubmit(urlToSubmit);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      if (validateUrl(text)) {
        handleSubmit(text);
      } else {
        setError("Clipboard does not contain a valid URL");
      }
    } catch (err) {
      setError("Failed to read clipboard");
    }
  };

  const handleAcceptSuggestion = () => {
    setUrl(clipboardSuggestion);
    handleSubmit(clipboardSuggestion);
  };

  return (
    <div className="url-input-container">
      <h2>Enter Download URL</h2>

      {/* Clipboard suggestion */}
      {clipboardSuggestion && !url && (
        <div className="clipboard-suggestion">
          <p>URL detected in clipboard:</p>
          <div className="suggestion-url">{clipboardSuggestion}</div>
          <button
            className="btn btn-primary"
            onClick={handleAcceptSuggestion}
            disabled={isLoading}
          >
            Download This
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setClipboardSuggestion("")}
            disabled={isLoading}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* URL Input */}
      <div className="input-group">
        <input
          type="text"
          className={`url-input ${error ? "error" : ""}`}
          placeholder="https://example.com/file.zip"
          value={url}
          onChange={handleInputChange}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
          disabled={isLoading}
        />
        <button
          className="btn btn-icon"
          onClick={handlePaste}
          title="Paste from clipboard"
          disabled={isLoading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
          </svg>
        </button>
      </div>

      {/* Error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Submit button */}
      <button
        className="btn btn-primary btn-large"
        onClick={() => handleSubmit()}
        disabled={isLoading || !url.trim()}
      >
        {isLoading ? "Processing..." : "Download"}
      </button>
    </div>
  );
}
