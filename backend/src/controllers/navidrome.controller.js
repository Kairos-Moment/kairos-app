// backend/src/controllers/navidrome.controller.js
const NavidromeService = require('../services/navidrome.service');

const navidromeService = new NavidromeService();

// Health check - test Navidrome connection
const checkHealth = async (req, res) => {
  try {
    const isAlive = await navidromeService.ping();
    if (!isAlive) {
      return res.status(503).json({ status: 'disconnected', error: 'Failed to connect to Navidrome' });
    }

    let info = null;
    try {
      info = await navidromeService.getSystemInfo();
    } catch (getInfoError) {
      console.warn('Navidrome getSystemInfo unavailable:', getInfoError.message);
    }

    const payload = { status: 'connected' };
    if (info) {
      payload.navidromeVersion = info.version;
      payload.apiVersion = info.apiVersion;
    }

    return res.status(200).json(payload);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ status: 'error', error: error.message });
  }
};

// Search for songs, artists, albums
const search = async (req, res) => {
  try {
    const { query, artistCount = 10, albumCount = 10, songCount = 25 } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await navidromeService.search(query, {
      artistCount: parseInt(artistCount),
      albumCount: parseInt(albumCount),
      songCount: parseInt(songCount),
    });

    res.json({
      artists: results.artist || [],
      albums: results.album || [],
      songs: results.song || [],
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
};

// Get song by ID
const getSong = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Song ID is required' });

    const song = await navidromeService.getSong(id);
    res.json(song);
  } catch (error) {
    console.error('Get song error:', error);
    res.status(500).json({ error: 'Failed to get song', details: error.message });
  }
};

// Get artist information
const getArtist = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Artist ID is required' });

    const artist = await navidromeService.getArtist(id);
    res.json(artist);
  } catch (error) {
    console.error('Get artist error:', error);
    res.status(500).json({ error: 'Failed to get artist', details: error.message });
  }
};

// Get album information
const getAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Album ID is required' });

    const album = await navidromeService.getAlbum(id);
    res.json(album);
  } catch (error) {
    console.error('Get album error:', error);
    res.status(500).json({ error: 'Failed to get album', details: error.message });
  }
};

// Get all artists
const getArtists = async (req, res) => {
  try {
    const artists = await navidromeService.getArtists();
    res.json(artists);
  } catch (error) {
    console.error('Get artists error:', error);
    res.status(500).json({ error: 'Failed to get artists', details: error.message });
  }
};

// Get random songs for recommendations
const getRandomSongs = async (req, res) => {
  try {
    console.log('[NAVIDROME ROUTE] GET /songs/random invoked', req.query);
    const { size = 50, genre, fromYear, toYear } = req.query;

    const songs = await navidromeService.getRandomSongs({
      size: parseInt(size),
      genre,
      fromYear: fromYear ? parseInt(fromYear) : undefined,
      toYear: toYear ? parseInt(toYear) : undefined,
    });

    console.log('[NAVIDROME] randomSongs', Array.isArray(songs) ? songs.length : typeof songs, songs && songs.slice ? songs.slice(0, 3) : songs);
    const payload = Array.isArray(songs) ? songs : [];
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(JSON.stringify(payload));
  } catch (error) {
    console.error('Get random songs error:', error);
    res.status(500).json({ error: 'Failed to get random songs', details: error.message });
  }
};

// Get playlists
const getPlaylists = async (req, res) => {
  try {
    const playlists = await navidromeService.getPlaylists();
    res.json(playlists);
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ error: 'Failed to get playlists', details: error.message });
  }
};

// Get single playlist with tracks
const getPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Playlist ID is required' });

    const playlist = await navidromeService.getPlaylist(id);
    res.json(playlist);
  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({ error: 'Failed to get playlist', details: error.message });
  }
};

// Proxy cover art image through backend to avoid ORB/CORS issues
const getCoverArt = async (req, res) => {
  const axios = require('axios');
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Cover ID is required' });

    const targetUrl = navidromeService.getCoverArtUrl(id);
    console.log(`[COVER PROXY] id=${id} target=${targetUrl}`);

    const response = await axios.get(targetUrl, { responseType: 'stream', validateStatus: () => true });
    const contentType = response.headers['content-type'] || 'image/jpeg';
    if (response.headers['content-length']) res.setHeader('Content-Length', response.headers['content-length']);
    res.setHeader('Content-Type', contentType);
    res.status(response.status);
    response.data.pipe(res);
  } catch (error) {
    console.error('Get cover art error:', error.message || error);
    if (!res.headersSent) res.status(502).json({ error: 'Failed to proxy cover art', details: error.message });
  }
};

// Get stream URL
const getStreamUrl = (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Song ID is required' });

    const url = navidromeService.getStreamUrl(id);
    res.json({ url });
  } catch (error) {
    console.error('Get stream URL error:', error);
    res.status(500).json({ error: 'Failed to get stream URL', details: error.message });
  }
};

// Proxy the Navidrome stream through the backend to avoid CORS/ORB and attach auth
const streamProxy = async (req, res) => {
  const axios = require('axios');
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Song ID is required' });

    const targetUrl = navidromeService.getStreamUrl(id);
    const requestedRange = req.headers.range;

    console.log(`[STREAM PROXY] id=${id} range=${requestedRange || 'none'} target=${targetUrl}`);

    const requestOptions = {
      responseType: 'stream',
      headers: {},
      validateStatus: () => true,
    };

    if (requestedRange) {
      requestOptions.headers.Range = requestedRange;
    }

    let response = await axios.get(targetUrl, requestOptions);
    console.log(`[STREAM PROXY] upstream status=${response.status} content-type=${response.headers['content-type']}`);

    if (requestedRange && response.status === 206 && !response.headers['content-range']) {
      console.warn('[STREAM PROXY] upstream returned 206 without Content-Range; retrying without Range header');
      response.data.destroy();
      delete requestOptions.headers.Range;
      response = await axios.get(targetUrl, requestOptions);
      console.log(`[STREAM PROXY] upstream retry status=${response.status} content-type=${response.headers['content-type']}`);
    }

    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const contentLength = response.headers['content-length'];
    const acceptRanges = response.headers['accept-ranges'];
    const contentRange = response.headers['content-range'];

    if (contentLength) res.setHeader('Content-Length', contentLength);
    if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);
    if (contentRange) res.setHeader('Content-Range', contentRange);
    res.setHeader('Content-Type', contentType);

    res.status(response.status);
    response.data.pipe(res);
  } catch (error) {
    console.error('Stream proxy error:', error.message || error);
    if (!res.headersSent) res.status(502).json({ error: 'Failed to proxy stream', details: error.message });
  }
};

module.exports = {
  checkHealth,
  search,
  getSong,
  getArtist,
  getAlbum,
  getArtists,
  getRandomSongs,
  getPlaylists,
  getPlaylist,
  getCoverArt,
  getStreamUrl,
  streamProxy,
};
