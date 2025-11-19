// frontend/src/components/dashboard/Timeline.jsx
import React from 'react';
import styles from './Timeline.module.css';
import TimelineItem from './TimelineItem';
import { format } from 'date-fns'; // Great for formatting dates/times

// A skeleton loader for when tasks are fetching
const TimelineSkeleton = () => (
  <div className={styles.skeletonItem}>
    <div className={styles.skeletonCircle}></div>
    <div className={styles.skeletonCard}></div>
  </div>
);

const Timeline = ({ tasks, isLoading }) => {
  // 1. Handle the loading state
  if (isLoading) {
    return (
      <div className={styles.timeline}>
        <TimelineSkeleton />
        <TimelineSkeleton />
      </div>
    );
  }

  // 2. Handle the empty state
  if (!tasks || tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>Your timeline is clear.</h3>
        <p>Click the '+' button to add a new task.</p>
      </div>
    );
  }

  return (
    <div className={styles.timeline}>
      {tasks.map(task => {
        // Simple logic to determine the task type/tag for styling
        const type = task.is_urgent ? 'Urgent Task' : 'Scheduled Task';
        
        return (
          <TimelineItem
            key={task.id}
            hour={task.due_date ? format(new Date(task.due_date), 'HH') : '--'}
            type={type}
            title={task.title}
            description={task.description}
            status={task.status}
          />
        );
      })}
    </div>
  );
};

export default Timeline;