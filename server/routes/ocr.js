const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const FormData = require('form-data');

// Auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId || decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * POST /api/ocr/extract
 * Extract text from prescription image using OCR.space API (Free)
 */
router.post('/extract', authMiddleware, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'No image provided' });
    }

    // OCR.space API key (free tier: 25,000 requests/month)
    const apiKey = process.env.OCR_SPACE_API_KEY || 'K87899142388957';

    // Remove data URL prefix if present
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

    // Make request to OCR.space API
    const fetch = (await import('node-fetch')).default;
    
    const formData = new FormData();
    formData.append('base64Image', `data:image/png;base64,${base64Image}`);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2'); // Engine 2 has better accuracy for handwriting

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
      },
      body: formData,
    });

    const data = await response.json();

    if (data.IsErroredOnProcessing) {
      console.error('OCR.space API Error:', data.ErrorMessage);
      return res.status(500).json({ 
        message: data.ErrorMessage?.[0] || 'Failed to process image',
        fallback: true 
      });
    }

    const extractedText = data.ParsedResults?.[0]?.ParsedText || '';

    res.json({
      success: true,
      text: extractedText,
    });
  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({ 
      message: 'Failed to extract text from image',
      error: error.message,
      fallback: true 
    });
  }
});

module.exports = router;
