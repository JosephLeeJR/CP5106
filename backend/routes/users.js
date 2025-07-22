const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', auth, admin, usersController.getUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, usersController.getUserById);

module.exports = router; 