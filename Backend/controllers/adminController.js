import mongoose from 'mongoose';
import User from '../models/User.js';
import Medicine from '../models/Medicine.js';
import ScanHistory from '../models/ScanHistory.js';
import Reminder from '../models/Reminder.js';

// @desc    Get Admin Dashboard Statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMedicines = await Medicine.countDocuments();
    const totalScans = await ScanHistory.countDocuments();
    const unidentifiedScans = await ScanHistory.countDocuments({ status: 'unidentified' });
    const expiredMedicines = await Medicine.countDocuments({ status: 'expired' });
    const activeReminders = await Reminder.countDocuments({ status: 'upcoming' });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalMedicines,
        totalScans,
        unidentifiedScans,
        expiredMedicines,
        activeReminders
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching admin statistics.'
    });
  }
};

// @desc    Get All Registered Users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching registered users.'
    });
  }
};

// @desc    Update User Role (user / admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}.`,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete User Account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Cascade delete user data
    await Medicine.deleteMany({ user: user._id });
    await ScanHistory.deleteMany({ user: user._id });
    await Reminder.deleteMany({ user: user._id });
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User account and associated data removed.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All System Medicines (Admin view)
// @route   GET /api/admin/medicines
// @access  Private/Admin
export const getAllMedicines = async (req, res) => {
  try {
    let medicines = [];
    try {
      medicines = await Medicine.find().populate('user', 'name email').sort({ createdAt: -1 });
    } catch (dbQueryErr) {
      medicines = await Medicine.find().sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: medicines.length,
      medicines: medicines || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching system medicines.'
    });
  }
};

// @desc    Get All Scan Logs (Audit view)
// @route   GET /api/admin/scans
// @access  Private/Admin
export const getAllScans = async (req, res) => {
  try {
    let scans = [];
    try {
      scans = await ScanHistory.find().populate('user', 'name email').sort({ scanDate: -1 });
    } catch (dbQueryErr) {
      scans = await ScanHistory.find().sort({ scanDate: -1 });
    }

    res.status(200).json({
      success: true,
      count: scans.length,
      scans: scans || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching scan audit logs.'
    });
  }
};
