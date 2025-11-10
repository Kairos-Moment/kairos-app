// frontend/src/components/dashboard/Timeline.jsx
import React from 'react';
import styles from './Timeline.module.css';
import TimelineItem from './TimelineItem';

const mockTasks = [
    { id: 1, hour: '09', type: 'Urgent Task', title: 'Finalize Project Proposal', description: 'Complete the final draft for stakeholder review and approval.', status: 'Due Today' },
    { id: 2, hour: '10', type: 'Calendar Event', title: 'Weekly Team Stand-up', description: 'Discuss progress, share updates, and address any blockers.', status: 'Upcoming' },
    { id: 3, hour: '12', type: 'Scheduled Task', title: 'Lunch with Mentor', description: 'Catch up with Sarah on career development and future goals.', status: 'Confirmed' },
    { id: 4, hour: '14', type: 'Urgent Task', title: 'Client Feedback Session', description: 'Address critical client feedback and plan next steps.', status: 'Due in 2 hours' },
    { id: 5, hour: '16', type: 'Calendar Event', title: 'One-on-One with Alex', description: 'Discuss performance, set new objectives, and provide feedback.', status: 'Upcoming' },
];

const Timeline = () => {
    return (
        <div className={styles.timelineContainer}>
            <h2>Today's Timeline</h2>
            <div className={styles.timeline}>
                {mockTasks.map(task => <TimelineItem key={task.id} {...task} />)}
            </div>
        </div>
    );
};

export default Timeline;