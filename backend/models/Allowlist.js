const mongoose = require('mongoose');

const AllowlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  year: {
    type: String,
    default: ''
  },
  semester: {
    type: Number,
    default: null
  },
  coursecode: {
    type: String,
    default: ''
  },
  dateAdded: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Allowlist', AllowlistSchema); 