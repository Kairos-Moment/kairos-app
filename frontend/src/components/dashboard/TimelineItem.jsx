// frontend/src/components/dashboard/TimelineItem.jsx
import React, { useState } from 'react';
import styles from './TimelineItem.module.css';
import { IoChevronDown } from 'react-icons/io5';

// Mock sub-tasks for now. Later, these would come from your API.
const mockSubTasks = [
  { id: 101, text: 'Outline the introduction', completed: true },
  { id: 102, text: 'Gather key statistics', completed: false },
  { id: 103, text: 'Draft the conclusion', completed: false },
];

const TimelineItem = ({ hour, type, title, description, status }) => {
  const [isOpen, setIsOpen] = useState(false); // State to control the accordion
  const [subTasks, setSubTasks] = useState(mockSubTasks);

  const handleToggleSubTask = (id) => {
    setSubTasks(prev => 
      prev.map(sub => 
        sub.id === id ? { ...sub, completed: !sub.completed } : sub
      )
    );
  };

  const typeClass = type.toLowerCase().replace(' ', '-');

  return (
    <div className={styles.timelineItem}>
      <div className={styles.timeMarker}>
        <span>{hour}</span>
      </div>
      <div className={styles.card}>
        <div className={styles.cardHeader} onClick={() => setIsOpen(!isOpen)}>
          <div className={styles.headerContent}>
            <span className={`${styles.tag} ${styles[typeClass]}`}>{type}</span>
            <span className={styles.status}>{status}</span>
          </div>
          <IoChevronDown className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
        </div>
        <div className={styles.cardBody}>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>

        {/* Accordion Content */}
        {isOpen && (
          <div className={styles.accordionContent}>
            <h4>Sub-tasks</h4>
            <ul className={styles.subTaskList}>
              {subTasks.map(sub => (
                <li key={sub.id} onClick={() => handleToggleSubTask(sub.id)}>
                  <input type="checkbox" checked={sub.completed} readOnly />
                  <span className={sub.completed ? styles.completed : ''}>{sub.text}</span>
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