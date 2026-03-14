// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminController = require('../controllers/adminController');

// Configure Multer to store files in RAM temporarily before pushing to S3
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 10 * 1024 * 1024 // 10MB limit per image
    }
});

// The endpoint accepts up to 50 images at once under the field name 'images'
router.post('/wallpapers/bulk', upload.array('images', 50), adminController.bulkUploadWallpapers);

module.exports = router;