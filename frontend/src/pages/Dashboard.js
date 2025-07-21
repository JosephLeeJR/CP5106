import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-welcome">Welcome {user.name}</h1>
      
      <div className="dashboard-card">
        <h2>Your Information</h2>
        <div className="dashboard-info">
          <div className="info-item">
            <p className="info-label">Name:</p>
            <p className="info-value">{user.name}</p>
          </div>
          <div className="info-item">
            <p className="info-label">Email:</p>
            <p className="info-value">{user.email}</p>
          </div>
          <div className="info-item">
            <p className="info-label">Student ID:</p>
            <p className="info-value">{user.studentId}</p>
          </div>
          <div className="info-item">
            <p className="info-label">Registered:</p>
            <p className="info-value">
              {new Date(user.dateCreated).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="dashboard-actions">
          <Link to="/profile" className="btn">
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 