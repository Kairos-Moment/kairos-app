// frontend/src/components/tasks/NewTaskModal.jsx
import React, { useState } from 'react';
import styles from './Modal.module.css';
import { IoClose, IoCalendarOutline, IoAdd } from 'react-icons/io5';

const Modal = ({ onClose }) => {
  // State for all form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [tags, setTags] = useState(['capstone']);
  const [currentTag, setCurrentTag] = useState('');

  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = { title, description, isUrgent, isImportant, tags };
    console.log('Submitting Task:', taskData);
    // Here you would eventually call your API
    onClose(); // Close modal on submit
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <header className={styles.modalHeader}>
          <button onClick={onClose} className={styles.cancelButton}>
            <IoClose size={24} /> Cancel
          </button>
          <h2>NEW TASK</h2>
          <button onClick={handleSubmit} className={styles.saveButton}>Save</button>
        </header>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="taskTitle">Task Title</label>
            <input id="taskTitle" type="text" placeholder="e.g., Design homepage hero section" value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea id="description" placeholder="Provide a detailed description of the task requirements and objectives." value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label>Priority</label>
            <div className={styles.priorityButtons}>
              <button type="button" onClick={() => setIsUrgent(!isUrgent)} className={isUrgent ? styles.active : ''}>Urgent</button>
              <button type="button" onClick={() => setIsImportant(!isImportant)} className={isImportant ? styles.active : ''}>Important</button>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="dueDate">Due Date</label>
              <div className={styles.dateInputWrapper}>
                <IoCalendarOutline />
                <input id="dueDate" type="text" placeholder="Pick a date" />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="estimatedTime">Estimated Time</label>
              <input id="estimatedTime" type="text" placeholder="e.g., 3 hours or 2 days" />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="linkToGoal">Link to Goal</label>
            <select id="linkToGoal">
              <option value="">Select a goal</option>
              <option value="goal1">Complete Capstone Project</option>
              <option value="goal2">Learn Advanced CSS</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Tags</label>
            <div className={styles.tagInputWrapper}>
              <input type="text" placeholder="Add new tag" value={currentTag} onChange={e => setCurrentTag(e.target.value)} />
              <button type="button" onClick={handleAddTag}><IoAdd /></button>
            </div>
            <div className={styles.tagsList}>
              {tags.map(tag => (
                <span key={tag} className={styles.tagItem}>
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}><IoClose /></button>
                </span>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;