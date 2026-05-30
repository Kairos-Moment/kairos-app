// backend/src/routes/jellyfin.routes.js
const express = require('express');
const router = express.Router();
const jellyfinController = require('../controllers/jellyfin.controller');

router.get('/health', jellyfinController.checkHealth);
router.get('/search', jellyfinController.search);
router.get('/artists', jellyfinController.getArtists);
router.get('/artists/:id', jellyfinController.getArtist);
router.get('/albums/:id', jellyfinController.getAlbum);
router.get('/songs/:id', jellyfinController.getSong);
router.get('/songs/random', jellyfinController.getRandomSongs);
router.get('/cover/:id', jellyfinController.getCoverArt);
router.get('/stream/:id', jellyfinController.getStreamUrl);
router.get('/stream/proxy/:id', jellyfinController.streamProxy);

module.exports = router;
