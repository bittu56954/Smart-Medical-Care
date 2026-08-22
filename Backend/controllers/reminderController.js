import mongoose from 'mongoose';
import Reminder from '../models/Reminder.js';

// @desc    Get Reminders for Logged in User
// @route   GET /api/reminders
// @access  Private
export const getReminders = async (req, res) => {
  try {
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
    res.status(500).json({ success: false, message: error.message || 'Error fetching reminders.' });
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

    const reminder = await Reminder.create({
      user: req.user._id,
      medicineName,
      reminderDate,
      reminderType: reminderType || 'expiry',
      notes: notes || '',
      status
    });

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully!',
      reminder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error creating reminder.' });
  }
};

// @desc    Update Reminder status or details
// @route   PUT /api/reminders/:id
// @access  Private
export const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder updated.',
      reminder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error updating reminder.' });
  }
};

// @desc    Delete Reminder
// @route   DELETE /api/reminders/:id
// @access  Private
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder removed successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error removing reminder.' });
  }
};
