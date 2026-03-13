// src/routes/wallpaperRoutes.js
const express = require('express');
const router = express.Router();
const wallpaperController = require('../controllers/wallpaperController');

// Route: GET /api/wallpapers
// Purpose: Fetch list of all wallpapers from DB
router.get('/wallpapers', wallpaperController.getAllWallpapers);

// Route: POST /api/upload-url
// Purpose: Get a secure Pre-signed URL to upload files to S3
router.post('/upload-url', wallpaperController.generateUploadUrl);

// POST save metadata
router.post('/wallpapers', wallpaperController.createWallpaper);

module.exports = router;