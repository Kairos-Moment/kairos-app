// frontend/src/components/dashboard/TimelineItem.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TimelineItem.module.css';
import { 
  IoChevronDown, 
  IoPencil, 
  IoTrashOutline, 
  IoFlame, 
  IoCheckmarkDoneCircle 
} from 'react-icons/io5';
import apiClient from '../../api/axios';

const TimelineItem = ({ 
  task, 
  onEdit, 
  onDelete, 
  onTaskUpdate, 
  onStartFocus, 
  hour, 
  type 
}) => {
  const { id, title, description, status, subtasks = [] } = task;
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [localSubTasks, setLocalSubTasks] = useState(subtasks);

  // Keep local state synced with props if they change externally
  useEffect(() => {
    setLocalSubTasks(subtasks);
  }, [subtasks]);

  /**
   * Navigate user to the Focus Session page with this task pre-selected.
   */
  const handleFocusClick = (e) => {
    e.stopPropagation(); // Prevents clicking the card header to toggle the accordion
    
    // If a specific handler was passed from Dashboard, use it, otherwise use direct navigate
    if (onStartFocus) {
      onStartFocus(id);
    } else {
      navigate(`/focus?taskId=${id}`);
    }
  };

  /**
   * Toggles completion for a subtask and auto-updates parent task status.
   */
  const handleToggleSubTask = async (subtaskId) => {
    // 1. Optimistic Update: Update UI before server response
    const updatedList = localSubTasks.map(sub => 
      sub.id === subtaskId ? { ...sub, is_completed: !sub.is_completed } : sub
    );
    setLocalSubTasks(updatedList);

    try {
      // 2. API Call to toggle subtask
      await apiClient.patch(`/tasks/subtasks/${subtaskId}/toggle`);
      
      // 3. Auto-Complete Logic:
      const allCompleted = updatedList.every(st => st.is_completed);

      // Condition: All subtasks done, but task is still "pending"
      if (allCompleted && status !== 'completed') {
        await apiClient.put(`/tasks/${id}`, {
          ...task,
          status: 'completed',
          subtasks: updatedList 
        });
        if (onTaskUpdate) onTaskUpdate(); // Refresh Dashboard/Oracle
      } 
      // Condition: One subtask unchecked, but task was marked "completed"
      else if (!allCompleted && status === 'completed') {
        await apiClient.put(`/tasks/${id}`, {
          ...task,
          status: 'pending',
          subtasks: updatedList
        });
        if (onTaskUpdate) onTaskUpdate();
      }
    } catch (err) {
      console.error("Failed to update subtask:", err);
      setLocalSubTasks(subtasks); // Revert UI on error
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(id);
  };

  const typeClass = type ? type.toLowerCase().replace(/\s+/g, '-') : 'default';

  return (
    <div className={`${styles.timelineItem} ${status === 'completed' ? styles.completedTask : ''}`}>
      {/* Time Sidebar */}
      <div className={styles.timeMarker}>
        <span className={styles.hourLabel}>{hour}</span>
        <div className={styles.timelineDot}></div>
      </div>

      {/* Main Task Card */}
      <div className={styles.card}>
        
        {/* Header: Displays Category, Status, and Action Buttons */}
        <div className={styles.cardHeader} onClick={() => setIsOpen(!isOpen)}>
          <div className={styles.headerContent}>
            <span className={`${styles.tag} ${styles[typeClass]}`}>{type}</span>
            <span className={styles.statusLabel}>{status}</span>
          </div>

          <div className={styles.headerActions}>
            {/* FOCUS BUTTON: Only show if task isn't already completed */}
            {status !== 'completed' && (
              <button 
                className={`${styles.actionBtn} ${styles.focusBtn}`} 
                onClick={handleFocusClick}
                title="Enter Focus Mode"
              >
                <IoFlame size={18} />
              </button>
            )}

            <button 
              className={styles.actionBtn} 
              onClick={handleEdit}
              title="Edit Task"
            >
              <IoPencil size={16} />
            </button>
            
            <button 
              className={`${styles.actionBtn} ${styles.deleteBtn}`} 
              onClick={handleDelete}
              title="Delete Task"
            >
              <IoTrashOutline size={16} />
            </button>

            {/* Accordion Arrow: Only show if there's content to expand */}
            {(localSubTasks.length > 0 || description) && (
              <IoChevronDown className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
            )}
          </div>
        </div>

        {/* Card Body: Title and Description */}
        <div className={styles.cardBody}>
          <h3 className={status === 'completed' ? styles.strikeTitle : ''}>
            {title}
            {status === 'completed' && <IoCheckmarkDoneCircle className={styles.doneIcon} />}
          </h3>
          {isOpen && description && (
            <p className={styles.description}>{description}</p>
          )}
        </div>

        {/* Sub-tasks Accordion */}
        {isOpen && localSubTasks.length > 0 && (
          <div className={styles.accordionContent}>
            <h4 className={styles.subtaskHeader}>Required Virtues</h4>
            <ul className={styles.subTaskList}>
              {localSubTasks.map(sub => (
                <li 
                  key={sub.id} 
                  onClick={(e) => {
                    e.stopPropagation(); 
                    handleToggleSubTask(sub.id);
                  }}
                  className={sub.is_completed ? styles.completedSubItem : ''}
                >
                  <input 
                    type="checkbox" 
                    checked={sub.is_completed || false} 
                    readOnly 
                    className={styles.checkbox}
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