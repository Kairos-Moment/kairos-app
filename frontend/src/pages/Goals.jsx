// frontend/src/pages/GoalsPage.jsx

import React, { useState, useEffect } from 'react';
import styles from './Goals.module.css';
import apiClient from '../api/axios';
import { IoAdd } from 'react-icons/io5';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/api/goals');
        setGoals(response.data);
      } catch (error) {
        console.error("Failed to fetch goals:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGoals();
  }, []);

  if (isLoading) {
    return <div className={styles.loading}>Loading your goals...</div>;
  }

  return (
    <div className={styles.goals}>
      <header className={styles.header}>
        <h1>Your Goals</h1>
        <button className={styles.newGoalButton}>
          <IoAdd size={24} /> New Goal
        </button>
      </header>
      
      {goals.length > 0 ? (
        <div className={styles.goalsGrid}>
          {goals.map(goal => (
            <div key={goal.id} className={styles.goalCard}>
              <h3>{goal.title}</h3>
              <p>{goal.description || 'No description provided.'}</p>
              <div className={styles.goalFooter}>
                <span>Status: <strong>{goal.status}</strong></span>
                {goal.target_date && <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>You haven't set any goals yet.</div>
      )}
    </div>
  );
};

export default Goals;