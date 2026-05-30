// backend/src/controllers/jellyfin.controller.js
const axios = require('axios');
const JellyfinService = require('../services/jellyfin.service');

const jellyfinService = new JellyfinService();

const checkHealth = async (req, res) => {
  try {
    const isAlive = await jellyfinService.ping();
    if (!isAlive) {
      return res.status(503).json({ status: 'disconnected', error: 'Failed to connect to Jellyfin' });
    }

    let info = null;
    try {
      info = await jellyfinService.getSystemInfo();
    } catch (getInfoError) {
      console.warn('Jellyfin getSystemInfo unavailable:', getInfoError.message);
    }

    const payload = { status: 'connected' };
    if (info) {
      payload.jellyfinVersion = info.Version;
      payload.serverName = info.ServerName;
    }

    return res.status(200).json(payload);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ status: 'error', error: error.message });
  }
};

const search = async (req, res) => {
  try {
    const { query, artistCount = 10, albumCount = 10, songCount = 25 } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await jellyfinService.search(query, {
      artistCount: parseInt(artistCount, 10),
      albumCount: parseInt(albumCount, 10),
      songCount: parseInt(songCount, 10),
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

const getSong = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Song ID is required' });

    const song = await jellyfinService.getSong(id);
    res.json(song);
  } catch (error) {
    console.error('Get song error:', error);
    res.status(500).json({ error: 'Failed to get song', details: error.message });
  }
};

const getArtist = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Artist ID is required' });

    const artist = await jellyfinService.getArtist(id);
    res.json(artist);
  } catch (error) {
    console.error('Get artist error:', error);
    res.status(500).json({ error: 'Failed to get artist', details: error.message });
  }
};

const getAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Album ID is required' });

    const album = await jellyfinService.getAlbum(id);
    res.json(album);
  } catch (error) {
    console.error('Get album error:', error);
    res.status(500).json({ error: 'Failed to get album', details: error.message });
  }
};

const getArtists = async (req, res) => {
  try {
    const artists = await jellyfinService.getArtists();
    res.json(artists);
  } catch (error) {
    console.error('Get artists error:', error);
    res.status(500).json({ error: 'Failed to get artists', details: error.message });
  }
};

const getRandomSongs = async (req, res) => {
  try {
    const { size = 50 } = req.query;
    const songs = await jellyfinService.getRandomSongs({
      size: parseInt(size, 10),
    });
    res.json(Array.isArray(songs) ? songs : []);
  } catch (error) {
    console.error('Get random songs error:', error);
    res.status(500).json({ error: 'Failed to get random songs', details: error.message });
  }
};

const getCoverArt = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Cover ID is required' });

    const targetUrl = jellyfinService.getCoverArtUrl(id);
    console.log(`[JELLYFIN COVER PROXY] id=${id} target=${targetUrl}`);

    const response = await axios.get(targetUrl, {
      responseType: 'stream',
      headers: jellyfinService.getAuthHeaders(),
      validateStatus: () => true,
    });

    const contentType = response.headers['content-type'] || 'image/jpeg';
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }
    res.setHeader('Content-Type', contentType);
    res.status(response.status);
    response.data.pipe(res);
  } catch (error) {
    console.error('Get cover art error:', error.message || error);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Failed to proxy cover art', details: error.message });
    }
  }
};

const getStreamUrl = (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Song ID is required' });

    const url = jellyfinService.getStreamUrl(id);
    res.json({ url });
  } catch (error) {
    console.error('Get stream URL error:', error);
    res.status(500).json({ error: 'Failed to get stream URL', details: error.message });
  }
};

const streamProxy = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Song ID is required' });

    const targetUrl = jellyfinService.getStreamUrl(id);
    const requestedRange = req.headers.range;

    console.log(`[JELLYFIN STREAM PROXY] id=${id} range=${requestedRange || 'none'} target=${targetUrl}`);

    const requestOptions = {
      responseType: 'stream',
      headers: jellyfinService.getAuthHeaders(),
      validateStatus: () => true,
    };

    if (requestedRange) {
      requestOptions.headers.Range = requestedRange;
    }

    let response = await axios.get(targetUrl, requestOptions);
    console.log(`[JELLYFIN STREAM PROXY] upstream status=${response.status} content-type=${response.headers['content-type']}`);

    if (requestedRange && response.status === 206 && !response.headers['content-range']) {
      console.warn('[JELLYFIN STREAM PROXY] upstream returned 206 without Content-Range; retrying without Range header');
      response.data.destroy();
      delete requestOptions.headers.Range;
      response = await axios.get(targetUrl, requestOptions);
      console.log(`[JELLYFIN STREAM PROXY] upstream retry status=${response.status} content-type=${response.headers['content-type']}`);
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
    if (!res.headersSent) {
      res.status(502).json({ error: 'Failed to proxy stream', details: error.message });
    }
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
  getCoverArt,
  getStreamUrl,
  streamProxy,
};
