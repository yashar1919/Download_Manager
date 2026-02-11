import React, { useRef, useState, useEffect } from "react";
import AudioVisualizer from "./AudioVisualizer";

export default function AudioPlayer({
  currentTrack,
  onEnded,
  onNext,
  onPrevious,
  shouldAutoPlay,
  onAutoPlayHandled,
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1.0);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = `file://${currentTrack.path}`;
      audioRef.current.load();

      // پخش خودکار اگر shouldAutoPlay فعال باشه یا قبلاً داشت پخش می‌شد
      if (isPlaying || shouldAutoPlay) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            if (shouldAutoPlay && onAutoPlayHandled) {
              onAutoPlayHandled();
            }
          })
          .catch((err) => console.error("Play error:", err));
      }
    }
  }, [currentTrack, shouldAutoPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      // isPlaying رو true نگه می‌داریم تا آهنگ بعدی خودکار پخش شه
      if (onEnded) onEnded();
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onEnded]);

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.error("Play error:", err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }

    // Auto unmute/mute based on volume
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      // Unmute
      const volumeToRestore = previousVolume > 0 ? previousVolume : 1.0;
      setVolume(volumeToRestore);
      if (audioRef.current) {
        audioRef.current.volume = volumeToRestore;
      }
      setIsMuted(false);
    } else {
      // Mute
      setPreviousVolume(volume);
      setVolume(0);
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
      setIsMuted(true);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // محاسبه درصد پیشرفت برای گرادینت
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = volume * 100;

  return (
    <div className="audio-player">
      <audio ref={audioRef} />

      <div className="track-info">
        <h2 className="track-title">
          {currentTrack ? currentTrack.title : "No track selected"}
        </h2>
        <p className="track-name">
          {currentTrack ? currentTrack.name : "Select audio files to start"}
        </p>
      </div>

      <AudioVisualizer isPlaying={isPlaying} />

      <div className="progress-container">
        <span className="time-label">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="progress-slider"
          disabled={!currentTrack}
          style={{
            background: `linear-gradient(to right, var(--accent) 0%, var(--accent-hover) ${progressPercent}%, rgba(255, 255, 255, 0.08) ${progressPercent}%, rgba(255, 255, 255, 0.08) 100%)`,
          }}
        />
        <span className="time-label">{formatTime(duration)}</span>
      </div>

      <div className="controls">
        <button
          className="control-btn"
          onClick={onPrevious}
          disabled={!currentTrack}
          title="Previous"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <button
          className="control-btn play-btn"
          onClick={togglePlay}
          disabled={!currentTrack}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          className="control-btn"
          onClick={handleStop}
          disabled={!currentTrack}
          title="Stop"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h12v12H6z" />
          </svg>
        </button>

        <button
          className="control-btn"
          onClick={onNext}
          disabled={!currentTrack}
          title="Next"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>

      <div className="volume-container">
        <button
          className="volume-icon-btn"
          onClick={toggleMute}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted || volume === 0 ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-1.72 1.72-1.72-1.72Z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
              <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
            </svg>
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
          style={{
            background: `linear-gradient(to right, var(--accent) 0%, var(--accent-hover) ${volumePercent}%, rgba(255, 255, 255, 0.08) ${volumePercent}%, rgba(255, 255, 255, 0.08) 100%)`,
          }}
        />
      </div>
    </div>
  );
}
