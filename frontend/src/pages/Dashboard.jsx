// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import Header from '../components/dashboard/Header';
import OracleInsight from '../components/dashboard/OracleInsight';
import Timeline from '../components/dashboard/Timeline';
import BottomNav from '../components/dashboard/BottomNav';
import Modal from '../components/tasks/Modal';
import apiClient from '../api/axios';
import { IoAdd } from 'react-icons/io5';

const Dashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [insightData, setInsightData] = useState(null); // State for insights
    const [isLoading, setIsLoading] = useState(true); // Loading state

    useEffect(() => {
        const fetchInsights = async () => {
          try {
            setIsLoading(true);
            const response = await apiClient.get('/insights');
            setInsightData(response.data);
          } catch (error) {
            console.error("Failed to fetch Oracle insights:", error);
            // Set a default error state so the UI doesn't break
            setInsightData({ message: 'Could not load insights.', tasks: [] });
          } finally {
            setIsLoading(false);
          }
        };
    
        fetchInsights();
      }, []); // The empty array [] means this effect runs once when the component mounts

  return (
    <div className={styles.dashboardLayout}>
      <Header />
      <main className={styles.mainContent}>
        <OracleInsight insightData={insightData} isLoading={isLoading} />
        <Timeline />
        <button className={styles.floatingActionButton}
        onClick={() => setIsModalOpen(true)}>
          <IoAdd size={32} />
        </button>
      </main>
      <BottomNav />

      {/* Conditionally render the modal */}
      {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default Dashboard;