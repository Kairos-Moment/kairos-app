// frontend/src/components/dashboard/BottomNav.jsx
import React from 'react';
import styles from './BottomNav.module.css';
import { IoGridOutline, IoGolfOutline, IoSyncOutline, IoBarChartOutline, IoSettingsOutline } from 'react-icons/io5';

const navItems = [
    { icon: <IoGridOutline />, label: 'Today' },
    { icon: <IoGolfOutline />, label: 'Goals' },
    { icon: <IoSyncOutline />, label: 'Habits' },
    { icon: <IoBarChartOutline />, label: 'Insights' },
    { icon: <IoSettingsOutline />, label: 'Settings' },
];

const BottomNav = () => {
    return (
        <nav className={styles.bottomNav}>
            {navItems.map((item, index) => (
                <div key={index} className={`${styles.navItem} ${item.label === 'Today' ? styles.active : ''}`}>
                    {item.icon}
                    <span>{item.label}</span>
                </div>
            ))}
        </nav>
    );
};

export default BottomNav;