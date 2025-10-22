import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from '../components/course/CourseCard';
import axios from 'axios';
import './Home.css';

const Home = () => {
  // Course data
  const [courses, setCourses] = useState([]);

  const [courseProgress, setCourseProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [unlockThreshold, setUnlockThreshold] = useState(120);

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch course list (public)
        const listRes = await axios.get('/api/courses');
        setCourses(listRes.data || []);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }

      // Auth-dependent data
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
        try {
          axios.defaults.headers.common['x-auth-token'] = token;
          const [progressRes, settingRes] = await Promise.all([
            axios.get('/api/courses/progress'),
            axios.get('/api/settings/unlock-threshold')
          ]);
          setCourseProgress(progressRes.data || {});
          const value = Number(settingRes.data?.value);
          if (Number.isFinite(value)) setUnlockThreshold(value);
        } catch (err) {
          console.error('Failed to fetch auth-dependent data:', err);
        }
      }
      setLoading(false);
    };

    init();
  }, []);

  // Function to determine if a course is locked
  const isCourseLocked = (courseId) => {
    if (!courses || courses.length === 0) return true;

    // Find index of this course in the list
    const index = courses.findIndex(c => String(c.id) === String(courseId));
    if (index <= 0) {
      // First course is always unlocked
      return false;
    }

    if (!isAuthenticated) return true;

    // Previous course by order
    const previousCourseId = String(courses[index - 1].id);
    const previousCourseTime = Number(courseProgress[previousCourseId] || 0);
    return previousCourseTime < Number(unlockThreshold);
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading lessons...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to VARlabs</h1>
        <p>Explore our comprehensive lessons to enhance your skills</p>
      </div>

      <div className="courses-section">
        <h2>Available Lessons</h2>
        {!isAuthenticated && (
          <div className="course-note">
            <p><i className="fas fa-info-circle"></i> Please log in to unlock all lessons. Lesson progression is sequential.</p>
          </div>
        )}
        <div className="courses-grid">
          {courses.map(course => (
            <div key={course.id} className="course-grid-item">
              <CourseCard 
                course={course} 
                isLocked={isCourseLocked(course.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 