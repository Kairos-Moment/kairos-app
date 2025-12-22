// frontend/src/components/dashboard/TimelineItem.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import styles from './TimelineItem.module.css';
import { IoChevronDown, IoPencil, IoTrashOutline, IoFlame } from 'react-icons/io5'; // 2. Add IoFlame
import apiClient from '../../api/axios';

const TimelineItem = ({ task, onEdit, onDelete, onTaskUpdate, hour, type }) => {
  const { id, title, description, status, subtasks = [] } = task;
  const navigate = useNavigate(); // 3. Initialize navigate

  const [isOpen, setIsOpen] = useState(false);
  const [localSubTasks, setLocalSubTasks] = useState(subtasks);

  useEffect(() => {
    setLocalSubTasks(subtasks);
  }, [subtasks]);

  // 4. Handler to jump to Focus Mode
  const handleFocusClick = (e) => {
    e.stopPropagation(); // Prevent opening accordion
    navigate(`/focus?taskId=${id}`);
  };

  const handleToggleSubTask = async (subtaskId) => {
    const updatedList = localSubTasks.map(sub => 
      sub.id === subtaskId ? { ...sub, is_completed: !sub.is_completed } : sub
    );
    setLocalSubTasks(updatedList);

    try {
      await apiClient.patch(`/tasks/subtasks/${subtaskId}/toggle`);
      const allCompleted = updatedList.every(st => st.is_completed);

      if (allCompleted && status !== 'completed') {
        await apiClient.put(`/tasks/${id}`, {
          ...task,
          status: 'completed',
          subtasks: updatedList 
        });
        if (onTaskUpdate) onTaskUpdate();
      } 
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
      setLocalSubTasks(subtasks);
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
    <div className={styles.timelineItem}>
      <div className={styles.timeMarker}>
        <span>{hour}</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader} onClick={() => setIsOpen(!isOpen)}>
          <div className={styles.headerContent}>
            <span className={`${styles.tag} ${styles[typeClass]}`}>{type || 'Task'}</span>
            <span className={styles.status}>{status}</span>
          </div>

          <div className={styles.headerActions}>
            {/* 5. ADD THE FOCUS BUTTON HERE */}
            <button 
              className={`${styles.actionBtn} ${styles.focusBtn}`} 
              onClick={handleFocusClick}
              title="Enter Focus Mode"
            >
              <IoFlame size={18} />
            </button>

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

            {(localSubTasks.length > 0 || description) && (
              <IoChevronDown className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
            )}
          </div>
        </div>

        <div className={styles.cardBody}>
          <h3>{title}</h3>
          {isOpen && description && <p>{description}</p>}
        </div>

        {isOpen && localSubTasks.length > 0 && (
          <div className={styles.accordionContent}>
            <h4>Sub-tasks</h4>
            <ul className={styles.subTaskList}>
              {localSubTasks.map(sub => (
                <li 
                  key={sub.id} 
                  onClick={(e) => {
                    e.stopPropagation(); 
                    handleToggleSubTask(sub.id);
                  }}
                  className={sub.is_completed ? styles.completedItem : ''}
                >
                  <input 
                    type="checkbox" 
                    checked={sub.is_completed || false} 
                    readOnly 
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