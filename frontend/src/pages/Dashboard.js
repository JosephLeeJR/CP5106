import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [progressMap, setProgressMap] = useState({}); // { courseId: seconds }
  const [unlockThreshold, setUnlockThreshold] = useState(120);
  const [loading, setLoading] = useState(true);
  const [courseList, setCourseList] = useState([]); // fetched from backend

  useEffect(() => {
    const init = async () => {
      try {
        // Public: fetch courses list for titles/order
        const coursesRes = await axios.get('/api/courses');
        setCourseList(coursesRes.data || []);

        // ensure auth header from localStorage (in case not set globally)
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['x-auth-token'] = token;
        }

        const [progressRes, settingRes] = await Promise.all([
          axios.get('/api/courses/progress'),
          axios.get('/api/settings/unlock-threshold')
        ]).catch(async (err) => {
          // If unauthenticated, progress/settings may fail; handle gracefully
          try {
            const settingOnly = await axios.get('/api/settings/unlock-threshold');
            return [{ data: {} }, settingOnly];
          } catch {
            return [{ data: {} }, { data: { value: 120 } }];
          }
        });

        setProgressMap(progressRes?.data || {});
        const value = Number(settingRes?.data?.value);
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

  // Build course lookup and order map
  const courseById = new Map((courseList || []).map(c => [String(c.id), c]));
  const orderIndexById = new Map((courseList || []).map((c, idx) => [String(c.id), idx]));

  // Build list of courses the user has watched (duration > 0)
  const watchedCourses = Object.entries(progressMap)
    .filter(([_, seconds]) => Number(seconds) > 0)
    .map(([courseIdStr, seconds]) => {
      const c = courseById.get(String(courseIdStr));
      const fallbackTitle = `Lesson ${String(courseIdStr).slice(0, 6)}`;
      const title = c?.title || fallbackTitle;
      const image = c?.image || 'https://via.placeholder.com/300x180?text=Lesson';
      const threshold = Number(unlockThreshold);
      const pct = threshold > 0 ? Math.min(100, Math.round((Number(seconds) / threshold) * 100)) : 100;
      return {
        id: String(courseIdStr),
        order: orderIndexById.has(String(courseIdStr)) ? orderIndexById.get(String(courseIdStr)) : Number.MAX_SAFE_INTEGER,
        title,
        image,
        watchedSeconds: Number(seconds),
        thresholdSeconds: threshold,
        percent: pct
      };
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

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
        <h2>Your Lesson Progress</h2>
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
            <p>No lesson activity yet.</p>
            <Link to="/" className="btn">Browse Lessons</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 