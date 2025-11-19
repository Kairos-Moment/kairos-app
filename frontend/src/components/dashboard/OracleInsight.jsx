// frontend/src/components/dashboard/OracleInsight.jsx

import React from 'react';
import styles from './OracleInsight.module.css';
import { BsScroll } from 'react-icons/bs'; // A more thematic icon for tasks
import { GiLaurels } from 'react-icons/gi'; // A thematic icon for the title

// A dedicated component for the loading state skeleton
const SkeletonLoader = () => (
  <div className={`${styles.insightCard} ${styles.loading}`}>
    <h2>
      <GiLaurels size={28} /> The Oracle's Insight
    </h2>
    <div className={styles.skeleton} style={{ width: '80%', height: '1.2rem', marginBottom: '0.5rem' }} />
    <div className={styles.skeleton} style={{ width: '60%', height: '1.2rem' }} />
    <ul className={styles.taskList} style={{ marginTop: '1.5rem' }}>
      <li><div className={styles.skeleton} style={{ width: '90%', height: '1.5rem' }} /></li>
      <li><div className={styles.skeleton} style={{ width: '70%', height: '1.5rem' }} /></li>
    </ul>
  </div>
);

const OracleInsight = ({ insightData, isLoading }) => {
  // 1. Render the Skeleton Loader while data is being fetched.
  if (isLoading || !insightData) {
    return <SkeletonLoader />;
  }

  const { message, tasks } = insightData;

  // 2. Render the main component once data is available.
  return (
    <div className={styles.insightCard}>
      <h2>
        <GiLaurels size={28} /> The Oracle's Insight
      </h2>
      <p>{message}</p>
      
      {/* 3. Check if there are tasks to display */}
      {tasks && tasks.length > 0 ? (
        <ul className={styles.taskList}>
          {tasks.map((task, index) => (
            <li key={index}>
              <span className={styles.taskIcon}><BsScroll /></span>
              <span className={styles.taskText}>{task.text}</span>
              <span className={styles.taskDue}>{task.due}</span>
            </li>
          ))}
        </ul>
      ) : (
        // 4. Display a friendly message if there are no tasks.
        <div className={styles.noTasksMessage}>
          No high-priority tasks for today. A perfect moment to plan or rest.
        </div>
      )}
    </div>
  );
};

export default OracleInsight;