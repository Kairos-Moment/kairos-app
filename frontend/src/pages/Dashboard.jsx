// frontend/src/pages/DashboardPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import styles from './Dashboard.module.css';
import apiClient from '../api/axios';

// Import API functions
import { getTasks, deleteTask } from '../api/tasksAPI'; 

// Import Child Components
import OracleInsight from '../components/dashboard/OracleInsight';
import Timeline from '../components/dashboard/Timeline';
import Modal from '../components/tasks/Modal';

// Import Icons and hooks
import { IoAdd, IoMic } from 'react-icons/io5';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { processCommand } from '../utils/speech';

const Dashboard = () => {
  // --- STATE MANAGEMENT ---

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [insightData, setInsightData] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);

  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  const { isListening, transcript, startListening, stopListening, hasSupport } = useSpeechRecognition();

  // --- DATA FETCHING FUNCTIONS ---

  // 1. Fetch Oracle Insights (Memoized to be called from handlers)
  const fetchOracleInsights = useCallback(async () => {
    try {
      // Note: We don't set isLoadingInsights(true) here to avoid flashing the Skeleton 
      // every time we check off a box. We only load silently.
      const response = await apiClient.get('/insights');
      setInsightData(response.data);
    } catch (error) {
      console.error("Failed to refresh Oracle insights:", error);
    }
  }, []);

  // 2. Fetch Tasks (Memoized)
  const fetchTasks = useCallback(async () => {
    try {
      // We only show the loader on the very first mount, managed by useEffect below.
      // Subsequent calls (like updates) happen silently or with optimistic UI.
      const tasksData = await getTasks(); 
      setTasks(tasksData);
    } catch (error) {
      console.error("Dashboard failed to fetch tasks.", error);
    }
  }, []);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingTasks(true);
      setIsLoadingInsights(true);
      
      await Promise.all([
        fetchOracleInsights(),
        fetchTasks()
      ]);

      setIsLoadingTasks(false);
      setIsLoadingInsights(false);
    };

    fetchInitialData();
  }, [fetchOracleInsights, fetchTasks]);

  // --- VOICE COMMAND HANDLER ---
  useEffect(() => {
    if (!isListening && transcript) {
      processCommand(transcript, insightData);
    }
  }, [transcript, isListening, insightData]);

  // --- EVENT HANDLERS ---

  /**
   * Called when the Modal saves (Create or Update).
   * We re-fetch everything to ensure backend sync (IDs, subtasks, Oracle alerts).
   */
  const handleTaskSaved = async (savedTask) => {
    setIsModalOpen(false);
    setEditingTask(null);
    
    // Refresh both lists. 
    // If the task was urgent, the Oracle needs to know immediately.
    await fetchTasks();
    await fetchOracleInsights();
  };

  /**
   * Called directly when the user confirms deletion.
   */
  const handleDeleteClick = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId);
        
        // Optimistic update: Remove from UI immediately
        setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
        
        // REFRESH ORACLE: If we deleted an urgent task, the alert must vanish.
        fetchOracleInsights();

      } catch (error) {
        console.error("Failed to delete task", error);
        alert("Could not delete task.");
        fetchTasks(); // Revert on error
      }
    }
  };

  /**
   * Called by TimelineItem when a task status changes (e.g. auto-completed via subtasks).
   */
  const handleTaskUpdate = async () => {
    // Refresh tasks to update colors/sorting
    await fetchTasks();
    // Refresh Oracle to remove alerts if task is now completed
    await fetchOracleInsights();
  };

  const openNewTaskModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (taskToEdit) => {
    setEditingTask(taskToEdit);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // --- RENDER ---

  return (
    <div className={styles.dashboardContent}>

      <div className={styles.oracleSection}>
        <OracleInsight insightData={insightData} isLoading={isLoadingInsights} />
        {hasSupport && (
          <button
            className={`${styles.micButton} ${isListening ? styles.listening : ''}`}
            onClick={isListening ? stopListening : startListening}
            title="Ask the Oracle"
          >
            <IoMic size={28} />
          </button>
        )}
      </div>

      <div className={styles.timelineSection}>
        <h2 className={styles.timelineHeader}>Today's Timeline</h2>
        
        <Timeline 
          tasks={tasks} 
          isLoading={isLoadingTasks} 
          onEdit={handleEditClick} 
          onDelete={handleDeleteClick} 
          onTaskUpdate={handleTaskUpdate} // <--- Passed Down
        />
        
        <button
          className={styles.floatingActionButton}
          onClick={openNewTaskModal} 
        >
          <IoAdd size={32} />
        </button>
      </div>
      
      {isListening && <div className={styles.transcriptOverlay}>Listening...</div>}

      {isModalOpen && (
        <Modal 
          taskToEdit={editingTask}       
          onTaskSaved={handleTaskSaved}  
          onClose={handleModalClose}
        />
      )}
      
    </div>
  );
};

export default Dashboard;