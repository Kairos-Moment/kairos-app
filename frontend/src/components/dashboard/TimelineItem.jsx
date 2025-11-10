// frontend/src/components/dashboard/TimelineItem.jsx
import React from 'react';
import styles from './TimelineItem.module.css';

const TimelineItem = ({ hour, type, title, description, status }) => {
  const typeClass = type.toLowerCase().replace(' ', '-'); // "Urgent Task" => "urgent-task"

  return (
    <div className={styles.timelineItem}>
      <div className={styles.timeMarker}>
        <span>{hour}</span>
      </div>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={`${styles.tag} ${styles[typeClass]}`}>{type}</span>
          <span className={styles.status}>{status}</span>
        </div>
        <div className={styles.cardBody}>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;