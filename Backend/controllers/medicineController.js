import mongoose from 'mongoose';
import Medicine from '../models/Medicine.js';
import ScanHistory from '../models/ScanHistory.js';
import { processMedicineImage } from '../utils/ocrService.js';

// @desc    Scan Medicine Image / OCR analysis
// @route   POST /api/medicines/scan
// @access  Private
export const scanMedicine = async (req, res) => {
  try {
    let imageInput = null;
    let imageName = 'scanned_medicine.jpg';
    let presetKey = req.body.presetKey || null;

    if (req.file) {
      imageInput = req.file.path || req.file.buffer;
      imageName = req.file.originalname;
    }
    let fallbackText = req.body.imageText || req.body.manualQuery || req.body.presetKey || '';

    if (!imageInput && !presetKey && !fallbackText) {
      return res.status(400).json({ success: false, message: 'Please upload an image file, capture a photo, or enter a medicine name.' });
    }

    // Process OCR extraction and verified database matching
    const scanResult = await processMedicineImage(imageInput, presetKey, imageName, fallbackText);

    let historyId = 'sh_' + Date.now();
    try {
      const historyEntry = await ScanHistory.create({
        user: req.user ? req.user._id : null,
        imageName: imageName,
        imageUrl: req.file && req.file.filename ? `/uploads/${req.file.filename}` : '',
        rawExtractedText: scanResult.rawText || '',
        status: scanResult.identified ? 'identified' : 'unidentified',
        confidenceScore: scanResult.confidence || 0,
        identifiedMedicine: scanResult.identified ? scanResult.details : {}
      });
      historyId = historyEntry._id;
    } catch (dbErr) {
      console.warn('[MEDISCAN DB SCAN HISTORY WARN]', dbErr.message);
    }

    if (!scanResult.identified) {
      return res.status(200).json({
        success: true,
        identified: false,
        message: 'Medicine could not be identified',
        scanHistoryId: historyId,
        rawText: scanResult.rawText,
        confidence: scanResult.confidence
      });
    }

    res.status(200).json({
      success: true,
      identified: true,
      message: scanResult.message,
      scanHistoryId: historyId,
      confidence: scanResult.confidence,
      medicine: scanResult.details
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save Identified Medicine to User's "My Medicines"
// @route   POST /api/medicines/save
// @access  Private
export const saveMedicine = async (req, res) => {
  try {
    const {
      name,
      genericName,
      strength,
      drugClass,
      manufacturer,
      batchNumber,
      mfgDate,
      expDate,
      uses,
      problemsTreated,
      mechanism,
      dosageInfo,
      sideEffects,
      precautions,
      storage,
      warnings,
      scannedImage,
      notes
    } = req.body;

    if (!name || !expDate) {
      return res.status(400).json({ success: false, message: 'Medicine name and expiry date are required.' });
    }

    // Calculate expiry status
    const expObj = new Date(expDate);
    const now = new Date();
    let initialStatus = 'valid';
    if (!isNaN(expObj.getTime())) {
      const diffDays = Math.ceil((expObj - now) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) initialStatus = 'expired';
      else if (diffDays <= 30) initialStatus = 'expiring_soon';
    }

    const medicine = await Medicine.create({
      user: req.user._id,
      name,
      genericName: genericName || 'Not specified',
      strength: strength || 'N/A',
      drugClass: drugClass || 'Pharmaceutical Agent',
      manufacturer: manufacturer || 'Unknown Manufacturer',
      batchNumber: batchNumber || 'N/A',
      mfgDate: mfgDate || '',
      expDate,
      status: initialStatus,
      uses: Array.isArray(uses) ? uses : uses ? [uses] : [],
      problemsTreated: Array.isArray(problemsTreated) ? problemsTreated : [],
      mechanism: mechanism || '',
      dosageInfo: dosageInfo || '',
      sideEffects: Array.isArray(sideEffects) ? sideEffects : sideEffects ? [sideEffects] : [],
      precautions: Array.isArray(precautions) ? precautions : precautions ? [precautions] : [],
      storage: storage || 'Store in a cool, dry place away from direct sunlight.',
      warnings: Array.isArray(warnings) ? warnings : warnings ? [warnings] : [],
      scannedImage: scannedImage || '',
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Medicine saved to My Medicines successfully!',
      medicine
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Saved Medicines for Logged In User
// @route   GET /api/medicines
// @access  Private
export const getUserMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Recalculate status for each medicine dynamically
    const updatedMedicines = medicines.map((med) => {
      med.calculateStatus();
      return med;
    });

    res.status(200).json({
      success: true,
      count: updatedMedicines.length,
      medicines: updatedMedicines
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching user medicines.' });
  }
};

// @desc    Get Single Medicine Details
// @route   GET /api/medicines/:id
// @access  Private
export const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findOne({ _id: req.params.id, user: req.user._id });
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }
    medicine.calculateStatus();

    res.status(200).json({
      success: true,
      medicine
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Medicine
// @route   PUT /api/medicines/:id
// @access  Private
export const updateMedicine = async (req, res) => {
  try {
    let medicine = await Medicine.findOne({ _id: req.params.id, user: req.user._id });
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    medicine.calculateStatus();

    res.status(200).json({
      success: true,
      message: 'Medicine details updated.',
      medicine
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Medicine
// @route   DELETE /api/medicines/:id
// @access  Private
export const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Medicine deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
