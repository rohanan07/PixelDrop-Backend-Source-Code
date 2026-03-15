// src/controllers/wallpaperController.js
const db = require('../config/db');
const s3Client = require('../config/aws');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// TODO: Add this to your .env file: CLOUDFRONT_DOMAIN=https://d1234abcd.cloudfront.net
// For now, replace the string below with your actual CloudFront Domain from the AWS Console
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || 'https://d67i7v1o5jrsn.cloudfront.net';

// 1. Get All Wallpapers (Optimized for CloudFront)
exports.getAllWallpapers = async (req, res) => {
    try {
        // Query the PostgreSQL database
        const result = await db.query('SELECT * FROM wallpapers ORDER BY created_at DESC');
        
        // Transform the data to use CloudFront URLs
        const optimizedWallpapers = result.rows.map(wallpaper => {
            // Logic: The DB has "https://bucket.s3.../originals/image.jpg"
            // We need to extract "image.jpg" and create CloudFront links.
            
            let originalUrl = wallpaper.image_url;
            let filename = '';
            
            // Safety check: ensure image_url exists
            if (originalUrl) {
                filename = originalUrl.split('/').pop(); // Extracts "173468_myimage.jpg"
            }

            // Get the name without extension for the WebP thumbnail (e.g., "173468_myimage")
            const filenameNoExt = filename.split('.')[0];

            return {
                ...wallpaper, // Keep id, title, category, etc.
                
                // 1. FAST: The WebP Thumbnail (Served from CloudFront 'thumbnails/' folder)
                thumbnailUrl: filename ? `${CLOUDFRONT_DOMAIN}/thumbnails/${filenameNoExt}.webp` : null,
                
                // 2. HIGH-RES: The Original Image (Served from CloudFront 'originals/' folder)
                fullUrl: filename ? `${CLOUDFRONT_DOMAIN}/originals/${filename}` : null,
                
                // Keep the old S3 URL just in case, but you should prefer the ones above
                s3Url: originalUrl
            };
        });

        // Return success response with OPTIMIZED data
        res.status(200).json({
            success: true,
            count: optimizedWallpapers.length,
            data: optimizedWallpapers 
        });
    } catch (error) {
        console.error("❌ Database Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server Error: Could not fetch wallpapers" 
        });
    }
};

// 2. Generate Upload URL
exports.generateUploadUrl = async (req, res) => {
    try {
        const { fileName, fileType } = req.body; // e.g., "image/jpeg"

        if (!fileName || !fileType) {
            return res.status(400).json({ success: false, message: "File name and type required" });
        }

        // --- CRITICAL CHANGE HERE ---
        // Changed folder from 'raw/' to 'originals/' 
        // This ensures your Lambda Trigger actually fires!
        const key = `originals/${Date.now()}_${fileName}`; 

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key, 
            ContentType: fileType
        };

        const command = new PutObjectCommand(params);
        
        // Generate a URL valid for 60 seconds
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

        res.status(200).json({
            success: true,
            uploadUrl: uploadUrl,            // Use this to PUT the file
            fileKey: params.Key              // Save this in your DB later
        });

    } catch (error) {
        console.error("AWS Error:", error);
        res.status(500).json({ success: false, message: "Could not generate upload URL" });
    }
};


// 3. Save Wallpaper to Database
exports.createWallpaper = async (req, res) => {
    try {
        const { title, category, fileKey } = req.body;

        if (!title || !fileKey) {
            return res.status(400).json({ success: false, message: "Title and File Key are required" });
        }

        // Construct the public S3 URL for storage
        // (We store the S3 URL as a backup/reference, but serve CloudFront URLs in GET)
        const region = process.env.AWS_REGION;
        const bucket = process.env.AWS_BUCKET_NAME;
        const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${fileKey}`;

        // Insert into PostgreSQL
        const query = `
            INSERT INTO wallpapers (title, category, image_url) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `;
        const values = [title, category || 'Uncategorized', publicUrl];

        const result = await db.query(query, values);

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ success: false, message: "Could not save wallpaper" });
    }
};