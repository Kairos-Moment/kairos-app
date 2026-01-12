// frontend/src/pages/Habits.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { fetchHabits, createHabit, deleteHabit, logHabit, fetchHabitLogs } from '../api/habitsAPI';
import apiClient from '../api/axios'; // Import for Oracle sync
import styles from './Habits.module.css';
import { IoLeaf, IoCheckmarkCircle, IoAdd, IoTrashBin, IoMic } from 'react-icons/io5';

// Components & Hooks
import OracleInsight from '../components/dashboard/OracleInsight';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

const AFFIRMATIONS = [
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit. — Aristotle",
  "Small actions, done consistently, create giant results.",
  "Focus on the process, not the outcome. The seed will grow.",
  "Discipline is the bridge between goals and accomplishment."
];

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [completedMap, setCompletedMap] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Oracle State
  const [insightData, setInsightData] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);

  // UI State
  const [quote, setQuote] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [frequency, setFrequency] = useState(1);

  // Speech Recognition
  const { isListening, transcript, startListening, stopListening, hasSupport } = useSpeechRecognition();

  // --- DATA FETCHING ---

  const refreshOracle = useCallback(async () => {
    try {
      const response = await apiClient.get('/insights');
      setInsightData(response.data);
    } catch (error) {
      console.error("Oracle failed to perceive your habits:", error);
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    setIsLoadingInsights(true);
    try {
      const habitsData = await fetchHabits();
      setHabits(habitsData);

      const statusMap = {};
      const today = new Date().toISOString().split('T')[0];

      await Promise.all(habitsData.map(async (habit) => {
        try {
          const logs = await fetchHabitLogs(habit.id);
          const isDoneToday = logs.some(log => 
            new Date(log.completion_date).toISOString().split('T')[0] === today
          );
          statusMap[habit.id] = isDoneToday;
        } catch (e) {
          console.error(`Could not fetch logs for habit ${habit.id}`);
        }
      }));

      setCompletedMap(statusMap);
      await refreshOracle(); // Get latest insights
    } catch (err) {
      console.error("Error loading habits:", err);
    } finally {
      setLoading(false);
      setIsLoadingInsights(false);
    }
  };

  useEffect(() => {
    loadData();
    setQuote(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
  }, []);

  // --- VOICE COMMAND LOGIC ---
  useEffect(() => {
    if (!isListening && transcript) {
      handleVoiceCommand(transcript.toLowerCase());
    }
  }, [transcript, isListening]);

  const handleVoiceCommand = async (command) => {
    // Example: "Log reading habit" or "Done with meditation"
    const habitToLog = habits.find(h => command.includes(h.title.toLowerCase()));
    
    if (habitToLog) {
      handleLog(habitToLog.id);
      // Optional: Add an "Oracle Speech" feedback here if you have a TTS utility
    }
  };

  // --- HANDLERS ---

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle) return;
    try {
      await createHabit({ title: newTitle, frequency, is_active: true, description: "" });
      setShowModal(false);
      setNewTitle("");
      loadData();
    } catch (err) {
      alert("Failed to create habit");
    }
  };

  const handleLog = async (id) => {
    // Optimistic Update
    setCompletedMap(prev => ({ ...prev, [id]: true }));

    try {
      await logHabit(id);
      // REFRESH ORACLE: Immediately update insights after logging
      await refreshOracle();
    } catch (err) {
      console.error("Failed to log habit");
      setCompletedMap(prev => ({ ...prev, [id]: false }));
      alert("Could not log habit. It may already be recorded.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Do you want to uproot this habit?")) {
      await deleteHabit(id);
      loadData();
    }
  };

  return (
    <div className={styles.container}>
      {/* ORACLE SYNC SECTION */}
      <div className={styles.oracleWrapper}>
        <OracleInsight insightData={insightData} isLoading={isLoadingInsights} />
        
        {hasSupport && (
          <button
            className={`${styles.micButton} ${isListening ? styles.listening : ''}`}
            onClick={isListening ? stopListening : startListening}
            title="Tell the Oracle you have practiced a virtue"
          >
            <IoMic size={24} />
          </button>
        )}
      </div>

      <header className={styles.header}>
        <h1>Garden of Habits</h1>
        <div className={styles.reminderCard}>
          <IoLeaf className={styles.leafIcon} />
          <p>"{quote}"</p>
        </div>
      </header>

      <div className={styles.controls}>
        <button onClick={() => setShowModal(true)} className={styles.addBtn}>
          <IoAdd /> Plant New Seed
        </button>
      </div>

      {isListening && <div className={styles.voiceOverlay}>The Oracle is listening... "{transcript}"</div>}

      {loading ? <p className={styles.loading}>Tending the garden...</p> : (
        <div className={styles.grid}>
          <div className={styles.column}>
            <h3>Daily Rhythms</h3>
            {habits.filter(h => h.frequency === 1).map(habit => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                isDone={completedMap[habit.id]} 
                onLog={() => handleLog(habit.id)}
                onDelete={() => handleDelete(habit.id)}
              />
            ))}
          </div>

          <div className={styles.column}>
            <h3>Longer Term Growth</h3>
            {habits.filter(h => h.frequency !== 1).map(habit => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                isDone={completedMap[habit.id]} 
                onLog={() => handleLog(habit.id)}
                onDelete={() => handleDelete(habit.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* MODAL (unchanged) */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Plant a New Habit</h2>
            <form onSubmit={handleCreate}>
              <input 
                type="text" placeholder="What virtue will you practice?" 
                value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus
              />
              <div className={styles.selectWrapper}>
                <label>Frequency:</label>
                <select value={frequency} onChange={e => setFrequency(Number(e.target.value))}>
                  <option value={1}>Daily</option>
                  <option value={2}>Weekly</option>
                  <option value={3}>Monthly</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" className={styles.saveBtn}>Plant</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const HabitCard = ({ habit, isDone, onLog, onDelete }) => (
  <div className={`${styles.card} ${isDone ? styles.completed : ''}`}>
    <div className={styles.cardInfo}>
      <h4>{habit.title}</h4>
      <span className={styles.streak}>
        {isDone ? "Recorded in the Scrolls" : "Awaiting Practice"}
      </span>
    </div>
    <div className={styles.cardActions}>
      <button onClick={onLog} className={styles.checkBtn} disabled={isDone}>
        <IoCheckmarkCircle />
      </button>
      <button onClick={onDelete} className={styles.deleteBtn}>
        <IoTrashBin />
      </button>
    </div>
  </div>
);

export default Habits;