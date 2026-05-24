// backend/src/controllers/saved-tracks.controller.js
const { pool } = require("../config/database.js");
const fs = require('fs');
const path = require('path');

const createTrack = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, youtube_id, navidrome_id, source_type = 'youtube', metadata } = req.body;
        const file = req.file; // set by multer if uploading

        if (!title) {
            return res.status(400).json({ message: "Title is required." });
        }

        // Determine source type and validate
        let finalSourceType = source_type;
        let finalYoutubeId = null;
        let finalNavidromeId = null;
        let filePath = null;

        if (file) {
            finalSourceType = 'upload';
            filePath = `/uploads/${file.filename}`;
        } else if (navidrome_id) {
            finalSourceType = 'navidrome';
            finalNavidromeId = navidrome_id;
        } else if (youtube_id) {
            finalSourceType = 'youtube';
            finalYoutubeId = youtube_id;
        } else {
            return res.status(400).json({ message: "A YouTube ID, Navidrome ID, or audio file is required." });
        }

        const query = `
            INSERT INTO saved_tracks (user_id, title, youtube_id, navidrome_id, file_path, source_type, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const results = await pool.query(query, [
            userId,
            title,
            finalYoutubeId,
            finalNavidromeId,
            filePath,
            finalSourceType,
            metadata ? JSON.stringify(metadata) : null
        ]);
        res.status(201).json(results.rows[0]);
    } catch (error) {
        console.error("Error saving track:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getTracks = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `SELECT * FROM saved_tracks WHERE user_id = $1 ORDER BY created_at DESC`;
        const results = await pool.query(query, [userId]);
        res.status(200).json(results.rows);
    } catch (error) {
        console.error("Error fetching tracks:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const deleteTrack = async (req, res) => {
    try {
        const userId = req.user.id;
        const trackId = parseInt(req.params.id);

        // Fetch file_path before deleting so we can clean up the file
        const fetchQuery = `SELECT file_path FROM saved_tracks WHERE id = $1 AND user_id = $2`;
        const fetchResult = await pool.query(fetchQuery, [trackId, userId]);

        if (fetchResult.rows.length === 0) {
            return res.status(404).json({ message: "Track not found or permission denied." });
        }

        const { file_path } = fetchResult.rows[0];

        await pool.query(`DELETE FROM saved_tracks WHERE id = $1 AND user_id = $2`, [trackId, userId]);

        // Remove the file from disk if it exists
        if (file_path) {
            const absPath = path.join(__dirname, '../../uploads', path.basename(file_path));
            fs.unlink(absPath, (err) => {
                if (err) console.warn("Could not delete audio file:", err.message);
            });
        }

        res.status(200).json({ message: "Track deleted." });
    } catch (error) {
        console.error("Error deleting track:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { createTrack, getTracks, deleteTrack };
