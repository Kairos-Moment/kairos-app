// frontend/src/components/dashboard/Header.jsx
import React from 'react';
import styles from './Header.module.css';
import { IoNotificationsOutline, IoSettingsOutline } from 'react-icons/io5';

const Header = () => {
  // Using a static date for design consistency
  const displayDate = "Tuesday, November 4, 2025";

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src="/kairos-logo.svg" alt="Kairos Logo" className={styles.logoIcon} />
        <h1>Kairos</h1>
      </div>
      <div className={styles.dateDisplay}>{displayDate}</div>
      <div className={styles.userSection}>
        <img src="https://i.pravatar.cc/40?img=1" alt="Jane Doe" className={styles.avatar} />
        <span>Jane Doe</span>
        <IoNotificationsOutline size={24} className={styles.icon} />
        <IoSettingsOutline size={24} className={styles.icon} />
      </div>
    </header>
  );
};

export default Header;