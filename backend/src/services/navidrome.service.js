// backend/src/services/navidrome.service.js
const axios = require('axios');

class NavidromeService {
  constructor(baseUrl, username, password) {
    this.baseUrl = baseUrl || process.env.NAVIDROME_URL || 'http://localhost:4533';
    this.username = username || process.env.NAVIDROME_USERNAME || 'admin';
    this.password = password || process.env.NAVIDROME_PASSWORD || 'admin';
    this.authParams = {
      u: this.username,
      p: this.password,
      v: '1.16.1',
      c: 'Kairos',
      f: 'json',
    };
    this.client = this.createClient();
  }

  createClient() {
    return axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });
  }

  getAuthParams(extra = {}) {
    return { ...this.authParams, ...extra };
  }

  // Test connection and authentication
  async ping() {
    try {
      const response = await this.client.get('/rest/ping', {
        params: this.getAuthParams(),
      });
      return response.data['subsonic-response']?.status === 'ok';
    } catch (error) {
      console.error('Navidrome ping failed:', error.message);
      return false;
    }
  }

  // Get basic system info
  async getSystemInfo() {
    try {
      const response = await this.client.get('/rest/getSystemInfo', {
        params: this.getAuthParams(),
        validateStatus: () => true,
      });
      if (response.status === 404) {
        return null;
      }
      return response.data['subsonic-response'];
    } catch (error) {
      console.error('Failed to get Navidrome system info:', error.message);
      return null;
    }
  }

  // Search for tracks, artists, albums
  async search(query, options = {}) {
    try {
      const response = await this.client.get('/rest/search3', {
        params: this.getAuthParams({
          query,
          artistCount: options.artistCount || 10,
          albumCount: options.albumCount || 10,
          songCount: options.songCount || 25,
        }),
      });
      return response.data['subsonic-response']?.searchResult3;
    } catch (error) {
      console.error('Search failed:', error.message);
      throw error;
    }
  }

  // Get song details by ID
  async getSong(songId) {
    try {
      const response = await this.client.get('/rest/getSong', {
        params: this.getAuthParams({ id: songId }),
      });
      return response.data['subsonic-response']?.song;
    } catch (error) {
      console.error(`Failed to get song ${songId}:`, error.message);
      throw error;
    }
  }

  // Get artist information
  async getArtist(artistId) {
    try {
      const response = await this.client.get('/rest/getArtist', {
        params: this.getAuthParams({ id: artistId }),
      });
      return response.data['subsonic-response']?.artist;
    } catch (error) {
      console.error(`Failed to get artist ${artistId}:`, error.message);
      throw error;
    }
  }

  // Get album information
  async getAlbum(albumId) {
    try {
      const response = await this.client.get('/rest/getAlbum', {
        params: this.getAuthParams({ id: albumId }),
      });
      return response.data['subsonic-response']?.album;
    } catch (error) {
      console.error(`Failed to get album ${albumId}:`, error.message);
      throw error;
    }
  }

  // Get all artists
  async getArtists(options = {}) {
    try {
      const response = await this.client.get('/rest/getArtists', {
        params: this.getAuthParams({
          musicFolderId: options.musicFolderId,
        }),
      });
      return response.data['subsonic-response']?.artists;
    } catch (error) {
      console.error('Failed to get artists:', error.message);
      throw error;
    }
  }

  // Get albums by artist
  async getArtistAlbums(artistId, options = {}) {
    try {
      const response = await this.client.get('/rest/getArtist', {
        params: this.getAuthParams({
          id: artistId,
          size: options.size || 50,
          offset: options.offset || 0,
        }),
      });
      return response.data['subsonic-response']?.artist;
    } catch (error) {
      console.error(`Failed to get albums for artist ${artistId}:`, error.message);
      throw error;
    }
  }

  // Get random songs
  async getRandomSongs(options = {}) {
    try {
      const response = await this.client.get('/rest/getRandomSongs', {
        params: this.getAuthParams({
          size: options.size || 50,
          genre: options.genre,
          fromYear: options.fromYear,
          toYear: options.toYear,
        }),
      });
      return response.data['subsonic-response']?.randomSongs?.song || [];
    } catch (error) {
      console.error('Failed to get random songs:', error.message);
      throw error;
    }
  }

  // Get playlists
  async getPlaylists() {
    try {
      const response = await this.client.get('/rest/getPlaylists', {
        params: this.getAuthParams(),
      });
      return response.data['subsonic-response']?.playlists?.playlist || [];
    } catch (error) {
      console.error('Failed to get playlists:', error.message);
      throw error;
    }
  }

  // Get playlist details
  async getPlaylist(playlistId) {
    try {
      const response = await this.client.get('/rest/getPlaylist', {
        params: this.getAuthParams({ id: playlistId }),
      });
      return response.data['subsonic-response']?.playlist;
    } catch (error) {
      console.error(`Failed to get playlist ${playlistId}:`, error.message);
      throw error;
    }
  }

  // Get direct streaming URL for a song
  getStreamUrl(songId) {
    const params = new URLSearchParams(this.getAuthParams({ id: songId }));
    return `${this.baseUrl}/rest/stream?${params.toString()}`;
  }

  // Get cover art URL
  getCoverArtUrl(coverId) {
    const params = new URLSearchParams(this.getAuthParams({
      id: coverId,
      size: 300,
    }));
    return `${this.baseUrl}/rest/getCoverArt?${params.toString()}`;
  }
}

module.exports = NavidromeService;
