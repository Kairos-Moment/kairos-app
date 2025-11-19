// frontend/src/pages/HabitsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import styles from './Habits.module.css';
import apiClient from '../api/axios';
import { IoAdd } from 'react-icons/io5';
import { format, isToday } from 'date-fns';

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHabitsAndLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const [habitsResponse, logsResponse] = await Promise.all([
        apiClient.get('/api/habits'),
        apiClient.get('/api/habit-logs') // NOTE: You'll need to create this route/controller
      ]);
      setHabits(habitsResponse.data);
      setLogs(logsResponse.data);
    } catch (error) {
      console.error("Failed to fetch habits or logs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabitsAndLogs();
  }, [fetchHabitsAndLogs]);

  const handleToggleHabit = async (habitId, isCompleted) => {
    try {
      if (isCompleted) {
        // Here you would call a DELETE /api/habit-logs/:logId endpoint
        console.log("Un-completing habit - Not implemented yet");
      } else {
        const today = format(new Date(), 'yyyy-MM-dd');
        await apiClient.post('/api/habit-logs', {
          habit_id: habitId,
          completion_date: today
        });
        // Refetch data to show the update
        fetchHabitsAndLogs();
      }
    } catch (error) {
      console.error("Failed to toggle habit:", error);
    }
  };
  
  const getIsCompletedToday = (habitId) => {
    return logs.some(log => log.habit_id === habitId && isToday(new Date(log.completion_date)));
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading your habits...</div>;
  }

  return (
    <div className={styles.habits}>
      <header className={styles.header}>
        <h1>Your Habits</h1>
        <button className={styles.newHabitButton}><IoAdd size={24} /> New Habit</button>
      </header>
      
      <div className={styles.habitList}>
        {habits.map(habit => {
          const isCompleted = getIsCompletedToday(habit.id);
          return (
            <div key={habit.id} className={`${styles.habitItem} ${isCompleted ? styles.completed : ''}`} onClick={() => handleToggleHabit(habit.id, isCompleted)}>
              <div className={styles.checkbox}>
                {isCompleted && '✔'}
              </div>
              <div className={styles.habitDetails}>
                <h3>{habit.title}</h3>
                <p>{habit.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Habits;