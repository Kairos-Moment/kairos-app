// frontend/src/components/tasks/NewTaskModal.jsx

import React, { useState, useEffect } from 'react';
import styles from './Modal.module.css';
import apiClient from '../../api/axios';
import { IoClose, IoCalendarOutline, IoAdd } from 'react-icons/io5';

/**
 * A modal form for creating a new task.
 * @param {function} onClose - Function to call to close the modal.
 * @param {function} onTaskCreated - Callback function to pass the newly created task to the parent.
 */
const Modal = ({ onClose, onTaskCreated }) => {
  // --- STATE MANAGEMENT ---

  // State for each form field
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [goalId, setGoalId] = useState(null);
  
  // State for managing goals dropdown
  const [goals, setGoals] = useState([]);
  
  // State for UI feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // --- DATA FETCHING ---

  // Fetch the user's goals when the modal opens to populate the dropdown.
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await apiClient.get('/api/goals');
        setGoals(response.data);
      } catch (err) {
        console.error("Failed to fetch goals for modal:", err);
      }
    };
    fetchGoals();
  }, []); // Empty array ensures this runs only when the component mounts.

  // --- EVENT HANDLERS ---

  /**
   * Handles the form submission process.
   * It gathers the form data, sends it to the API, and then calls the
   * onTaskCreated callback on success.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;

    // Basic validation
    if (!title) {
      setError("Task Title is required.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    // Construct the data payload for the API
    const taskData = {
      title,
      description,
      is_urgent: isUrgent,
      is_important: isImportant,
      due_date: dueDate || null, // Send null if the date is empty
      goal_id: goalId || null,   // Send null if no goal is selected
      status: 'pending'          // Default status for new tasks
    };

    try {
      // Make the API call to the secure endpoint.
      // The user_id is handled automatically by the backend session.
      const response = await apiClient.post('/api/tasks', taskData);
      
      // On success, pass the newly created task object back to the parent component.
      onTaskCreated(response.data);
      
    } catch (err) {
      console.error("Failed to create task:", err);
      setError("Could not create task. Please try again.");
      setIsSubmitting(false); // Re-enable the button on failure
    }
  };

  // --- RENDER ---

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <header className={styles.modalHeader}>
          <button onClick={onClose} className={styles.cancelButton} disabled={isSubmitting}>
            <IoClose size={24} /> Cancel
          </button>
          <h2>NEW TASK</h2>
          <button onClick={handleSubmit} className={styles.saveButton} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </header>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Display any submission errors */}
          {error && <p className={styles.errorMessage}>{error}</p>}

          <div className={styles.formGroup}>
            <label htmlFor="taskTitle">Task Title</label>
            <input id="taskTitle" type="text" placeholder="e.g., Design homepage hero section" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea id="description" placeholder="Provide a detailed description of the task..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label>Priority</label>
            <div className={styles.priorityButtons}>
              <button type="button" onClick={() => setIsUrgent(!isUrgent)} className={isUrgent ? styles.active : ''}>Urgent</button>
              <button type="button" onClick={() => setIsImportant(!isImportant)} className={isImportant ? styles.active : ''}>Important</button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dueDate">Due Date</label>
            <input id="dueDate" type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="linkToGoal">Link to Goal</label>
            <select id="linkToGoal" value={goalId || ''} onChange={e => setGoalId(e.target.value ? parseInt(e.target.value) : null)}>
              <option value="">Select a goal (optional)</option>
              {goals.map(goal => (
                <option key={goal.id} value={goal.id}>{goal.title}</option>
              ))}
            </select>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;