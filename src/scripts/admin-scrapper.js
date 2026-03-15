// scripts/admin-scraper.js
require('dotenv').config();
const axios = require('axios');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const db = require('../config/db'); // Adjust path to your DB config

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY; 

async function autoFetchAndUpload(category, numberOfImages = 10) {
    console.log(`🚀 Starting automated fetch for category: ${category}`);
    
    const region = process.env.AWS_REGION;
    const bucket = process.env.AWS_BUCKET_NAME;
    const client = await db.connect();

    try {
        // 1. Ask Unsplash for image data
        const searchUrl = `https://api.unsplash.com/search/photos?query=${category}&per_page=${numberOfImages}&orientation=portrait`;
        const { data } = await axios.get(searchUrl, {
            headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
        });

        const photos = data.results;
        
        if (photos.length === 0) {
            console.log("No images found for this category.");
            return;
        }

        console.log(`Found ${photos.length} images. Downloading and streaming to AWS...`);

        await client.query('BEGIN');

        // 2. Loop through the results ONE BY ONE (Saves EC2 Memory!)
        for (const photo of photos) {
            const title = photo.alt_description || `${category} wallpaper`;
            const fileKey = `originals/${Date.now()}_unsplash_${photo.id}.jpg`;

            console.log(`⬇️ Fetching: ${title}`);

            // 3. Download the actual image binary directly to RAM
            // Using arraybuffer is CRITICAL so the image doesn't corrupt
            const imageResponse = await axios.get(photo.urls.regular, { 
                responseType: 'arraybuffer' 
            });

            // 4. Push directly to S3
            const putCommand = new PutObjectCommand({
                Bucket: bucket,
                Key: fileKey,
                Body: imageResponse.data,
                ContentType: 'image/jpeg'
            });
            await s3Client.send(putCommand);

            // 5. Save to RDS Database
            const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${fileKey}`;
            const insertQuery = `
                INSERT INTO wallpapers (title, category, image_url) 
                VALUES ($1, $2, $3)
            `;
            await client.query(insertQuery, [title, category, publicUrl]);
            
            console.log(`✅ Successfully stored: ${fileKey}`);
        }

        await client.query('COMMIT');
        console.log('🎉 Automation complete! All images processed and saved.');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("❌ Automation Error:", error.message);
    } finally {
        client.release();
    }
}

// Execute the script
// We can easily change this to "cars", "minimalist", etc.
autoFetchAndUpload('technology', 10);