import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [progressMap, setProgressMap] = useState({}); // { courseId: seconds }
  const [unlockThreshold, setUnlockThreshold] = useState(120);
  const [loading, setLoading] = useState(true);

  // Local catalog to render titles/images
  const courseCatalog = {
    1: { id: 1, title: 'Introduction to Programming', image: 'https://via.placeholder.com/300x180?text=Programming+Basics' },
    2: { id: 2, title: 'Web Development Fundamentals', image: 'https://via.placeholder.com/300x180?text=Web+Development' },
    3: { id: 3, title: 'Database Design', image: 'https://via.placeholder.com/300x180?text=Database+Design' },
    4: { id: 4, title: 'Mobile App Development', image: 'https://via.placeholder.com/300x180?text=Mobile+Development' },
    5: { id: 5, title: 'Machine Learning Basics', image: 'https://via.placeholder.com/300x180?text=Machine+Learning' },
    6: { id: 6, title: 'Cloud Computing', image: 'https://via.placeholder.com/300x180?text=Cloud+Computing' },
    7: { id: 7, title: 'Cybersecurity Essentials', image: 'https://via.placeholder.com/300x180?text=Cybersecurity' },
    8: { id: 8, title: 'Data Structures and Algorithms', image: 'https://via.placeholder.com/300x180?text=DS+and+Algorithms' },
    9: { id: 9, title: 'DevOps Practices', image: 'https://via.placeholder.com/300x180?text=DevOps' }
  };

  useEffect(() => {
    const init = async () => {
      try {
        // ensure auth header from localStorage (in case not set globally)
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['x-auth-token'] = token;
        }

        const [progressRes, settingRes] = await Promise.all([
          axios.get('/api/courses/progress'),
          axios.get('/api/settings/unlock-threshold')
        ]);

        setProgressMap(progressRes.data || {});
        const value = Number(settingRes.data?.value);
        if (Number.isFinite(value)) setUnlockThreshold(value);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (!user || loading) {
    return <div className="loading">Loading...</div>;
  }

  // Build list of courses the user has watched (duration > 0)
  const watchedCourses = Object.entries(progressMap)
    .filter(([_, seconds]) => Number(seconds) > 0)
    .map(([courseIdStr, seconds]) => {
      const courseId = Number(courseIdStr);
      const catalog = courseCatalog[courseId] || { id: courseId, title: `Course ${courseId}`, image: 'https://via.placeholder.com/300x180?text=Course' };
      const threshold = Number(unlockThreshold);
      const pct = threshold > 0 ? Math.min(100, Math.round((Number(seconds) / threshold) * 100)) : 100;
      return {
        id: catalog.id,
        title: catalog.title,
        image: catalog.image,
        watchedSeconds: Number(seconds),
        thresholdSeconds: threshold,
        percent: pct
      };
    })
    .sort((a, b) => a.id - b.id);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-welcome">Welcome, {user.name}</h1>
      
      <div className="dashboard-card">
        <h2>Your Profile</h2>
        <div className="dashboard-info">
          {user && (
            <div className="user-info-group">
              <p className="info-label">Name:</p>
              <p className="info-value">{user.name}</p>
            </div>
          )}
          {user && (
            <div className="user-info-group">
              <p className="info-label">Email:</p>
              <p className="info-value">{user.email}</p>
            </div>
          )}
          <div className="info-item">
            <p className="info-label">Registered:</p>
            <p className="info-value">
              {new Date(user.dateCreated).toLocaleDateString()}
            </p>
          </div>
        </div>
        
      </div>

      <div className="dashboard-card mt-4">
        <h2>Your Course Progress</h2>
        {watchedCourses.length > 0 ? (
          <div className="enrolled-courses">
            {watchedCourses.map(course => (
              <div key={course.id} className="enrolled-course-item">
                <div className="course-image-small">
                  <img src={course.image} alt={course.title} />
                </div>
                <div className="course-details">
                  <h3>{course.title}</h3>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${course.percent}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{course.percent}% Complete ({course.watchedSeconds}s / {course.thresholdSeconds}s)</span>
                  </div>
                  <Link to={`/course/${course.id}`} className="btn btn-sm">
                    Continue Learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-courses">
            <p>No course activity yet.</p>
            <Link to="/" className="btn">Browse Courses</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 