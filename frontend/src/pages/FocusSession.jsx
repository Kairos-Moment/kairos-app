// frontend/src/pages/FocusSession.jsx

import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/axios';
import styles from './FocusSession.module.css';
import { IoPlay, IoPause, IoRefresh, IoMusicalNotes, IoCheckmarkCircle } from 'react-icons/io5';

const GREEK_QUOTES = [
  "We suffer more often in imagination than in reality. — Seneca",
  "Well-being is realized by small steps, but is truly no small thing. — Zeno",
  "It is not that we have a short time to live, but that we waste a lot of it. — Seneca",
  "The happiness of your life depends upon the quality of your thoughts. — Marcus Aurelius",
  "No man is free who is not master of himself. — Epictetus"
];

const AMBIENT_TRACKS = [
  { name: "Rainfall", url: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg" },
  { name: "Ocean Waves", url: "https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg" },
  { name: "Crackling Fire", url: "https://actions.google.com/sounds/v1/ambiences/fire.ogg" },
];

const FocusSession = () => {
  // --- STATE ---
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  
  // Timer State
  const DEFAULT_TIME = 25 * 60;
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [isActive, setIsActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null); // Needed for backend

  // Ambience State
  const [quote, setQuote] = useState(GREEK_QUOTES[0]);
  const [audioUrl, setAudioUrl] = useState('');
  const audioRef = useRef(new Audio());

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- EFFECTS ---

  // 1. Fetch Tasks & Quote on Mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await apiClient.get('/tasks');
        // Filter only pending tasks
        setTasks(res.data.filter(t => t.status !== 'completed'));
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };
    fetchTasks();
    setQuote(GREEK_QUOTES[Math.floor(Math.random() * GREEK_QUOTES.length)]);
  }, []);

  // 2. Timer Logic
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Timer finished naturally
      clearInterval(interval);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // 3. Audio Logic (SYNCED WITH TIMER)
  useEffect(() => {
    // If a track is selected...
    if (audioUrl) {
      // Update source if changed
      if (audioRef.current.src !== audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.loop = true;
      }

      // ONLY play if timer is active
      if (isActive) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => console.log("Audio autoplay blocked:", error));
        }
      } else {
        audioRef.current.pause();
      }
    } else {
      // No track selected
      audioRef.current.pause();
    }
    
    return () => audioRef.current.pause();
  }, [audioUrl, isActive]); // Dependency on isActive ensures sync

  // --- HANDLERS ---

  const toggleTimer = () => {
    if (!selectedTaskId) {
      alert("Please select a labor (task) before beginning.");
      return;
    }

    // Capture the start time the MOMENT they first click start
    if (!isActive && !sessionStartTime) {
      setSessionStartTime(new Date().toISOString());
    }
    
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(DEFAULT_TIME);
    setSessionStartTime(null); // Reset start time so next session is fresh
    
    // Immediately pause and rewind the audio to the beginning
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // This resets the track to 0:00
    }
  };

  const handleSessionComplete = async () => {
    setIsActive(false);

    // Immediately pause and rewind the audio to the beginning
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // This resets the track to 0:00
    }
    
    if (!selectedTaskId || !sessionStartTime) {
      alert("Session complete.");
      resetTimer();
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data matching your Backend Controller requirements
      const sessionData = {
        task_id: selectedTaskId,
        start_time: sessionStartTime,
        end_time: new Date().toISOString(), // Capture exact end time
        notes: "Completed via Kairos Focus Mode"
      };

      // Send to your new endpoint
      await apiClient.post('/focus-sessions', sessionData);
      
      alert("Kairos Achieved: Session logged successfully.");
      resetTimer();
    } catch (err) {
      console.error("Failed to log session", err);
      alert("Session complete, but could not save to database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.temple}>
        <header className={styles.header}>
          <h1>The Temple of Focus</h1>
          <p className={styles.quote}>“{quote}”</p>
        </header>

        <div className={styles.controlsArea}>
          {/* Task Selector */}
          <div className={styles.selectorWrapper}>
            <label>Select your Labor:</label>
            <select 
              value={selectedTaskId} 
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className={styles.dropdown}
              disabled={isActive || isSubmitting}
            >
              <option value="">-- Choose a Task --</option>
              {tasks.map(task => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </select>
          </div>

          {/* THE TIMER */}
          <div className={styles.timerDisplay}>
            {formatTime(timeLeft)}
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button onClick={toggleTimer} className={styles.primaryBtn} disabled={isSubmitting}>
              {isActive ? <IoPause /> : <IoPlay />}
              {isActive ? ' Pause' : ' Begin'}
            </button>
            
            <button onClick={resetTimer} className={styles.secondaryBtn} disabled={isActive || isSubmitting}>
              <IoRefresh /> Reset
            </button>

            {/* Finish Early Button (Optional but useful) */}
            {isActive && (
               <button onClick={handleSessionComplete} className={styles.finishBtn}>
                 <IoCheckmarkCircle /> Finish
               </button>
            )}
          </div>

          {/* Audio Controls */}
          <div className={styles.audioSection}>
            <div className={styles.audioTitle}>
              <IoMusicalNotes /> Ambience 
              <span className={styles.audioHint}>
                {audioUrl ? " (Queued)" : ""}
              </span>
            </div>
            
            <div className={styles.audioButtons}>
              <button 
                onClick={() => setAudioUrl('')} 
                className={!audioUrl ? styles.activeAudio : ''}
              >
                None
              </button>
              {AMBIENT_TRACKS.map(track => (
                <button 
                  key={track.name} 
                  onClick={() => setAudioUrl(track.url)}
                  className={audioUrl === track.url ? styles.activeAudio : ''}
                >
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