import React, { useState, useEffect } from 'react';
import styles from './Modal.module.css';
import apiClient from '../../api/axios';
import { IoClose, IoAdd, IoTrashBin, IoList } from 'react-icons/io5';

const Modal = ({ onClose, onTaskSaved, taskToEdit }) => {
  // If taskToEdit exists, use its values, otherwise default
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [goalId, setGoalId] = useState(null);
  
  const [subtasks, setSubtasks] = useState([]); 
  const [goals, setGoals] = useState([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch Goals
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await apiClient.get('/goals');
        setGoals(response.data);
      } catch (err) {
        console.error("Failed to fetch goals:", err);
      }
    };
    fetchGoals();
  }, []);

  // 2. Populate form if we are in "Edit Mode"
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setIsUrgent(taskToEdit.is_urgent || false);
      setIsImportant(taskToEdit.is_important || false);
      setGoalId(taskToEdit.goal_id || null);

      // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
      if (taskToEdit.due_date) {
        const dateObj = new Date(taskToEdit.due_date);
        // Adjust to local ISO string
        const offset = dateObj.getTimezoneOffset() * 60000; 
        const localISOTime = (new Date(dateObj - offset)).toISOString().slice(0, 16);
        setDueDate(localISOTime);
      }

      // Handle subtasks
      // We keep existing IDs to update them, or generate tempIds for UI
      if (taskToEdit.subtasks && taskToEdit.subtasks.length > 0) {
        setSubtasks(taskToEdit.subtasks.map(st => ({
          ...st,
          tempId: st.id || Date.now() + Math.random() // Ensure unique key
        })));
      }
    }
  }, [taskToEdit]);

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { tempId: Date.now(), title: '' }]);
  };

  const handleSubtaskChange = (tempId, value) => {
    setSubtasks(subtasks.map(st => st.tempId === tempId ? { ...st, title: value } : st));
  };

  const handleRemoveSubtask = (tempId) => {
    setSubtasks(subtasks.filter(st => st.tempId !== tempId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!title) {
      setError("Task Title is required.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    const taskData = {
      title,
      description,
      is_urgent: isUrgent,
      is_important: isImportant,
      due_date: dueDate || null,
      goal_id: goalId || null,
      status: taskToEdit ? taskToEdit.status : 'pending', // Preserve status if editing
      subtasks: subtasks.filter(st => st.title.trim() !== '')
    };

    try {
      let response;
      if (taskToEdit) {
        // --- UPDATE EXISTING TASK ---
        response = await apiClient.put(`/tasks/${taskToEdit.id}`, taskData);
      } else {
        // --- CREATE NEW TASK ---
        response = await apiClient.post('/tasks', taskData);
      }
      
      // Call the unified handler in Dashboard
      onTaskSaved(response.data);
    } catch (err) {
      console.error("Failed to save task:", err);
      setError("Could not save task. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <header className={styles.modalHeader}>
          <button onClick={onClose} className={styles.cancelButton} disabled={isSubmitting}>
            <IoClose size={24} /> Cancel
          </button>
          {/* Dynamic Title */}
          <h2>{taskToEdit ? 'EDIT TASK' : 'NEW TASK'}</h2>
          <button onClick={handleSubmit} className={styles.saveButton} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </header>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <p className={styles.errorMessage}>{error}</p>}

          <div className={styles.formGroup}>
            <label htmlFor="taskTitle">Task Title</label>
            <input id="taskTitle" type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea id="description" placeholder="Description..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label style={{display:'flex', alignItems:'center', gap:'5px'}}>
               <IoList /> Sub-tasks
            </label>
            <div style={{display:'flex', flexDirection:'column', gap:'8px', marginBottom:'10px'}}>
              {subtasks.map((st, index) => (
                <div key={st.tempId} style={{display:'flex', gap:'10px'}}>
                  <input 
                    type="text" 
                    placeholder={`Step ${index + 1}`}
                    value={st.title}
                    onChange={(e) => handleSubtaskChange(st.tempId, e.target.value)}
                    style={{flex:1}}
                  />
                  <button type="button" onClick={() => handleRemoveSubtask(st.tempId)} style={{background:'none', border:'none', color:'red', cursor:'pointer'}}>
                    <IoTrashBin size={18}/>
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={handleAddSubtask} style={{background:'none', border:'1px dashed #ccc', width:'100%', padding:'8px', cursor:'pointer', color:'#666'}}>
              <IoAdd /> Add Step
            </button>
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