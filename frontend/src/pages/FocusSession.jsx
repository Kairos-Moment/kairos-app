// frontend/src/pages/FocusSession.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient from '../api/axios';
import styles from './FocusSession.module.css';
import {
  IoPlay, IoPause, IoRefresh, IoMusicalNotes,
  IoCheckmarkCircle, IoLogoYoutube, IoSave, IoTrash,
  IoSearchCircle, IoMusicalNotesOutline
} from 'react-icons/io5';
import { getSavedTracks, saveTrack, saveAudioFile, deleteTrack } from '../api/savedTracksAPI';
import { checkNavidromeHealth } from '../api/navidromeAPI';
import LibraryModal from '../components/focus/LibraryModal';
import NavidromePlayer from '../components/focus/NavidromePlayer';
import NavidromeBrowser from '../components/focus/NavidromeBrowser';
import { storeAudioBlob, getAudioBlobUrl, removeAudioBlob } from '../utils/offlineAudioDB';

const GREEK_QUOTES = [
  "We suffer more often in imagination than in reality. — Seneca",
  "The happiness of your life depends upon the quality of your thoughts. — Marcus Aurelius",
  "No man is free who is not master of himself. — Epictetus"
];

const AMBIENT_TRACKS = [
  { name: "Rainfall", url: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg" },
  { name: "Ocean Waves", url: "https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg" },
  { name: "Crackling Fire", url: "https://actions.google.com/sounds/v1/ambiences/fire.ogg" },
];

const FocusSession = () => {
  const location = useLocation();

  // --- STATE ---
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [customMinutes, setCustomMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [quote] = useState(() => GREEK_QUOTES[Math.floor(Math.random() * GREEK_QUOTES.length)]);
  const [audioUrl, setAudioUrl] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [ytInput, setYtInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Saved Tracks & Library State
  const [savedTracks, setSavedTracks] = useState([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [encapsulationMode, setEncapsulationMode] = useState(false);
  const [offlineTrackId, setOfflineTrackId] = useState(null);

  // Navidrome State
  const [navidromeReady, setNavidromeReady] = useState(false);
  const [currentNavidromeTrack, setCurrentNavidromeTrack] = useState(null);
  const [isNavidromePlaylistOpen, setIsNavidromePlaylistOpen] = useState(false);
  const [navidromeIsPlaying, setNavidromeIsPlaying] = useState(false);

  // --- REFS ---
  const audioRef = useRef(new Audio());
  const offlineAudioRef = useRef(new Audio());
  const playerRef = useRef(null);
  const navidromePlayerRef = useRef(null);

  // --- 1. SAFE YOUTUBE API LOADING ---
  useEffect(() => {
    // If Navidrome is available, skip loading the YouTube API
    if (navidromeReady) return;

    // Load script only if it doesn't exist
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Set global callback for YT
    window.onYouTubeIframeAPIReady = () => {
      console.log("YouTube API Ready");
    };

    return () => {
      // cleanup global callback if component unmounts
      try { window.onYouTubeIframeAPIReady = undefined; } catch (e) {}
    };
  }, [navidromeReady]);

  // --- 1.1 CHECK NAVIDROME CONNECTION ---
  useEffect(() => {
    const checkNavidrome = async () => {
      try {
        const isReady = await checkNavidromeHealth();
        setNavidromeReady(isReady);
        if (isReady) {
          console.log("✅ Navidrome is connected");
        } else {
          console.log("⚠️ Navidrome is not available");
        }
      } catch (error) {
        console.error('Navidrome health check failed:', error);
        setNavidromeReady(false);
      }
    };
    checkNavidrome();
  }, []);

  // --- 2. INITIALIZE PLAYER ---
  useEffect(() => {
    // Do not initialize the YouTube player when Navidrome is available
    if (navidromeReady) return;

    if (youtubeId && window.YT && window.YT.Player) {
      try {
        if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
          // Use loadVideoById to switch immediately if active
          if (isActive) {
            playerRef.current.loadVideoById(youtubeId);
          } else {
            playerRef.current.cueVideoById(youtubeId);
          }
        } else {
          playerRef.current = new window.YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: youtubeId,
            playerVars: {
              autoplay: 0,
              loop: 1,
              playlist: youtubeId,
              controls: 0,
              modestbranding: 1
            },
            events: {
              onReady: (event) => {
                if (isActive) event.target.playVideo();
              },
              onStateChange: (event) => {
                // If the video ends (0), and we are still active, restart it
                if (event.data === window.YT.PlayerState.ENDED && isActive) {
                  event.target.playVideo();
                }
              },
              onError: (e) => console.error("YT Player Error", e)
            }
          });
        }
      } catch (err) {
        console.error("Failed to initialize YT Player:", err);
      }
    }
  }, [youtubeId, navidromeReady]);

  // --- 3. SYNC PLAY/PAUSE ---
  useEffect(() => {
    // Skip syncing YouTube play/pause when Navidrome is active
    if (navidromeReady) return;
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      if (isActive && !encapsulationMode) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isActive, encapsulationMode]);

  // --- 4. TIMER LOGIC ---
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // --- 5. DATA FETCHING ---
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await apiClient.get('/tasks');
        const pending = res.data.filter(t => t.status !== 'completed');
        setTasks(pending);

        const params = new URLSearchParams(location.search);
        const tid = params.get('taskId');
        if (tid) setSelectedTaskId(tid);
      } catch (err) {
        console.error("Task fetch failed", err);
      }
    };
    loadTasks();
  }, [location.search]);

  // --- 5.1 FETCH SAVED TRACKS ---
  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const tracks = await getSavedTracks();
      setSavedTracks(tracks);
    } catch (err) {
      console.error("Failed to load saved tracks", err);
    }
  };

  // --- 6. BUILT-IN AUDIO ---
  useEffect(() => {
    const audio = audioRef.current;

    const handleEnded = () => {
      if (isActive) {
        audio.currentTime = 0;
        audio.play().catch(() => { });
      }
    };

    if (audioUrl && !youtubeId) {
      audio.src = audioUrl;
      audio.loop = true;
      audio.addEventListener('ended', handleEnded);
      if (isActive) {
        audio.play().catch(() => { });
      } else {
        audio.pause();
      }
    } else {
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
    }

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, isActive, youtubeId]);

  // --- 7. OFFLINE AUDIO (Encapsulation Mode) ---
  useEffect(() => {
    const audio = offlineAudioRef.current;
    if (!offlineTrackId) {
      audio.pause();
      return;
    }
    let blobUrl = null;
    getAudioBlobUrl(offlineTrackId).then((url) => {
      if (!url) return;
      blobUrl = url;
      audio.src = url;
      audio.loop = true;
      if (isActive) audio.play().catch(() => {});
    });
    return () => {
      audio.pause();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [offlineTrackId, isActive]);

  // Auto-play Navidrome music when a timer session starts
  useEffect(() => {
    if (isActive && currentNavidromeTrack && !navidromeIsPlaying) {
      setNavidromeIsPlaying(true);
    }
  }, [isActive, currentNavidromeTrack, navidromeIsPlaying]);

  // --- HANDLERS ---
  const handleYoutubeSubmit = (e) => {
    e.preventDefault();
    const id = extractYoutubeId(ytInput);
    if (id) {
      setAudioUrl('');
      setYoutubeId(id);
    } else {
      alert("Invalid YouTube Link");
    }
  };

  const extractYoutubeId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const handleSaveCurrentTrack = async () => {
    if (!youtubeId) return alert("No YouTube track loaded to save.");
    const title = prompt("Enter a name for this track:");
    if (title) {
      try {
        await saveTrack(title, youtubeId);
        fetchTracks();
        alert("Track saved to library!");
      } catch (err) {
        console.error(err);
        alert("Failed to save track.");
      }
    }
  };

  const handleDeleteTrack = async (id) => {
    if (window.confirm("Remove from library?")) {
      try {
        await deleteTrack(id);
        await removeAudioBlob(id);
        if (offlineTrackId === id) {
          setOfflineTrackId(null);
          offlineAudioRef.current.pause();
        }
        setSavedTracks(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const loadSavedTrack = (track) => {
    if (track.file_path) {
      // Offline track — play via offlineAudioRef
      offlineAudioRef.current.pause();
      setOfflineTrackId(track.id);
      setYoutubeId('');
      setAudioUrl('');
      setYtInput('');
    } else {
      // YouTube track
      setOfflineTrackId(null);
      offlineAudioRef.current.pause();
      setYoutubeId(track.youtube_id);
      setAudioUrl('');
      setYtInput(`https://youtu.be/${track.youtube_id}`);
    }
  };

  const handleUploadTrack = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const title = prompt(`Name this track (${file.name}):`);
    if (!title) return;
    try {
      const saved = await saveAudioFile(title, file);
      // Store the raw file blob locally so playback works offline
      await storeAudioBlob(saved.id, file);
      await fetchTracks();
    } catch (err) {
      console.error(err);
      alert("Failed to upload track.");
    }
    e.target.value = '';
  };

  const handleSessionComplete = async () => {
    setIsActive(false);
    if (playerRef.current?.pauseVideo) playerRef.current.pauseVideo();
    if (audioRef.current) audioRef.current.pause();
    if (offlineAudioRef.current) offlineAudioRef.current.pause();
    setNavidromeIsPlaying(false);

    if (!selectedTaskId || !sessionStartTime) {
      resetTimer();
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/focus-sessions', {
        task_id: selectedTaskId,
        start_time: sessionStartTime,
        end_time: new Date().toISOString(),
        notes: "Completed via Kairos"
      });
      alert("Kairos Achieved!");
      resetTimer();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(customMinutes * 60);
    setSessionStartTime(null);
    if (playerRef.current?.stopVideo) playerRef.current.stopVideo();
    if (offlineAudioRef.current) offlineAudioRef.current.pause();
    setNavidromeIsPlaying(false);
  };

  const handleSelectNavidromeTrack = (track) => {
    setCurrentNavidromeTrack(track);
    setNavidromeIsPlaying(true);
    setYoutubeId('');
    setAudioUrl('');
    setOfflineTrackId(null);
    setIsNavidromePlaylistOpen(false);
  };

  const handleNavidromePlayPause = useCallback((shouldPlay) => {
    setNavidromeIsPlaying(shouldPlay);
    if (isActive && !shouldPlay) {
      // Pause session if music is paused during active session
      setIsActive(false);
    }
  }, [isActive]);

  const toggleTimer = () => {
    if (!selectedTaskId) return alert("Select a labor.");
    if (!isActive && !sessionStartTime) setSessionStartTime(new Date().toISOString());
    if (!isActive && currentNavidromeTrack) {
      setNavidromeIsPlaying(true);
    }
    setIsActive(!isActive);
  };

  return (
    <div className={`${styles.container} ${isActive ? styles.active : ''}`}>
      <div id="youtube-player" style={{ display: 'none' }}></div>
      <div className={styles.temple}>
        <header className={styles.header}>
          <h1>The Temple of Focus</h1>
          <p className={styles.quote}>“{quote}”</p>
        </header>

        <div className={styles.controlsArea}>
          <div className={styles.configRow}>
            <div className={styles.selectorWrapper}>
              <label>Labor:</label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className={styles.dropdown}
              >
                <option value="">-- Choose Task --</option>
                {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div className={styles.selectorWrapper}>
              <label>Minutes:</label>
              <input
                type="number" value={customMinutes}
                onChange={(e) => {
                  const m = parseInt(e.target.value) || 0;
                  setCustomMinutes(m);
                  if (!isActive) setTimeLeft(m * 60);
                }}
                className={styles.timeInput}
              />
            </div>
          </div>

          <div className={styles.timerDisplay}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>

          <div className={styles.actions}>
            <button onClick={toggleTimer} className={styles.primaryBtn}>
              {isActive ? <IoPause /> : <IoPlay />} {isActive ? 'Pause' : 'Begin'}
            </button>
            <button onClick={resetTimer} className={styles.secondaryBtn}><IoRefresh /> Reset</button>
            {isActive && (
              <button onClick={handleSessionComplete} className={styles.finishBtn}>
                <IoCheckmarkCircle /> Finish
              </button>
            )}
          </div>

          <div className={styles.audioSection}>
            <div className={styles.audioTitle}><IoMusicalNotes /> Focus Music</div>

            {/* Encapsulation Mode Toggle */}
            <div className={styles.encapsulationRow}>
              <span className={styles.encapsulationLabel}>Encapsulation Mode</span>
              <button
                type="button"
                className={`${styles.toggleSwitch} ${encapsulationMode ? styles.toggleOn : ''}`}
                onClick={() => {
                  const next = !encapsulationMode;
                  setEncapsulationMode(next);
                  if (next) {
                    // Entering Encapsulation Mode — pause YouTube and ambient audio, keep the link intact
                    if (playerRef.current?.pauseVideo) playerRef.current.pauseVideo();
                    audioRef.current.pause();
                    setAudioUrl('');
                  } else {
                    // Leaving Encapsulation Mode — stop offline audio
                    offlineAudioRef.current.pause();
                    setOfflineTrackId(null);
                  }
                }}
                aria-pressed={encapsulationMode}
                aria-label="Toggle Encapsulation Mode"
              >
                <span className={styles.toggleThumb} />
              </button>
              <span className={styles.encapsulationHint}>
                {encapsulationMode ? 'Offline Playlist' : 'YouTube Link'}
              </span>
            </div>

            {!encapsulationMode ? (
              navidromeReady ? (
                <div className={styles.navidromeInfo}>
                  <p>Navidrome is available — use the Browse button below to select tracks.</p>
                </div>
              ) : (
                /* YouTube Mode */
                <>
                  <form onSubmit={handleYoutubeSubmit} className={styles.ytForm}>
                    <IoLogoYoutube className={styles.ytIcon} />
                    <input
                      type="text" placeholder="YouTube Link" value={ytInput}
                      onChange={(e) => setYtInput(e.target.value)} className={styles.ytInput}
                    />
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button type="submit" className={styles.ytBtn}>Set</button>
                      <button type="button" onClick={handleSaveCurrentTrack} className={styles.saveIconBtn} title="Save to Library">
                        <IoSave />
                      </button>
                    </div>
                  </form>
                  <div className={styles.audioButtons}>
                    <button onClick={() => { setYoutubeId(''); setAudioUrl(''); }} className={!audioUrl && !youtubeId ? styles.activeAudio : ''}>None</button>
                    {AMBIENT_TRACKS.map(track => (
                      <button
                        key={track.name}
                        onClick={() => { setAudioUrl(track.url); setYoutubeId(''); }}
                        className={audioUrl === track.url ? styles.activeAudio : ''}
                      >
                        {track.name}
                      </button>
                    ))}
                  </div>
                </>
              )
            ) : (
              /* Encapsulation Mode — Offline Playlist */
              <div className={styles.playlistPanel}>
                <div className={styles.playlistToolbar}>
                  <label className={styles.uploadBtn} title="Upload audio file">
                    ＋ Add Audio File
                    <input
                      type="file"
                      accept="audio/*"
                      style={{ display: 'none' }}
                      onChange={handleUploadTrack}
                    />
                  </label>
                  {offlineTrackId && (
                    <button
                      className={styles.stopOfflineBtn}
                      onClick={() => { offlineAudioRef.current.pause(); setOfflineTrackId(null); }}
                      title="Stop offline audio"
                    >
                      ■ Stop
                    </button>
                  )}
                </div>
                {offlineTrackId && (
                  <div className={styles.nowPlaying}>
                    <IoMusicalNotes className={styles.nowPlayingIcon} />
                    <span>Now playing: {savedTracks.find(t => t.id === offlineTrackId)?.title || 'Track'}</span>
                  </div>
                )}
                {savedTracks.filter(t => t.file_path).length === 0 ? (
                  <p className={styles.emptyPlaylist}>No offline tracks yet. Upload an audio file above.</p>
                ) : (
                  <ul className={styles.playlistList}>
                    {savedTracks.filter(t => t.file_path).map(track => (
                      <li
                        key={track.id}
                        className={`${styles.playlistItem} ${offlineTrackId === track.id ? styles.activeTrack : ''}`}
                        onClick={() => loadSavedTrack(track)}
                      >
                        <IoMusicalNotes className={styles.playlistIcon} />
                        <span className={styles.playlistTitle}>{track.title}</span>
                        {offlineTrackId === track.id && <span className={styles.playingBadge}>▶</span>}
                        <button
                          className={styles.deleteTrackBtn}
                          onClick={(e) => { e.stopPropagation(); handleDeleteTrack(track.id); }}
                          title="Remove track"
                        >
                          <IoTrash />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Navidrome Player */}
            {currentNavidromeTrack && (
              <NavidromePlayer
                ref={navidromePlayerRef}
                track={currentNavidromeTrack}
                isPlaying={navidromeIsPlaying && isActive}
                onPlayPause={handleNavidromePlayPause}
                onClose={() => {
                  setCurrentNavidromeTrack(null);
                  setNavidromeIsPlaying(false);
                }}
              />
            )}

            {/* Navidrome Browser Button */}
            {navidromeReady && (
              <button
                className={styles.navidromeBrowseBtn}
                onClick={() => setIsNavidromePlaylistOpen(true)}
                title="Browse Navidrome library"
              >
                <IoSearchCircle /> Browse Music Library
              </button>
            )}

            {/* Navidrome Browser Modal */}
            {isNavidromePlaylistOpen && navidromeReady && (
              <div className={styles.modalOverlay} onClick={() => setIsNavidromePlaylistOpen(false)}>
                <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                  <NavidromeBrowser
                    onSelectTrack={handleSelectNavidromeTrack}
                    onClose={() => setIsNavidromePlaylistOpen(false)}
                  />
                </div>
              </div>
            )}

            {/* Library Modal (still accessible from YouTube mode via save) */}
            <LibraryModal
              isOpen={isLibraryOpen}
              onClose={() => setIsLibraryOpen(false)}
              savedTracks={savedTracks}
              onSelectTrack={loadSavedTrack}
              onDeleteTrack={handleDeleteTrack}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusSession;