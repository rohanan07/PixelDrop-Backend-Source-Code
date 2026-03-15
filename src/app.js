// src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
// Import Routes
const wallpaperRoutes = require('./routes/wallpaperRoutes');

const app = express();

// --- Middleware ---
app.use(cors());              // Allow requests from Android/Web
app.use(express.json());      // Parse JSON bodies in requests

// --- Routes ---
app.use('/api', wallpaperRoutes);

// --- Health Check Endpoint ---
// AWS Load Balancers use this to check if the server is alive
app.get('/', (req, res) => {
    res.status(200).send('PixelDrop Backend is Healthy & Running Finally!');
});

db.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database Connection Failed:', err);
    } else {
        console.log('✅ Connected to PostgreSQL Database');
    }
});

// --- Start Server ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});