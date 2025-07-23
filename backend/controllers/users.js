const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
}; 

// @desc    Batch upload allowlist (names and emails)
// @route   POST /api/users/allowlist
// @access  Private/Admin
const Allowlist = require('../models/Allowlist');
const multer = require('multer');
const upload = multer();

exports.uploadAllowlist = async (req, res) => {
  try {
    let content = '';
    if (req.file) {
      // File upload
      content = req.file.buffer.toString('utf-8');
    } else if (req.body.text) {
      // Text paste
      content = req.body.text;
    } else {
      return res.status(400).json({ msg: 'No data provided' });
    }

    // Parse content
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    const entries = lines.map(line => {
      const [name, email] = line.split(',').map(s => s.trim());
      return { name, email };
    }).filter(e => e.name && e.email);

    // Bulk upsert
    const bulkOps = entries.map(e => ({
      updateOne: {
        filter: { email: e.email },
        update: { $set: { name: e.name, email: e.email } },
        upsert: true
      }
    }));
    if (bulkOps.length === 0) {
      return res.status(400).json({ msg: 'No valid entries found' });
    }
    await Allowlist.bulkWrite(bulkOps);
    res.json({ msg: 'Allowlist uploaded', count: entries.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
}; 