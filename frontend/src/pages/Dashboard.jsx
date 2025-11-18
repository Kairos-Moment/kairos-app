import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import apiClient from '../api/axios';

// Import all visual components
import Header from '../components/dashboard/Header';
import OracleInsight from '../components/dashboard/OracleInsight';
import Timeline from '../components/dashboard/Timeline';
import BottomNav from '../components/dashboard/BottomNav';
import NewTaskModal from '../components/tasks/Modal';

// Import icons
import { IoAdd, IoMic } from 'react-icons/io5';

// Import custom hook and utilities for speech
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { processCommand } from '../utils/speech';

const Dashboard = () => {
  // State for the "New Task" modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for the Oracle's insight data
  const [insightData, setInsightData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Destructure properties from our custom speech recognition hook
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasSupport,
  } = useSpeechRecognition();

  // Effect hook to fetch Oracle insights when the component mounts
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/insights');
        setInsightData(response.data);
      } catch (error)
      {
        console.error("Failed to fetch Oracle insights:", error);
        // Set a default error state so the UI doesn't break
        setInsightData({ message: 'Could not load insights at the moment.', tasks: [] });
      } finally
      {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []); // The empty array [] ensures this effect runs only once

  // Effect hook to process the voice command after the user has finished speaking
  useEffect(() => {
    // We only process the command if listening has stopped and there is a transcript
    if (!isListening && transcript) {
      processCommand(transcript, insightData);
    }
  }, [transcript, isListening, insightData]); // This effect depends on these values

  return (
    <div className={styles.dashboardLayout}>
      <Header />

      <main className={styles.mainContent}>
        {/* NEW: Section for Oracle's Insight and Mic button */}
        <div className={styles.oracleSection}>
          <OracleInsight insightData={insightData} isLoading={isLoading} />
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

        {/* NEW: Section for Timeline and Add Task button */}
        <div className={styles.timelineSection}>
          <Timeline />
          <button
            className={styles.floatingActionButton}
            onClick={() => setIsModalOpen(true)}
          >
            <IoAdd size={32} />
          </button>
        </div>
        
        {/* Visual indicator for listening remains at the bottom */}
        {isListening && <div className={styles.transcriptOverlay}>Listening...</div>}
      </main>

      <BottomNav />

      {isModalOpen && <NewTaskModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default Dashboard;