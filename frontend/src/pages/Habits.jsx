import React, { useState, useEffect } from 'react';
import { fetchHabits, createHabit, deleteHabit, logHabit, fetchHabitLogs } from '../api/habitsAPI';
import styles from './Habits.module.css';
import { IoLeaf, IoCheckmarkCircle, IoAdd, IoTrashBin } from 'react-icons/io5';

const AFFIRMATIONS = [
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit. — Aristotle",
  "Small actions, done consistently, create giant results.",
  "Focus on the process, not the outcome. The seed will grow.",
  "Discipline is the bridge between goals and accomplishment."
];

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [completedMap, setCompletedMap] = useState({}); // Stores which habits are done today
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [quote, setQuote] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [frequency, setFrequency] = useState(1); // Default Daily

  // 1. Load Habits and Quote on Mount
  useEffect(() => {
    loadData();
    setQuote(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // A. Get the Habits
      const habitsData = await fetchHabits();
      setHabits(habitsData);

      // B. Check status for each habit (Are they done today?)
      const statusMap = {};
      const today = new Date().toISOString().split('T')[0];

      // Use Promise.all to fetch logs for all habits in parallel
      await Promise.all(habitsData.map(async (habit) => {
        try {
          const logs = await fetchHabitLogs(habit.id);
          // Check if any log matches today's date
          const isDoneToday = logs.some(log => 
            new Date(log.completion_date).toISOString().split('T')[0] === today
          );
          statusMap[habit.id] = isDoneToday;
        } catch (e) {
          console.error(`Could not fetch logs for habit ${habit.id}`);
        }
      }));

      setCompletedMap(statusMap);

    } catch (err) {
      console.error("Error loading habits:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle) return;
    try {
      await createHabit({ 
        title: newTitle, 
        frequency, 
        is_active: true, 
        description: "" 
      });
      setShowModal(false);
      setNewTitle("");
      loadData(); // Refresh list
    } catch (err) {
      alert("Failed to create habit");
    }
  };

  const handleLog = async (id) => {
    // Optimistic Update (Make it green immediately)
    setCompletedMap(prev => ({ ...prev, [id]: true }));

    try {
      await logHabit(id);
    } catch (err) {
      console.error("Failed to log habit");
      // Revert if failed
      setCompletedMap(prev => ({ ...prev, [id]: false }));
      alert("Could not log habit. Maybe it's already done?");
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

      {loading ? <p className={styles.loading}>Tending the garden...</p> : (
        <div className={styles.grid}>
          {/* DAILY COLUMN */}
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
            {habits.filter(h => h.frequency === 1).length === 0 && <p className={styles.empty}>No daily seeds planted.</p>}
          </div>

          {/* WEEKLY COLUMN (Frequency != 1) */}
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
            {habits.filter(h => h.frequency !== 1).length === 0 && <p className={styles.empty}>No long-term seeds planted.</p>}
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Plant a New Habit</h2>
            <form onSubmit={handleCreate}>
              <input 
                type="text" 
                placeholder="What virtue will you practice?" 
                value={newTitle} 
                onChange={e => setNewTitle(e.target.value)} 
                autoFocus
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

// Sub-component for individual cards
const HabitCard = ({ habit, isDone, onLog, onDelete }) => (
  <div className={`${styles.card} ${isDone ? styles.completed : ''}`}>
    <div className={styles.cardInfo}>
      <h4>{habit.title}</h4>
      <span className={styles.streak}>
        {isDone ? "Completed for today" : "Needs attention"}
      </span>
    </div>
    <div className={styles.cardActions}>
      <button 
        onClick={onLog} 
        className={styles.checkBtn} 
        disabled={isDone}
        title="Mark Complete"
      >
        <IoCheckmarkCircle />
      </button>
      <button onClick={onDelete} className={styles.deleteBtn} title="Archive">
        <IoTrashBin />
      </button>
    </div>
  </div>
);

export default Habits;