// __tests__/api.test.js
const request = require('supertest');
const express = require('express');

// We create a mock version of your app just for testing
const app = express();

// Mock route that mimics your actual wallpaper endpoint
app.get('/api/wallpapers', (req, res) => {
    res.status(200).json({
        success: true,
        data: [{ id: 1, title: 'Trekking', thumbnailUrl: '...' }]
    });
});

describe('PixelDrop API Testing', () => {
    it('should return 200 OK and a list of wallpapers', async () => {
        const response = await request(app).get('/api/wallpapers');
        
        // Assertions (The actual tests)
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBeTruthy();
    });

    it('should return 404 for an unknown route', async () => {
        const response = await request(app).get('/api/does-not-exist');
        expect(response.statusCode).toBe(404);
    });
});