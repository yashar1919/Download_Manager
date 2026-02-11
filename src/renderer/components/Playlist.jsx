import React from "react";

export default function Playlist({
  tracks,
  currentTrackIndex,
  onTrackSelect,
  onRemoveTrack,
}) {
  if (tracks.length === 0) {
    return (
      <div className="playlist empty">
        <p className="empty-message">No tracks in playlist</p>
      </div>
    );
  }

  return (
    <div className="playlist">
      <h3 className="playlist-title">Playlist ({tracks.length})</h3>
      <div className="playlist-items">
        {tracks.map((track, index) => (
          <div
            key={index}
            className={`playlist-item ${
              index === currentTrackIndex ? "active" : ""
            }`}
            onClick={() => onTrackSelect(index)}
          >
            <div className="track-number">{index + 1}</div>
            <div className="track-details">
              <div className="track-title-small">{track.title}</div>
              <div className="track-filename">{track.name}</div>
            </div>
            <button
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveTrack(index);
              }}
              title="Remove from playlist"
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
          </div>
        ))}
      </div>
    </div>
  );
}
