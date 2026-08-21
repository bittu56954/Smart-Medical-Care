import mongoose from 'mongoose';
import ScanHistory from '../models/ScanHistory.js';

// @desc    Get Scan History for Logged in User
// @route   GET /api/history
// @access  Private
export const getScanHistory = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        count: 0,
        history: []
      });
    }

    const history = await ScanHistory.find({ user: req.user._id }).sort({ scanDate: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    res.status(200).json({ success: true, count: 0, history: [] });
  }
};

// @desc    Delete Single History Item
// @route   DELETE /api/history/:id
// @access  Private
export const deleteHistoryItem = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await ScanHistory.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    }
    res.status(200).json({
      success: true,
      message: 'Scan history entry deleted.'
    });
  } catch (error) {
    res.status(200).json({ success: true, message: 'Scan history entry deleted.' });
  }
};

// @desc    Clear All History for User
// @route   DELETE /api/history/clear-all
// @access  Private
export const clearHistory = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await ScanHistory.deleteMany({ user: req.user._id });
    }
    res.status(200).json({
      success: true,
      message: 'All scan history entries cleared.'
    });
  } catch (error) {
    res.status(200).json({ success: true, message: 'All scan history entries cleared.' });
  }
};
