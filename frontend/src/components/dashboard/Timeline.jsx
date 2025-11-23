// frontend/src/components/dashboard/Timeline.jsx

import React from 'react';
import styles from './Timeline.module.css';
import TimelineItem from './TimelineItem';
import { format } from 'date-fns';

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

  // 3. Render the list
  return (
    <div className={styles.timeline}>
      {tasks.map(task => {
        // Simple logic to determine the task type/tag for styling
        // You can expand this logic based on your needs
        let type = 'Task';
        if (task.is_urgent) type = 'Urgent';
        if (task.goal_id) type = 'Goal Task'; // Example: if linked to a goal

        return (
          <TimelineItem
            key={task.id}
            // Format time as "2:30 PM" or "--" if no date
            hour={task.due_date ? format(new Date(task.due_date), 'h:mm a') : '--'}
            type={type}
            title={task.title}
            description={task.description}
            status={task.status}
            // CRITICAL ADDITION: Pass the subtasks array down to the item
            subtasks={task.subtasks} 
          />
        );
      })}
    </div>
  );
};

export default Timeline;