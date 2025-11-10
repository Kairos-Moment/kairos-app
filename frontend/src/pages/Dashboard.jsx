// frontend/src/pages/DashboardPage.jsx
import React from 'react';
import styles from './Dashboard.module.css';
import Header from '../components/dashboard/Header';
import OracleInsight from '../components/dashboard/OracleInsight';
import Timeline from '../components/dashboard/Timeline';
import BottomNav from '../components/dashboard/BottomNav';
import { IoAdd } from 'react-icons/io5';

const Dashboard = () => {
  return (
    <div className={styles.dashboardLayout}>
      <Header />
      <main className={styles.mainContent}>
        <OracleInsight />
        <Timeline />
        <button className={styles.floatingActionButton}>
          <IoAdd size={32} />
        </button>
      </main>
      <BottomNav />
    </div>
  );
};

export default Dashboard;