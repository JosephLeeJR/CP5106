const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const CourseTime = require('../models/CourseTime');

// Mock course data - in a real app this would come from a database
const courses = {
  1: { id: 1, title: 'Introduction to Programming' },
  2: { id: 2, title: 'Web Development Fundamentals' },
  3: { id: 3, title: 'Database Design' },
  4: { id: 4, title: 'Mobile App Development' },
  5: { id: 5, title: 'Machine Learning Basics' },
  6: { id: 6, title: 'Cloud Computing' },
  7: { id: 7, title: 'Cybersecurity Essentials' },
  8: { id: 8, title: 'Data Structures and Algorithms' },
  9: { id: 9, title: 'DevOps Practices' },
};

// @route   GET api/courses/progress
// @desc    Get user's course progress for unlocking courses
// @access  Private
router.get('/progress', auth, async (req, res) => {
  try {
    // Get all course time records for the user
    const courseTimeRecords = await CourseTime.find({ user: req.user.id });
    
    // Convert to an object mapping courseId to duration
    const progressData = {};
    courseTimeRecords.forEach(record => {
      progressData[record.courseId] = record.duration;
    });
    
    res.json(progressData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/courses/time
// @desc    Record time spent on a course
// @access  Private
router.post('/time', auth, async (req, res) => {
  try {
    const { courseId, duration } = req.body;
    
    if (!courseId || !duration) {
      return res.status(400).json({ msg: 'Course ID and duration are required' });
    }

    // Make sure the course exists
    if (!courses[courseId]) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    const courseName = courses[courseId].title;
    
    // Find existing record or create new one
    let courseTime = await CourseTime.findOne({ 
      user: req.user.id,
      courseId: courseId
    });
    
    if (!courseTime) {
      courseTime = new CourseTime({
        user: req.user.id,
        courseId: courseId,
        courseName: courseName,
        duration: duration,
        visits: [{ duration: duration }],
        lastVisit: Date.now()
      });
    } else {
      // Update existing record
      courseTime.duration += duration;
      courseTime.visits.push({ duration: duration });
      courseTime.lastVisit = Date.now();
    }
    
    await courseTime.save();
    
    res.json({ msg: 'Course time recorded successfully' });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/courses/stats
// @desc    Get course time statistics (admin only)
// @access  Private/Admin
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if user is an admin
    const user = await User.findById(req.user.id);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ msg: 'Not authorized to access this resource' });
    }
    
    // Get all course time records
    const courseTimeRecords = await CourseTime.find().sort({ lastVisit: -1 });
    
    // Get user details for each record
    const statsWithUsers = await Promise.all(
      courseTimeRecords.map(async (record) => {
        const user = await User.findById(record.user);
        return {
          userName: user ? user.name : 'Unknown User',
          userEmail: user ? user.email : 'unknown@example.com',
          courseId: record.courseId,
          courseName: record.courseName,
          totalDuration: record.duration,
          visits: record.visits.length,
          lastVisit: record.lastVisit
        };
      })
    );
    
    res.json(statsWithUsers);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 