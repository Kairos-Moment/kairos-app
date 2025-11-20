// frontend/src/pages/DashboardPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import styles from './Dashboard.module.css';
import apiClient from '../api/axios'; // Still needed for insights, can be refactored later

// --- NEW: Import the specific API functions ---
import { getTasks } from '../api/tasksAPI'; 

// Import Child Components
import OracleInsight from '../components/dashboard/OracleInsight';
import Timeline from '../components/dashboard/Timeline';
import Modal from '../components/tasks/Modal';

// Import Icons and other utilities/hooks
import { IoAdd, IoMic } from 'react-icons/io5';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { processCommand } from '../utils/speech';

/**
 * The main dashboard page of the Kairos application.
 * This component is responsible for:
 * - Fetching initial data for Oracle insights and the user's tasks.
 * - Managing the state for tasks and the visibility of the "New Task" modal.
 * - Handling real-time updates when a new task is created.
 * - Orchestrating the voice command functionality.
 */
const Dashboard = () => {
  // --- STATE MANAGEMENT ---

  // State for the "New Task" modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for the Oracle's insight data
  const [insightData, setInsightData] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);

  // State for the user's tasks displayed in the timeline
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  // Destructure properties from our custom speech recognition hook
  const { isListening, transcript, startListening, stopListening, hasSupport } = useSpeechRecognition();

  // --- DATA FETCHING ---

  // Fetches tasks using the dedicated API function.
  const fetchTasks = useCallback(async () => {
    try {
      setIsLoadingTasks(true);
      const tasksData = await getTasks(); // Use the clean API function
      setTasks(tasksData);
    } catch (error) {
      console.error("Dashboard failed to fetch tasks. This error is caught here after being thrown by tasksAPI.", error);
      // Optionally, set an error state to show a message in the UI.
    } finally {
      setIsLoadingTasks(false);
    }
  }, []);

  // This `useEffect` hook runs once when the component is first mounted to load all initial data.
  useEffect(() => {
    const fetchInitialData = async () => {
      // Run requests in parallel for a faster user experience.
      await Promise.all([
        // Fetch Oracle insights
        (async () => {
          try {
            setIsLoadingInsights(true);
            const response = await apiClient.get('/insights');
            setInsightData(response.data);
          } catch (error) {
            console.error("Failed to fetch Oracle insights:", error);
            setInsightData({ message: 'Could not load insights right now.', tasks: [] });
          } finally {
            setIsLoadingInsights(false);
          }
        })(),
        
        // Fetch user tasks using our refactored function
        fetchTasks()
      ]);
    };

    fetchInitialData();
  }, [fetchTasks]); // The dependency array includes `fetchTasks` as per React's hook rules.

  // Effect hook to process the voice command after the user has finished speaking.
  useEffect(() => {
    if (!isListening && transcript) {
      processCommand(transcript, insightData);
    }
  }, [transcript, isListening, insightData]);

  // --- EVENT HANDLERS ---

  /**
   * This handler is called by the NewTaskModal after a new task is successfully created.
   * It updates the local state to show the new task immediately without a page refresh.
   * @param {object} newTask - The new task object returned from the API.
   */
  const handleTaskCreated = (newTask) => {
    // Add the new task to the state and re-sort the array by due date.
    setTasks(prevTasks => 
      [...prevTasks, newTask].sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    );
    // Close the modal upon successful creation.
    setIsModalOpen(false);
  };

  // --- RENDER ---

  return (
    // This component no longer renders Header or BottomNav, as that is handled by MainLayout.
    // The root element is a simple div that acts as the content container.
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
        {/* Pass the live tasks and their loading state down to the Timeline component */}
        <Timeline tasks={tasks} isLoading={isLoadingTasks} />
        <button
          className={styles.floatingActionButton}
          onClick={() => setIsModalOpen(true)}
        >
          <IoAdd size={32} />
        </button>
      </div>
      
      {/* Visual indicator that the app is listening */}
      {isListening && <div className={styles.transcriptOverlay}>Listening...</div>}

      {/* The "New Task" modal, which is conditionally rendered */}
      {/* It receives the handler function to communicate back to this page */}
      {isModalOpen && <Modal onTaskCreated={handleTaskCreated} onClose={() => setIsModalOpen(false)} />}
      
    </div>
  );
};

export default Dashboard;