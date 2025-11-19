// frontend/src/components/dashboard/Header.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import { IoNotificationsOutline, IoSettingsOutline, IoLogOutOutline } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext'; // 1. Import the useAuth hook

const Header = () => {
  // 2. Get auth state and functions from the AuthContext
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // 3. Get the real current date and format it
  const displayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 4. A simple loading state to prevent a "flash" of the guest view
  if (isLoading) {
    return (
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src="/kairos-logo.svg" alt="Kairos Logo" className={styles.logoIcon} />
          <h1>Kairos</h1>
        </div>
        <div className={styles.userSection}>
          <span>Loading...</span>
        </div>
      </header>
    );
  }

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src="/kairos-logo.svg" alt="Kairos Logo" className={styles.logoIcon} />
        <h1>Kairos</h1>
      </div>
      <div className={styles.dateDisplay}>{displayDate}</div>

      {/* 5. Conditionally render the user section based on authentication status */}
      {isAuthenticated && user ? (
        // --- LOGGED-IN VIEW ---
        <div className={styles.userSection}>
          <img src={user.avatarurl} alt={user.username} className={styles.avatar} />
          <span>{user.username}</span>
          <IoNotificationsOutline size={24} className={styles.icon} />
          <Link to="/settings" className={styles.iconLink}>
             <IoSettingsOutline size={24} className={styles.icon} />
          </Link>
          <button onClick={logout} className={styles.logoutButton} title="Logout">
            <IoLogOutOutline size={24} />
          </button>
        </div>
      ) : (
        // --- GUEST VIEW ---
        <div className={styles.userSection}>
          <Link to="/login" className={styles.loginLink}>Login</Link>
        </div>
      )}
    </header>
  );
};

export default Header;