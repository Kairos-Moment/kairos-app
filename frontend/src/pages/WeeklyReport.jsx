import React, { useState, useEffect } from 'react';
import styles from './WeeklyReport.module.css';
// We don't need apiClient for the mock version, but we'll leave it for later
// import apiClient from '../api/axios'; 

import Header from '../components/dashboard/Header';
import BottomNav from '../components/dashboard/BottomNav';
import ProductivityChart from '../components/report/ProductivityChart';
import DistributionChart from '../components/report/DistributionChart';

// --- PASTE THE MOCK DATA HERE ---
const mockReportData = {
  summary: "Fantastic work this week, Jane! You crushed 11 tasks, with a major focus on your 'Capstone' goal. Thursday was your most productive day. Keep up the great momentum!",
  productivityData: [
    { name: 'Mon', tasks: 2 },
    { name: 'Tue', tasks: 3 },
    { name: 'Wed', tasks: 1 },
    { name: 'Thu', tasks: 4 },
    { name: 'Fri', tasks: 1 },
    { name: 'Sat', tasks: 0 },
    { name: 'Sun', tasks: 0 },
  ],
  distributionData: [
    { name: 'Capstone', value: 450 },
    { name: 'Personal', value: 195 },
    { name: 'Admin', value: 120 },
  ],
};
// --------------------------------

const WeeklyReport = () => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // --- THIS IS THE MODIFIED PART ---
    // We are commenting out the real API call
    /*
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/insights/weekly');
        setReportData(response.data);
      } catch (error) {
        console.error("Failed to fetch weekly report:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
    */

    // Instead, we use a timeout to simulate a network request with our mock data
    const timer = setTimeout(() => {
      setReportData(mockReportData);
      setIsLoading(false);
    }, 1000); // Simulate a 1-second delay

    // Cleanup function to prevent errors if the component unmounts
    return () => clearTimeout(timer);
  }, []); // The empty array ensures this runs only once

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Loading your report...</div>;
  }

  if (!reportData) {
    return <div style={{ padding: '2rem' }}>Could not load report data.</div>;
  }
  
  return (
    <div className={styles.reportLayout}>
      <Header />
      <main className={styles.mainContent}>
        <h1 className={styles.reportHeader}>Your Weekly Kairos</h1>
        
        <div className={styles.reportCard}>
          <h3>Oracle's Summary</h3>
          <p>{reportData.summary}</p>
        </div>

        <div className={styles.reportCard}>
          <h3>Productivity Peaks</h3>
          <ProductivityChart data={reportData.productivityData} />
        </div>
        
        <div className={styles.reportCard}>
          <h3>Time Distribution</h3>
          <DistributionChart data={reportData.distributionData} />
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default WeeklyReport;