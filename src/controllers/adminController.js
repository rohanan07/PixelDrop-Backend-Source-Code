// src/controllers/adminController.js
const db = require('../config/db');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = new S3Client({ region: process.env.AWS_REGION });

exports.bulkUploadWallpapers = async (req, res) => {
    // 1. Validate the request
    const { category } = req.body;
    const files = req.files; // Populated by multer

    if (!category) {
        return res.status(400).json({ success: false, message: "Category is required" });
    }
    if (!files || files.length === 0) {
        return res.status(400).json({ success: false, message: "No images provided" });
    }

    const region = process.env.AWS_REGION;
    const bucket = process.env.AWS_BUCKET_NAME;
    const uploadedRecords = [];

    // Start a PostgreSQL Transaction
    const client = await db.connect();
    
    try {
        await client.query('BEGIN'); // Start transaction

        // 2. Loop through all uploaded files
        for (const file of files) {
            // Clean the filename and create the S3 Key (must go to 'originals/' for Lambda to fire)
            const cleanFileName = file.originalname.replace(/\s+/g, '_');
            const fileKey = `originals/${Date.now()}_${cleanFileName}`;
            
            // Generate a title based on the filename (e.g., "dark_knight.jpg" -> "dark knight")
            const title = cleanFileName.split('.')[0].replace(/_/g, ' ');

            // 3. Upload to S3
            const putCommand = new PutObjectCommand({
                Bucket: bucket,
                Key: fileKey,
                Body: file.buffer, // multer stores the file in memory
                ContentType: file.mimetype
            });
            await s3Client.send(putCommand);

            // 4. Save metadata to Database
            const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${fileKey}`;
            const insertQuery = `
                INSERT INTO wallpapers (title, category, image_url) 
                VALUES ($1, $2, $3) RETURNING id, title, category
            `;
            const result = await client.query(insertQuery, [title, category, publicUrl]);
            
            uploadedRecords.push(result.rows[0]);
        }

        await client.query('COMMIT'); // Commit transaction if all succeeded

        res.status(201).json({
            success: true,
            message: `Successfully uploaded ${uploadedRecords.length} wallpapers to ${category}`,
            data: uploadedRecords
        });

    } catch (error) {
        await client.query('ROLLBACK'); // Undo any DB inserts if AWS or DB fails
        console.error("Admin Bulk Upload Error:", error);
        res.status(500).json({ success: false, message: "Bulk upload failed, rolled back." });
    } finally {
        client.release(); // Return connection to the pool
    }
};