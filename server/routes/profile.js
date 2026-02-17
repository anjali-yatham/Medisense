const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const Prescription = require('../models/Prescription');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify token
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// GET user profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// UPDATE user profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { name, phone, age, bloodGroup, address, emergencyContact, familyMembers } = req.body;

    // Check if phone is being changed and if it's already taken by another user
    if (phone) {
      const existingPhone = await User.findOne({ phone, _id: { $ne: req.userId } });
      if (existingPhone) {
        return res.status(400).json({ message: 'Phone number already in use by another user' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (age !== undefined) updateData.age = age;
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
    if (address !== undefined) updateData.address = address;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;
    if (familyMembers !== undefined) updateData.familyMembers = familyMembers;

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// DELETE user account
router.delete('/', authMiddleware, async (req, res) => {
  try {
    // Delete user's medicines
    await Medicine.deleteMany({ userId: req.userId });
    
    // Delete user's prescriptions
    await Prescription.deleteMany({ userId: req.userId });
    
    // Delete user
    const user = await User.findByIdAndDelete(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Error deleting account', error: error.message });
  }
});

module.exports = router;
