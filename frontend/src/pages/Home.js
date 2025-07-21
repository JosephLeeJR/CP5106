import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to Student Management System</h1>
      <p>Register or login to access your student dashboard</p>
      <div className="home-buttons">
        <Link to="/register" className="btn">
          Register
        </Link>
        <Link to="/login" className="btn">
          Login
        </Link>
      </div>
    </div>
  );
};

export default Home; 