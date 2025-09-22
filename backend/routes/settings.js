const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Setting = require('../models/Setting');

const UNLOCK_THRESHOLD_KEY = 'unlock_threshold_seconds';
const DEFAULT_UNLOCK_THRESHOLD = 120;

// Helper to get threshold (with default)
async function getUnlockThreshold() {
  const doc = await Setting.findOne({ key: UNLOCK_THRESHOLD_KEY });
  return doc ? Number(doc.value) : DEFAULT_UNLOCK_THRESHOLD;
}

// @route   GET /api/settings/unlock-threshold
// @desc    Get current unlock threshold in seconds
// @access  Private (any authenticated user can read)
router.get('/unlock-threshold', auth, async (req, res) => {
  try {
    const threshold = await getUnlockThreshold();
    res.json({ key: UNLOCK_THRESHOLD_KEY, value: threshold });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT /api/settings/unlock-threshold
// @desc    Update unlock threshold in seconds (admin only)
// @access  Private/Admin
router.put('/unlock-threshold', auth, admin, async (req, res) => {
  try {
    const { value } = req.body;
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) {
      return res.status(400).json({ msg: 'Invalid threshold. Must be a non-negative number of seconds.' });
    }

    let doc = await Setting.findOne({ key: UNLOCK_THRESHOLD_KEY });
    if (!doc) {
      doc = new Setting({ key: UNLOCK_THRESHOLD_KEY, value: numeric });
    } else {
      doc.value = numeric;
    }
    await doc.save();

    res.json({ msg: 'Unlock threshold updated successfully', key: UNLOCK_THRESHOLD_KEY, value: numeric });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router; 