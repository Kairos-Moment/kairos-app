// frontend/src/components/focus/NavidromePlayer.jsx
import React, { forwardRef, useState, useRef, useEffect, useImperativeHandle, useCallback } from 'react';
import {
  IoPlay,
  IoPause,
  IoVolumeHigh,
  IoVolumeMute,
  IoClose,
  IoMusicalNotes,
} from 'react-icons/io5';
import styles from './NavidromePlayer.module.css';

const NavidromePlayer = forwardRef(({ track, isPlaying, onPlayPause, onClose }, ref) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const attemptPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
    } catch (error) {
      console.error(`Navidrome audio play failed`, {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
        error,
      });
      if (error?.name === 'NotAllowedError' || error?.name === 'AbortError') {
        console.warn('Retrying muted play due to autoplay restrictions');
        audio.muted = true;
        try {
          await audio.play();
          audio.muted = isMuted;
        } catch (retryError) {
          console.error('Navidrome muted retry failed', {
            name: retryError?.name,
            message: retryError?.message,
            code: retryError?.code,
            stack: retryError?.stack,
            retryError,
          });
        }
      }
    }
  }, [isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!track) {
      audio.pause();
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    audio.preload = 'auto';
    audio.playsInline = true;
    audio.autoplay = false;
    audio.muted = isMuted;
    audio.volume = volume;
    audio.loop = true;
    if (audio.src !== track.streamUrl) {
      audio.removeAttribute('src');
      audio.src = track.streamUrl;
      setCurrentTime(0);
      setDuration(0);
    }

    console.debug('Navidrome audio source configured', {
      src: audio.src,
      canPlayType: audio.canPlayType('audio/mpeg'),
      trackUrl: track.streamUrl,
    });

    const logAudioError = (context, error) => {
      console.error(`Navidrome audio ${context}`, {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
        error,
      });
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };
    const handleCanPlay = () => {
      setIsLoading(false);
      if (isPlaying) {
        attemptPlay();
      }
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const handleDurationChange = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      if (isPlaying) {
        audio.currentTime = 0;
        attemptPlay().catch(() => {});
      }
    };
    const handleAudioError = (event) => {
      const err = audio.error;
      console.error(`Navidrome audio error: ${JSON.stringify({
        eventType: event.type,
        currentSrc: audio.currentSrc,
        src: audio.src,
        networkState: audio.networkState,
        readyState: audio.readyState,
        name: err?.name,
        message: err?.message,
        code: err?.code,
      }, null, 2)}`);
      setIsLoading(false);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleAudioError);

    audio.load();
    if (isPlaying) {
      attemptPlay();
    } else {
      audio.pause();
    }

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleAudioError);
    };
  }, [track?.streamUrl, isPlaying, onPlayPause, volume, isMuted, attemptPlay]);

  useImperativeHandle(ref, () => ({
    play: async () => {
      const audio = audioRef.current;
      if (!audio) return;
      try {
        await audio.play();
      } catch (error) {
        console.error(`Navidrome player imperative play failed: ${JSON.stringify({
          name: error?.name,
          message: error?.message,
          code: error?.code,
          stack: error?.stack,
        }, null, 2)}`);
      }
    },
    pause: () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
    },
  }), []);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    if (newVolume > 0) setIsMuted(false);
  };

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!track) return null;

  return (
    <div className={styles.player}>
      <audio ref={audioRef} style={{ display: 'none' }} preload="auto" playsInline>
        <source src={track.streamUrl} type="audio/mpeg" />
      </audio>
      <div className={styles.header}>
        <div className={styles.trackInfo}>
          {track.coverArt && (
            <img
              src={track.coverArt}
              alt={track.title}
              className={styles.albumArt}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          {!track.coverArt && (
            <div className={styles.placeholderArt}>
              <IoMusicalNotes size={32} />
            </div>
          )}
          <div className={styles.details}>
            <h4 className={styles.title}>{track.title}</h4>
            <p className={styles.artist}>{track.artist || 'Unknown Artist'}</p>
            {track.album && <p className={styles.album}>{track.album}</p>}
          </div>
        </div>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close player"
        >
          <IoClose />
        </button>
      </div>

      <div className={styles.controls}>
        {/* Progress bar */}
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleProgressChange}
          className={styles.progressBar}
          disabled={!duration}
        />
        <div className={styles.timeDisplay}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Playback controls */}
        <div className={styles.buttonsRow}>
          <button
            className={styles.playBtn}
            onClick={() => onPlayPause(!isPlaying)}
            disabled={isLoading}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <span className={styles.spinner}>⟳</span>
            ) : isPlaying ? (
              <IoPause />
            ) : (
              <IoPlay />
            )}
          </button>

          {/* Volume controls */}
          <div className={styles.volumeControl}>
            <button
              className={styles.volumeBtn}
              onClick={toggleMute}
              aria-label="Mute/unmute"
            >
              {isMuted ? <IoVolumeMute /> : <IoVolumeHigh />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className={styles.volumeSlider}
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default NavidromePlayer;
