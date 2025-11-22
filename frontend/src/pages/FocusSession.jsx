import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/axios';
import styles from './FocusSession.module.css';
import { IoPlay, IoPause, IoRefresh, IoMusicalNotes } from 'react-icons/io5';

const GREEK_QUOTES = [
  "We suffer more often in imagination than in reality. — Seneca",
  "Well-being is realized by small steps, but is truly no small thing. — Zeno",
  "It is not that we have a short time to live, but that we waste a lot of it. — Seneca",
  "The happiness of your life depends upon the quality of your thoughts. — Marcus Aurelius",
  "No man is free who is not master of himself. — Epictetus"
];

const AMBIENT_TRACKS = [
  { name: "Rainfall", url: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg" },
  { name: "Ocean Waves", url: "https://actions.google.com/sounds/v1/water/waves_crashing.ogg" },
  { name: "Crackling Fire", url: "https://actions.google.com/sounds/v1/ambiences/fire.ogg" },
];

const FocusSession = () => {
  // Data State
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(25 * 60);

  // Ambience State
  const [quote, setQuote] = useState(GREEK_QUOTES[0]);
  const [audioUrl, setAudioUrl] = useState('');
  const audioRef = useRef(new Audio());

  // Fetch tasks on mount
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

  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Audio Logic
  useEffect(() => {
    if (audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.loop = true;
      audioRef.current.play().catch(e => console.log("Audio play failed (interaction needed)", e));
    } else {
      audioRef.current.pause();
    }
    return () => audioRef.current.pause();
  }, [audioUrl]);

  const handleSessionComplete = async () => {
    setIsActive(false);
    alert("Focus Session Complete! Kairos achieved.");
    
    // Save to DB
    if (selectedTaskId) {
      try {
        const duration = Math.floor((initialTime - timeLeft) / 60);
        await apiClient.post('/focus', {
          task_id: selectedTaskId,
          duration_minutes: duration || 25, // Default to full duration if 0
          notes: "Completed via Focus Mode"
        });
      } catch (err) {
        console.error("Failed to log session", err);
      }
    }
    // Reset
    setTimeLeft(initialTime);
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
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
            <button onClick={toggleTimer} className={styles.primaryBtn}>
              {isActive ? <IoPause /> : <IoPlay />}
              {isActive ? ' Pause' : ' Begin'}
            </button>
            <button onClick={resetTimer} className={styles.secondaryBtn}>
              <IoRefresh /> Reset
            </button>
          </div>

          {/* Audio Controls */}
          <div className={styles.audioSection}>
            <div className={styles.audioTitle}><IoMusicalNotes /> Ambience</div>
            <div className={styles.audioButtons}>
              <button onClick={() => setAudioUrl('')} className={!audioUrl ? styles.activeAudio : ''}>None</button>
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