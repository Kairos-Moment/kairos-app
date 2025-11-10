// frontend/src/components/dashboard/OracleInsight.jsx
import React from 'react';
import styles from './OracleInsight.module.css';
import { RiFileList2Line, RiFlaskLine, RiTeamLine } from 'react-icons/ri';

const insightTasks = [
  { icon: <RiFileList2Line />, text: 'Review Q3 Report', due: 'Due Today' },
  { icon: <RiFlaskLine />, text: 'Prepare for Client Meeting', due: 'Due Tomorrow' },
  { icon: <RiTeamLine />, text: 'Schedule Team Brainstorm', due: 'This Week' },
];

const OracleInsight = () => {
  return (
    <div className={styles.insightCard}>
      <h2>The Oracle's Insight</h2>
      <p>Seize the day with purpose! Focus on these high-leverage tasks to make today truly impactful.</p>
      <ul className={styles.taskList}>
        {insightTasks.map((task, index) => (
          <li key={index}>
            <span className={styles.taskIcon}>{task.icon}</span>
            <span className={styles.taskText}>{task.text}</span>
            <span className={styles.taskDue}>{task.due}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OracleInsight;