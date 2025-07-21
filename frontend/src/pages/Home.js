import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from '../components/course/CourseCard';
import './Home.css';

const Home = () => {
  // 模拟课程数据
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

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to VARlabs</h1>
        <p>Explore our comprehensive tutorials to enhance your skills</p>
      </div>

      <div className="courses-section">
        <h2>Available Courses</h2>
        <div className="courses-grid">
          {courses.map(course => (
            <div key={course.id} className="course-grid-item">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 