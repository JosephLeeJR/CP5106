const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const CourseTime = require('../models/CourseTime');
const Course = require('../models/Course');

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

// New: DB-backed course list (public)
router.get('/', async (req, res) => {
  try {
    const list = await Course.find().sort({ order: 1, createdAt: 1 });
    res.json(list.map(c => ({
      id: c._id.toString(),
      title: c.title,
      description: c.description,
      image: c.image
    })));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// New: Admin-only create course
router.post('/', auth, async (req, res) => {
  try {
    // Check admin
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ msg: 'Not authorized to create courses' });
    }

    const { title, description, image, content } = req.body;
    if (!title || !description || !content) {
      return res.status(400).json({ msg: 'title, description and content are required' });
    }

    // Set order to end of list
    const maxOrderDoc = await Course.findOne().sort({ order: -1 });
    const nextOrder = maxOrderDoc ? (Number(maxOrderDoc.order) + 1) : 0;

    const course = new Course({ title, description, image, content, order: nextOrder });
    await course.save();
    res.status(201).json({ msg: 'Course created', id: course._id.toString() });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// New: Admin-only update course
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ msg: 'Not authorized to update courses' });
    }

    const { title, description, image, content } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    if (typeof title === 'string' && title.trim()) course.title = title.trim();
    if (typeof description === 'string' && description.trim()) course.description = description.trim();
    if (typeof image === 'string') course.image = image.trim();
    if (typeof content === 'string' && content.trim()) course.content = content;

    await course.save();
    res.json({ msg: 'Course updated', id: course._id.toString() });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// New: Admin-only bulk reorder
router.put('/reorder/bulk', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ msg: 'Not authorized to reorder courses' });
    }

    const { order } = req.body; // [{id, order}]
    if (!Array.isArray(order)) {
      return res.status(400).json({ msg: 'Invalid payload: order must be an array' });
    }

    // Validate ids exist
    const ids = order.map(o => o.id);
    const dbCourses = await Course.find({ _id: { $in: ids } }).select('_id');
    const dbIds = new Set(dbCourses.map(c => c._id.toString()));
    for (const o of order) {
      if (!dbIds.has(String(o.id))) {
        return res.status(400).json({ msg: `Unknown course id: ${o.id}` });
      }
    }

    // Apply updates
    const bulkOps = order.map(o => ({
      updateOne: {
        filter: { _id: o.id },
        update: { $set: { order: Number(o.order) } }
      }
    }));

    if (bulkOps.length > 0) {
      await Course.bulkWrite(bulkOps);
    }

    res.json({ msg: 'Course order updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

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

    // Make sure the course exists (check either legacy numeric or DB id)
    let courseName = undefined;
    if (courses[courseId]) {
      courseName = courses[courseId].title;
    } else {
      const dbCourse = await Course.findById(courseId).select('title');
      if (!dbCourse) {
        return res.status(404).json({ msg: 'Course not found' });
      }
      courseName = dbCourse.title;
    }
    
    // Find existing record or create new one
    let courseTime = await CourseTime.findOne({ 
      user: req.user.id,
      courseId: String(courseId)
    });
    
    if (!courseTime) {
      courseTime = new CourseTime({
        user: req.user.id,
        courseId: String(courseId),
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

// DB-backed course detail (public) - placed after specific routes to avoid conflicts
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    res.json({
      id: course._id.toString(),
      title: course.title,
      description: course.description,
      image: course.image,
      content: course.content,
      order: course.order
    });
  } catch (err) {
    console.error(err.message);
    res.status(404).json({ msg: 'Course not found' });
  }
});

module.exports = router; 