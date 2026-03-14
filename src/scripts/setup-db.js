// scripts/setup-db.js
require('dotenv').config();
const db = require('../config/db'); // Adjust path if needed

async function createTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS wallpapers (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            image_url TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        console.log("⏳ Connecting to database via tunnel...");
        await db.query(query);
        console.log("✅ Success: The 'wallpapers' table has been created!");
    } catch (error) {
        console.error("❌ Error creating table:", error);
    } finally {
        // End the pool so the script exits cleanly
        db.end(); 
    }
}

createTable();