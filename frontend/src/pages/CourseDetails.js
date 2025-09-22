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
  const [courseList, setCourseList] = useState([]);
  const courseId = String(id);

  // Check if the course is locked
  useEffect(() => {
    const checkCourseAccess = async () => {
      try {
        // Fetch ordered course list for previous-course check
        const listRes = await axios.get('/api/courses');
        const list = listRes.data || [];
        setCourseList(list);

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

        // First course in list is always accessible
        const index = list.findIndex(c => String(c.id) === String(courseId));
        if (index === 0) {
          setIsLocked(false);
        } else {
          // Check previous course time
          const progressRes = await axios.get('/api/courses/progress');
          const previousCourseId = index > 0 ? String(list[index - 1].id) : null;
          const previousCourseTime = previousCourseId ? Number(progressRes.data[previousCourseId] || 0) : 0;

          if (index > 0 && previousCourseTime < (Number.isFinite(unlockThreshold) ? unlockThreshold : 120)) {
            setIsLocked(true);
            alert(`This course is locked. You need to spend at least ${Number.isFinite(unlockThreshold) ? unlockThreshold : 120} seconds on the previous course to unlock it.`);
            navigate('/');
            return;
          } else {
            setIsLocked(false);
          }
        }
      } catch (error) {
        console.error('Error checking course access:', error);
        navigate('/');
      }
    };

    checkCourseAccess();
  }, [courseId, navigate, unlockThreshold]);

  // Function to record course visit time
  const recordVisitTime = async (duration) => {
    try {
      if (localStorage.getItem('token') && !isLocked) {
        await axios.post('/api/courses/time', { 
          courseId: courseId,
          duration: Math.round(duration)
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
      const timeStart = new Date();
      setStartTime(timeStart);

      const fetchCourseDetails = async () => {
        try {
          const res = await axios.get(`/api/courses/${courseId}`);
          setCourse(res.data);
          setLoading(false);
        } catch (err) {
          setCourse({ title: 'Course Not Found', content: '<p>The requested course could not be found.</p>' });
          setLoading(false);
        }
      };

      fetchCourseDetails();

      return () => {
        const timeEnd = new Date();
        const durationInSeconds = (timeEnd - timeStart) / 1000;
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
          <h2>{course?.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: course?.content || '' }} />
        </div>
      </div>
    </div>
  );
};

export default CourseDetails; 