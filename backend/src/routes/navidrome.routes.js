// backend/src/routes/navidrome.routes.js
const express = require('express');
const router = express.Router();
const navidromeController = require('../controllers/navidrome.controller');

// Health check
router.get('/health', navidromeController.checkHealth);

// Search
router.get('/search', navidromeController.search);

// Artists
router.get('/artists', navidromeController.getArtists);
router.get('/artists/:id', navidromeController.getArtist);

// Albums
router.get('/albums/:id', navidromeController.getAlbum);

// Songs
router.get('/songs/:id', navidromeController.getSong);
router.get('/songs/random', navidromeController.getRandomSongs);

// Playlists
router.get('/playlists', navidromeController.getPlaylists);
router.get('/playlists/:id', navidromeController.getPlaylist);

// Media URLs
router.get('/cover/:id', navidromeController.getCoverArt);
router.get('/stream/:id', navidromeController.getStreamUrl);
// Proxy streaming endpoint to avoid CORS and attach auth server-side
router.get('/stream/proxy/:id', navidromeController.streamProxy);

module.exports = router;
