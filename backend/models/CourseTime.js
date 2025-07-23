const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseTimeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  duration: {
    type: Number,  // Duration in seconds
    default: 0
  },
  visits: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    duration: {
      type: Number,  // Duration in seconds
      required: true
    }
  }],
  lastVisit: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('courseTime', CourseTimeSchema); 