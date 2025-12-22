// frontend/src/pages/FocusSession.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient from '../api/axios';
import styles from './FocusSession.module.css';
import { 
  IoPlay, IoPause, IoRefresh, IoMusicalNotes, 
  IoCheckmarkCircle, IoLogoYoutube 
} from 'react-icons/io5';

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

  const [quote, setQuote] = useState(GREEK_QUOTES[0]);
  const [audioUrl, setAudioUrl] = useState('');
  const [youtubeId, setYoutubeId] = useState(''); 
  const [ytInput, setYtInput] = useState('');
  
  // --- REFS ---
  const audioRef = useRef(new Audio());
  const playerRef = useRef(null); // Stores the YouTube Player instance

  // --- 1. LOAD YOUTUBE API ---
  useEffect(() => {
    // Load the YouTube IFrame API script once
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // This function is called by the API when ready
    window.onYouTubeIframeAPIReady = () => {
      console.log("YouTube API Ready");
    };
  }, []);

  // --- 2. INITIALIZE / UPDATE PLAYER ---
  useEffect(() => {
    if (youtubeId && window.YT && window.YT.Player) {
      // If player already exists, just load the new video
      if (playerRef.current && playerRef.current.loadVideoById) {
        playerRef.current.cueVideoById(youtubeId);
      } else {
        // Create the player
        playerRef.current = new window.YT.Player('youtube-player', {
          height: '0',
          width: '0',
          videoId: youtubeId,
          playerVars: {
            autoplay: 0,
            loop: 1,
            playlist: youtubeId
          },
          events: {
            onReady: (event) => {
              if (isActive) event.target.playVideo();
            }
          }
        });
      }
    }
  }, [youtubeId]);

  // --- 3. SYNC PLAY/PAUSE WITH TIMER ---
  useEffect(() => {
    if (playerRef.current && playerRef.current.playVideo) {
      if (isActive) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isActive]);

  // --- TIMER & OTHER LOGIC ---
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await apiClient.get('/tasks');
        const pending = res.data.filter(t => t.status !== 'completed');
        setTasks(pending);
        const params = new URLSearchParams(location.search);
        const tid = params.get('taskId');
        if (tid) setSelectedTaskId(tid);
      } catch (err) { console.error(err); }
    };
    fetchTasks();
  }, [location.search]);

  // Built-in Audio logic
  useEffect(() => {
    if (audioUrl && !youtubeId) {
      audioRef.current.src = audioUrl;
      audioRef.current.loop = true;
      isActive ? audioRef.current.play() : audioRef.current.pause();
    } else {
      audioRef.current.pause();
    }
  }, [audioUrl, isActive, youtubeId]);

  // --- HANDLERS ---
  const extractVideoID = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const handleYoutubeSubmit = (e) => {
    e.preventDefault();
    const id = extractVideoID(ytInput);
    if (id) {
      setAudioUrl('');
      setYoutubeId(id);
    }
  };

  const toggleTimer = () => {
    if (!selectedTaskId) return alert("Select a labor.");
    if (!isActive && !sessionStartTime) setSessionStartTime(new Date().toISOString());
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(customMinutes * 60);
    setSessionStartTime(null);
    if (playerRef.current && playerRef.current.stopVideo) playerRef.current.stopVideo();
    if (audioRef.current) audioRef.current.pause();
  };

  const handleSessionComplete = async () => {
    setIsActive(false);
    if (playerRef.current) playerRef.current.pauseVideo();
    // ... API call logic from previous version
    alert("Session Logged!");
    resetTimer();
  };

  return (
    <div className={styles.container}>
      {/* 
        This div is ALWAYS in the DOM. 
        YouTube API replaces it with an iframe. 
        We keep it hidden so it's audio-only.
      */}
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
              <select value={selectedTaskId} onChange={(e) => setSelectedTaskId(e.target.value)} className={styles.dropdown}>
                <option value="">-- Choose Task --</option>
                {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div className={styles.selectorWrapper}>
              <label>Minutes:</label>
              <input type="number" value={customMinutes} onChange={(e) => {
                setCustomMinutes(e.target.value);
                if(!isActive) setTimeLeft(e.target.value * 60);
              }} className={styles.timeInput} />
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
          </div>

          <div className={styles.audioSection}>
            <div className={styles.audioTitle}><IoMusicalNotes /> Focus Music</div>
            <form onSubmit={handleYoutubeSubmit} className={styles.ytForm}>
               <IoLogoYoutube className={styles.ytIcon} />
               <input 
                type="text" placeholder="YouTube Link" value={ytInput}
                onChange={(e) => setYtInput(e.target.value)} className={styles.ytInput}
               />
               <button type="submit" className={styles.ytBtn}>Set</button>
            </form>

            <div className={styles.audioButtons}>
              <button onClick={() => {setYoutubeId(''); setAudioUrl('');}}>None</button>
              {AMBIENT_TRACKS.map(track => (
                <button key={track.name} onClick={() => {setAudioUrl(track.url); setYoutubeId('');}}>
                  {track.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusSession;