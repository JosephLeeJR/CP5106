import React from 'react';
import { Link } from 'react-router-dom';
import './CourseCard.css';

const CourseCard = ({ course, isLocked }) => {
  return (
    <div className={`course-card ${isLocked ? 'locked-course' : ''}`}>
      <div className="course-image">
        <img src={course.image} alt={course.title} />
        {isLocked && (
          <div className="course-lock-overlay">
            <i className="fas fa-lock"></i>
          </div>
        )}
      </div>
      <div className="course-content">
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <div className="course-btn-container">
          {isLocked ? (
            <button disabled className="btn course-btn locked-btn">
              <i className="fas fa-lock"></i> Locked
            </button>
          ) : (
            <Link to={`/course/${course.id}`} className="btn course-btn">
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard; 