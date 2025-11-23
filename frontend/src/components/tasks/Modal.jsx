import React, { useState, useEffect } from 'react';
import styles from './Modal.module.css';
import apiClient from '../../api/axios';
import { IoClose, IoAdd, IoTrashBin, IoList } from 'react-icons/io5'; // Added IoList, IoTrashBin

const Modal = ({ onClose, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [goalId, setGoalId] = useState(null);
  
  // ** NEW: Subtasks State **
  const [subtasks, setSubtasks] = useState([]); 
  const [goals, setGoals] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

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

  // --- SUBTASK HANDLERS ---
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
      status: 'pending',
      // Filter out empty lines before sending
      subtasks: subtasks.filter(st => st.title.trim() !== '')
    };

    try {
      // NOTE: Make sure your route is just '/tasks' (apiClient handles base URL)
      const response = await apiClient.post('/tasks', taskData);
      onTaskCreated(response.data);
    } catch (err) {
      console.error("Failed to create task:", err);
      setError("Could not create task. Please try again.");
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
          <h2>NEW TASK</h2>
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

          {/* --- NEW SUBTASK UI --- */}
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