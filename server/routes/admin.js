const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Update user type
router.put('/users/:userId/usertype', async (req, res) => {
  try {
    const { userId } = req.params;
    const { userType } = req.body;

    if (!['user', 'organisation'].includes(userType)) {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { userType },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      message: 'User type updated successfully',
      user 
    });
  } catch (error) {
    console.error('Error updating user type:', error);
    res.status(500).json({ message: 'Error updating user type', error: error.message });
  }
});

module.exports = router;
