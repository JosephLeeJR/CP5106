import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  // 模拟已注册课程数据
  const [enrolledCourses, setEnrolledCourses] = useState([
    {
      id: 1,
      title: 'Introduction to Programming',
      progress: 30,
      image: 'https://via.placeholder.com/300x180?text=Programming+Basics'
    },
    {
      id: 3,
      title: 'Database Design',
      progress: 65,
      image: 'https://via.placeholder.com/300x180?text=Database+Design'
    },
    {
      id: 5,
      title: 'Machine Learning Basics',
      progress: 15,
      image: 'https://via.placeholder.com/300x180?text=Machine+Learning'
    }
  ]);

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

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
        <h2>Your Enrolled Courses</h2>
        {enrolledCourses.length > 0 ? (
          <div className="enrolled-courses">
            {enrolledCourses.map(course => (
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
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{course.progress}% Complete</span>
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
            <p>You are not enrolled in any courses yet.</p>
            <Link to="/" className="btn">Browse Courses</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 