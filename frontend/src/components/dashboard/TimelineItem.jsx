// frontend/src/components/dashboard/TimelineItem.jsx

import React, { useState, useEffect } from 'react';
import styles from './TimelineItem.module.css';
import { IoChevronDown } from 'react-icons/io5';
import apiClient from '../../api/axios'; // Ensure this path points to your axios instance

const TimelineItem = ({ hour, type, title, description, status, subtasks = [] }) => {
  // State to control the accordion (Expand/Collapse)
  const [isOpen, setIsOpen] = useState(false);

  // Local state to manage subtasks for this specific item.
  // We initialize it with the props passed down from the parent (Dashboard).
  const [localSubTasks, setLocalSubTasks] = useState(subtasks);

  // Effect: If the parent data refreshes, ensure our local state stays in sync.
  useEffect(() => {
    setLocalSubTasks(subtasks);
  }, [subtasks]);

  /**
   * Handles toggling a subtask's completion status.
   * It updates the UI immediately (Optimistic Update) and then calls the API.
   */
  const handleToggleSubTask = async (subtaskId) => {
    // 1. Optimistic UI Update: Flip the boolean immediately so it feels fast
    const updatedList = localSubTasks.map(sub => 
      sub.id === subtaskId ? { ...sub, is_completed: !sub.is_completed } : sub
    );
    setLocalSubTasks(updatedList);

    // 2. API Call: Save the change to the database
    try {
      // NOTE: Ensure your backend router has this route defined:
      // router.patch('/subtasks/:id/toggle', toggleSubtask);
      // If your tasks router is mounted at /api/tasks, the full path is /api/tasks/subtasks/:id/toggle
      await apiClient.patch(`/tasks/subtasks/${subtaskId}/toggle`);
    } catch (err) {
      console.error("Failed to toggle subtask status:", err);
      // Optional: Revert state here if you want strict data consistency on error
      // setLocalSubTasks(subtasks); 
    }
  };

  // Helper to generate a CSS class based on the task type (e.g., "Deep Work" -> "deep-work")
  const typeClass = type ? type.toLowerCase().replace(/\s+/g, '-') : 'default';

  return (
    <div className={styles.timelineItem}>
      {/* Left Column: Time */}
      <div className={styles.timeMarker}>
        <span>{hour}</span>
      </div>

      {/* Right Column: Task Card */}
      <div className={styles.card}>
        {/* Header: Click to toggle Accordion */}
        <div className={styles.cardHeader} onClick={() => setIsOpen(!isOpen)}>
          <div className={styles.headerContent}>
            <span className={`${styles.tag} ${styles[typeClass]}`}>{type || 'Task'}</span>
            <span className={styles.status}>{status}</span>
          </div>
          
          {/* Show Chevron only if there is expandable content */}
          {(localSubTasks.length > 0 || description) && (
            <IoChevronDown className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
          )}
        </div>

        {/* Main Body: Title */}
        <div className={styles.cardBody}>
          <h3>{title}</h3>
          
          {/* Description: Shown only when open (or always if you prefer) */}
          {isOpen && description && <p>{description}</p>}
        </div>

        {/* Accordion Content: Subtasks List */}
        {isOpen && localSubTasks.length > 0 && (
          <div className={styles.accordionContent}>
            <h4>Sub-tasks</h4>
            <ul className={styles.subTaskList}>
              {localSubTasks.map(sub => (
                <li 
                  key={sub.id} 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent closing the accordion when clicking a task
                    handleToggleSubTask(sub.id);
                  }}
                  className={sub.is_completed ? styles.completedItem : ''}
                >
                  {/* Checkbox: Controlled by is_completed status */}
                  <input 
                    type="checkbox" 
                    checked={sub.is_completed || false} 
                    readOnly // React complains without onChange, but we handle it via onClick on the parent li
                  />
                  <span>{sub.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineItem;