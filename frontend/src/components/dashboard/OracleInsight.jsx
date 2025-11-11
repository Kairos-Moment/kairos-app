// frontend/src/components/dashboard/OracleInsight.jsx
import React from 'react';
import styles from './OracleInsight.module.css';
import { RiFileList2Line } from 'react-icons/ri';

const OracleInsight = ({ insightData, isLoading }) => {
  // Display a loading skeleton or message
  if (isLoading || !insightData) {
    return (
      <div className={`${styles.insightCard} ${styles.loading}`}>
        <h2>The Oracle's Insight</h2>
        <p>Analyzing your day...</p>
      </div>
    );
  }

  const { message, tasks } = insightData;

  return (
    <div className={styles.insightCard}>
      <h2>The Oracle's Insight</h2>
      <p>{message}</p>
      {tasks && tasks.length > 0 && (
        <ul className={styles.taskList}>
          {tasks.map((task, index) => (
            <li key={index}>
              <span className={styles.taskIcon}><RiFileList2Line /></span>
              <span className={styles.taskText}>{task.text}</span>
              <span className={styles.taskDue}>{task.due}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OracleInsight;