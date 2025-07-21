import React from 'react';
import { Link } from 'react-router-dom';
import './CourseCard.css';

const CourseCard = ({ course }) => {
  return (
    <div className="course-card">
      <div className="course-image">
        <img src={course.image} alt={course.title} />
      </div>
      <div className="course-content">
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <div className="course-btn-container">
          <Link to={`/course/${course.id}`} className="btn course-btn">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard; 