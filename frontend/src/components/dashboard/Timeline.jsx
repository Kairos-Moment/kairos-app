// frontend/src/components/dashboard/Timeline.jsx

import React from 'react';
import styles from './Timeline.module.css';
import TimelineItem from './TimelineItem';
import { format } from 'date-fns';

const TimelineSkeleton = () => (
  <div className={styles.skeletonItem}>
    <div className={styles.skeletonCircle}></div>
    <div className={styles.skeletonCard}></div>
  </div>
);

const Timeline = ({ tasks, isLoading, onEdit, onDelete, onTaskUpdate }) => {
  
  // 1. Handle Loading
  if (isLoading) {
    return (
      <div className={styles.timeline}>
        <TimelineSkeleton />
        <TimelineSkeleton />
        <TimelineSkeleton />
      </div>
    );
  }

  // 2. Handle Empty State
  if (!tasks || tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>Your timeline is clear.</h3>
        <p>Click the '+' button to add a new task.</p>
      </div>
    );
  }

  // 3. Render List
  return (
    <div className={styles.timeline}>
      {tasks.map(task => {
        let type = 'Task';
        if (task.is_urgent) type = 'Urgent';
        if (task.goal_id) type = 'Goal Task';

        return (
          <TimelineItem
            key={task.id}
            task={task}
            hour={task.due_date ? format(new Date(task.due_date), 'h:mm a') : '--'}
            type={type}
            onEdit={onEdit}
            onDelete={onDelete}
            onTaskUpdate={onTaskUpdate} // <--- Pass it down
          />
        );
      })}
    </div>
  );
};

export default Timeline;