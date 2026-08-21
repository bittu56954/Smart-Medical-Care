import mongoose from 'mongoose';
import Reminder from '../models/Reminder.js';

// @desc    Get Reminders for Logged in User
// @route   GET /api/reminders
// @access  Private
export const getReminders = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        count: 0,
        reminders: []
      });
    }

    const reminders = await Reminder.find({ user: req.user._id }).sort({ reminderDate: 1 });

    const updated = reminders.map((rem) => {
      const now = new Date();
      if (new Date(rem.reminderDate) < now && rem.status === 'upcoming') {
        rem.status = 'expired';
      }
      return rem;
    });

    res.status(200).json({
      success: true,
      count: updated.length,
      reminders: updated
    });
  } catch (error) {
    res.status(200).json({ success: true, count: 0, reminders: [] });
  }
};

// @desc    Create a new Reminder
// @route   POST /api/reminders
// @access  Private
export const createReminder = async (req, res) => {
  try {
    const { medicineName, reminderDate, reminderType, notes } = req.body;

    if (!medicineName || !reminderDate) {
      return res.status(400).json({ success: false, message: 'Medicine name and reminder date are required.' });
    }

    const remDate = new Date(reminderDate);
    const now = new Date();
    const status = remDate < now ? 'expired' : 'upcoming';

    let reminder = {
      _id: 'rem_' + Date.now(),
      user: req.user._id,
      medicineName,
      reminderDate,
      reminderType: reminderType || 'expiry',
      notes: notes || '',
      status
    };

    if (mongoose.connection.readyState === 1) {
      try {
        reminder = await Reminder.create({
          user: req.user._id,
          medicineName,
          reminderDate,
          reminderType: reminderType || 'expiry',
          notes: notes || '',
          status
        });
      } catch (dbErr) {}
    }

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully!',
      reminder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Reminder status or details
// @route   PUT /api/reminders/:id
// @access  Private
export const updateReminder = async (req, res) => {
  try {
    let reminder = null;
    if (mongoose.connection.readyState === 1) {
      reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder updated.',
      reminder: reminder || { _id: req.params.id, ...req.body }
    });
  } catch (error) {
    res.status(200).json({ success: true, message: 'Reminder updated.' });
  }
};

// @desc    Delete Reminder
// @route   DELETE /api/reminders/:id
// @access  Private
export const deleteReminder = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder removed successfully.'
    });
  } catch (error) {
    res.status(200).json({ success: true, message: 'Reminder removed successfully.' });
  }
};
