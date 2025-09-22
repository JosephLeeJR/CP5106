import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CourseDetails.css';

const CourseDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [unlockThreshold, setUnlockThreshold] = useState(120);
  const courseId = parseInt(id);

  // Check if the course is locked
  useEffect(() => {
    const checkCourseAccess = async () => {
      try {
        // Course 1 is always accessible
        if (courseId === 1) {
          setIsLocked(false);
          return;
        }

        // Fetch unlock threshold (requires auth)
        try {
          const settingRes = await axios.get('/api/settings/unlock-threshold');
          const value = Number(settingRes.data?.value);
          if (Number.isFinite(value)) {
            setUnlockThreshold(value);
          }
        } catch (err) {
          console.error('Error fetching unlock threshold:', err);
        }

        // Check if previous course has been completed
        const res = await axios.get('/api/courses/progress');
        const previousCourseTime = res.data[courseId - 1] || 0;
        
        // If previous course time is less than threshold seconds, this course is locked
        if (previousCourseTime < (Number.isFinite(unlockThreshold) ? unlockThreshold : 120)) {
          setIsLocked(true);
          
          // Show alert and redirect to home
          alert(`This course is locked. You need to spend at least ${Number.isFinite(unlockThreshold) ? unlockThreshold : 120} seconds on Course ${courseId - 1} to unlock it.`);
          navigate('/');
        } else {
          setIsLocked(false);
        }
      } catch (error) {
        console.error('Error checking course access:', error);
        // On any error, redirect to home for safety
        navigate('/');
      }
    };

    checkCourseAccess();
  }, [courseId, navigate, unlockThreshold]);

  // Function to record course visit time
  const recordVisitTime = async (duration) => {
    try {
      // Only record if user is logged in (token exists) and course is not locked
      if (localStorage.getItem('token') && !isLocked) {
        await axios.post('/api/courses/time', { 
          courseId,
          duration: Math.round(duration) // Duration in seconds
        });
        console.log(`Recorded ${Math.round(duration)} seconds for course ${id}`);
      }
    } catch (error) {
      console.error('Failed to record course time:', error);
    }
  };

  useEffect(() => {
    // Only fetch course details and start timer if not locked
    if (!isLocked) {
      // Start the timer when the component mounts
      const timeStart = new Date();
      setStartTime(timeStart);

      // Fetch course details
      const fetchCourseDetails = () => {
        const courseDetails = {
          1: {
            title: 'Introduction to Programming',
            content: `
              <h2>Introduction to Programming</h2>
              
              <p>This comprehensive course provides a solid foundation in programming fundamentals that apply across various languages and platforms. Whether you're a complete beginner or looking to refresh your knowledge, this course will equip you with essential skills.</p>
              
              <h3>What You'll Learn:</h3>
              <ul>
                <li>Core programming concepts like variables, data types, and operators</li>
                <li>Control structures: conditionals, loops, and functions</li>
                <li>Basic algorithms and problem-solving techniques</li>
                <li>Introduction to object-oriented programming principles</li>
                <li>Fundamental data structures</li>
              </ul>
              
              <h3>Course Structure:</h3>
              <p>The course consists of 10 modules with hands-on exercises, coding challenges, and a final project where you'll build a functional application from scratch.</p>
              
              <h3>Prerequisites:</h3>
              <p>No prior programming experience required. Just bring your curiosity and willingness to learn!</p>
            `
          },
          2: {
            title: 'Web Development Fundamentals',
            content: `
              <h2>Web Development Fundamentals</h2>
              
              <p>Discover the essential technologies that power the modern web. This course provides a comprehensive introduction to front-end web development, teaching you how to create responsive, interactive websites.</p>
              
              <h3>What You'll Learn:</h3>
              <ul>
                <li>HTML5 for structuring web content</li>
                <li>CSS3 for styling and layouts</li>
                <li>JavaScript fundamentals for interactive websites</li>
                <li>Responsive design principles</li>
                <li>Web accessibility best practices</li>
                <li>Version control with Git</li>
              </ul>
              
              <h3>Course Structure:</h3>
              <p>This course features 12 modules with progressive projects that build on each other, culminating in a portfolio-ready website that showcases your skills.</p>
              
              <h3>Prerequisites:</h3>
              <p>Basic computer skills and familiarity with browsing the web. No coding experience required.</p>
            `
          },
          3: {
            title: 'Database Design',
            content: `
              <h2>Database Design</h2>
              
              <p>Master the art and science of database design with this in-depth course. Learn how to create efficient, scalable, and reliable database structures that can support complex applications.</p>
              
              <h3>What You'll Learn:</h3>
              <ul>
                <li>Relational database concepts and theory</li>
                <li>Entity-Relationship modeling</li>
                <li>Normalization techniques (1NF through BCNF)</li>
                <li>SQL for data definition, manipulation, and queries</li>
                <li>Indexing and optimization strategies</li>
                <li>Transaction management and concurrency control</li>
              </ul>
              
              <h3>Course Structure:</h3>
              <p>The course includes 8 comprehensive modules with case studies, practical exercises, and a capstone project where you'll design and implement a complete database system.</p>
              
              <h3>Prerequisites:</h3>
              <p>Basic understanding of data organization concepts. No specific database experience required.</p>
            `
          },
          4: {
            title: 'Mobile App Development',
            content: `
              <h2>Mobile App Development</h2>
              
              <p>Learn to build cross-platform mobile applications that work seamlessly on both iOS and Android. This course focuses on modern frameworks that allow you to write once and deploy everywhere.</p>
              
              <h3>What You'll Learn:</h3>
              <ul>
                <li>Cross-platform development fundamentals</li>
                <li>UI/UX design principles for mobile</li>
                <li>State management and data flow</li>
                <li>API integration and offline functionality</li>
                <li>Native device features (camera, GPS, notifications)</li>
                <li>App store deployment processes</li>
              </ul>
              
              <h3>Course Structure:</h3>
              <p>This hands-on course includes 10 modules with progressive app-building exercises, culminating in publishing a fully functional mobile application.</p>
              
              <h3>Prerequisites:</h3>
              <p>Basic programming knowledge in JavaScript or similar language. Familiarity with HTML/CSS is beneficial but not required.</p>
            `
          },
          5: {
            title: 'Machine Learning Basics',
            content: `
              <h2>Machine Learning Basics</h2>
              
              <p>Dive into the fascinating world of machine learning and artificial intelligence. This course demystifies complex ML concepts and teaches you how to build and deploy practical machine learning models.</p>
              
              <h3>What You'll Learn:</h3>
              <ul>
                <li>Supervised and unsupervised learning algorithms</li>
                <li>Data preprocessing and feature engineering</li>
                <li>Model training, validation, and evaluation</li>
                <li>Classification, regression, and clustering techniques</li>
                <li>Introduction to neural networks</li>
                <li>Ethical considerations in ML applications</li>
              </ul>
              
              <h3>Course Structure:</h3>
              <p>The course comprises 9 modules with practical exercises using popular ML libraries, real-world datasets, and a final project applying ML to solve a business problem.</p>
              
              <h3>Prerequisites:</h3>
              <p>Basic programming experience and fundamental statistics knowledge. Familiarity with Python is highly recommended.</p>
            `
          },
          6: {
            title: 'Cloud Computing',
            content: `
              <h2>Cloud Computing</h2>
              
              <p>Explore the power of cloud technologies and learn how to leverage cloud platforms for scalable, resilient, and cost-effective application deployment.</p>
              
              <h3>What You'll Learn:</h3>
              <ul>
                <li>Cloud service models (IaaS, PaaS, SaaS)</li>
                <li>Cloud deployment architectures</li>
                <li>Virtualization and containerization technologies</li>
                <li>Serverless computing paradigms</li>
                <li>Cloud security and compliance</li>
                <li>Cost optimization strategies</li>
              </ul>
              
              <h3>Course Structure:</h3>
              <p>This course includes 8 comprehensive modules with hands-on labs, infrastructure-as-code exercises, and a capstone project deploying a full-stack application to the cloud.</p>
              
              <h3>Prerequisites:</h3>
              <p>Basic understanding of networking concepts and some programming experience. Familiarity with Linux command line is beneficial.</p>
            `
          },
          7: {
            title: 'Cybersecurity Essentials',
            content: `
              <h2>Cybersecurity Essentials</h2>
              
              <p>Develop crucial cybersecurity skills to protect systems, networks, and data from digital threats. This course covers fundamental security concepts and practical defense techniques.</p>
              
              <h3>What You'll Learn:</h3>
              <ul>
                <li>Security principles and risk management</li>
                <li>Network security and monitoring</li>
                <li>Authentication and access control</li>
                <li>Common vulnerabilities and attack vectors</li>
                <li>Encryption and secure communication</li>
                <li>Incident response and recovery</li>
              </ul>
              
              <h3>Course Structure:</h3>
              <p>The course features 10 modules with practical labs, security simulations, and a comprehensive security assessment project for a sample organization.</p>
              
              <h3>Prerequisites:</h3>
              <p>Basic understanding of computer networks and operating systems. No specific security background required.</p>
            `
          },
          8: {
            title: 'Data Structures and Algorithms',
            content: `
              <h2>Data Structures and Algorithms</h2>
              
              <p>Master the fundamental building blocks of efficient software with this deep dive into data structures and algorithms. Learn how to write optimized code that can handle complex computational challenges.</p>
              
              <h3>What You'll Learn:</h3>
              <ul>
                <li>Array-based structures and linked lists</li>
                <li>Stacks, queues, and hash tables</li>
                <li>Trees, graphs, and their traversal algorithms</li>
                <li>Sorting and searching algorithms</li>
                <li>Algorithm analysis and Big O notation</li>
                <li>Problem-solving strategies and optimization techniques</li>
              </ul>
              
              <h3>Course Structure:</h3>
              <p>This rigorous course includes 12 modules with coding challenges, algorithm implementations, and competitive programming exercises to reinforce concepts.</p>
              
              <h3>Prerequisites:</h3>
              <p>Solid programming experience in at least one language. Understanding of basic mathematical concepts.</p>
            `
          },
          9: {
            title: 'DevOps Practices',
            content: `
              <h2>DevOps Practices</h2>
              
              <p>Bridge the gap between development and operations with modern DevOps methodologies. Learn how to streamline software delivery through automation, collaboration, and continuous improvement.</p>
              
              <h3>What You'll Learn:</h3>
              <ul>
                <li>Continuous Integration/Continuous Deployment (CI/CD)</li>
                <li>Infrastructure as Code (IaC)</li>
                <li>Configuration management and orchestration</li>
                <li>Monitoring, logging, and observability</li>
                <li>Microservices and containerization</li>
                <li>DevSecOps principles</li>
              </ul>
              
              <h3>Course Structure:</h3>
              <p>The course consists of 9 modules with hands-on labs implementing full DevOps pipelines and a capstone project automating the deployment of a complete application.</p>
              
              <h3>Prerequisites:</h3>
              <p>Basic knowledge of software development and system administration. Familiarity with command-line interfaces and version control.</p>
            `
          }
        };

        if (courseDetails[id]) {
          setCourse(courseDetails[id]);
        } else {
          setCourse({ title: 'Course Not Found', content: '<p>The requested course could not be found.</p>' });
        }
        setLoading(false);
      };

      fetchCourseDetails();

      // Cleanup function that runs when the component unmounts
      return () => {
        const timeEnd = new Date();
        const durationInSeconds = (timeEnd - timeStart) / 1000;
        
        // Only record time if the user spent at least 1 second on the page
        if (durationInSeconds >= 1) {
          recordVisitTime(durationInSeconds);
        }
      };
    }
  }, [id, isLocked]);

  // Record time when user navigates away but stays in the app
  useEffect(() => {
    const handleBeforeNavigate = () => {
      if (startTime && !isLocked) {
        const timeEnd = new Date();
        const durationInSeconds = (timeEnd - startTime) / 1000;
        
        if (durationInSeconds >= 1) {
          recordVisitTime(durationInSeconds);
        }
      }
    };

    // Listen for route changes within the app
    window.addEventListener('beforeunload', handleBeforeNavigate);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeNavigate);
    };
  }, [startTime, id, isLocked]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="course-details-container">
      <div className="course-details-content">
        <div className="course-back-button">
          <Link to="/" className="btn back-btn">← Back to Courses</Link>
        </div>
        
        <div className="course-details-body">
          <div dangerouslySetInnerHTML={{ __html: course.content }} />
        </div>
      </div>
    </div>
  );
};

export default CourseDetails; 