import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from '../components/course/CourseCard';
import axios from 'axios';
import './Home.css';

const Home = () => {
  // Course data
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: 'Introduction to Programming',
      description: 'Learn the basics of programming with this introductory course. Perfect for beginners who want to start their coding journey.',
      image: 'https://via.placeholder.com/300x180?text=Programming+Basics'
    },
    {
      id: 2,
      title: 'Web Development Fundamentals',
      description: 'Discover the core concepts of web development including HTML, CSS, and JavaScript to build modern websites.',
      image: 'https://via.placeholder.com/300x180?text=Web+Development'
    },
    {
      id: 3,
      title: 'Database Design',
      description: 'Master the principles of database design and learn how to create efficient, normalized database structures.',
      image: 'https://via.placeholder.com/300x180?text=Database+Design'
    },
    {
      id: 4,
      title: 'Mobile App Development',
      description: 'Build cross-platform mobile applications using modern frameworks and best practices.',
      image: 'https://via.placeholder.com/300x180?text=Mobile+Development'
    },
    {
      id: 5,
      title: 'Machine Learning Basics',
      description: 'Explore the fundamentals of machine learning algorithms and their applications in real-world scenarios.',
      image: 'https://via.placeholder.com/300x180?text=Machine+Learning'
    },
    {
      id: 6,
      title: 'Cloud Computing',
      description: 'Learn how to leverage cloud platforms for scalable and resilient application deployment.',
      image: 'https://via.placeholder.com/300x180?text=Cloud+Computing'
    },
    {
      id: 7,
      title: 'Cybersecurity Essentials',
      description: 'Understand the core principles of cybersecurity and how to protect systems from common threats.',
      image: 'https://via.placeholder.com/300x180?text=Cybersecurity'
    },
    {
      id: 8,
      title: 'Data Structures and Algorithms',
      description: 'Master essential data structures and algorithms needed for efficient problem solving in programming.',
      image: 'https://via.placeholder.com/300x180?text=DS+and+Algorithms'
    },
    {
      id: 9,
      title: 'DevOps Practices',
      description: 'Learn modern DevOps methodologies to streamline software development and deployment processes.',
      image: 'https://via.placeholder.com/300x180?text=DevOps'
    }
  ]);

  const [courseProgress, setCourseProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated and fetch course progress
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        setIsAuthenticated(true);
        try {
          // Set auth header
          axios.defaults.headers.common['x-auth-token'] = token;
          
          // Fetch course progress
          const res = await axios.get('/api/courses/progress');
          setCourseProgress(res.data);
        } catch (error) {
          console.error('Error fetching course progress:', error);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Function to determine if a course is locked
  const isCourseLocked = (courseId) => {
    // Course 1 is always unlocked
    if (courseId === 1) return false;

    // If not authenticated, all courses except first are locked
    if (!isAuthenticated) return true;

    // Check if previous course has been studied for at least 2 minutes (120 seconds)
    const previousCourseId = courseId - 1;
    const previousCourseTime = courseProgress[previousCourseId] || 0;
    
    return previousCourseTime < 120; // 2 minutes in seconds
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to VARlabs</h1>
        <p>Explore our comprehensive tutorials to enhance your skills</p>
      </div>

      <div className="courses-section">
        <h2>Available Courses</h2>
        {!isAuthenticated && (
          <div className="course-note">
            <p><i className="fas fa-info-circle"></i> Please log in to unlock all courses. Course progression is sequential.</p>
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