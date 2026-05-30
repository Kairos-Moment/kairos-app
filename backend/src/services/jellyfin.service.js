// backend/src/services/jellyfin.service.js
const axios = require('axios');

class JellyfinService {
  constructor(baseUrl, apiKey, userId) {
    this.baseUrl = (baseUrl || process.env.JELLYFIN_URL || 'http://localhost:8096').replace(/\/$/, '');
    this.apiKey = apiKey || process.env.JELLYFIN_API_KEY || '';
    this.userId = userId || process.env.JELLYFIN_USER_ID || null;
    this.client = this.createClient();
  }

  createClient() {
    return axios.create({
      baseURL: this.baseUrl,
      timeout: 15000,
      headers: {
        'X-Emby-Token': this.apiKey,
        Accept: 'application/json',
      },
    });
  }

  getAuthHeaders(extra = {}) {
    return {
      'X-Emby-Token': this.apiKey,
      ...extra,
    };
  }

  async ensureUserId() {
    if (this.userId) return this.userId;
    if (process.env.JELLYFIN_USER_ID) {
      this.userId = process.env.JELLYFIN_USER_ID;
      return this.userId;
    }
    const response = await this.client.get('/Users/Me');
    this.userId = response.data.Id;
    return this.userId;
  }

  normalizeArtist(item) {
    return {
      id: item.Id,
      name: item.Name,
      coverArt: item.ImageTags?.Primary ? item.Id : null,
    };
  }

  normalizeAlbum(item) {
    return {
      id: item.Id,
      name: item.Name,
      coverArt: item.ImageTags?.Primary ? item.Id : null,
      artist: item.AlbumArtist || item.Artists?.[0],
    };
  }

  normalizeSong(item) {
    const durationSec = item.RunTimeTicks
      ? Math.floor(item.RunTimeTicks / 10000000)
      : null;
    return {
      id: item.Id,
      title: item.Name,
      artist: item.AlbumArtist || item.Artists?.[0] || 'Unknown Artist',
      album: item.Album || 'Unknown Album',
      coverArt: item.ImageTags?.Primary ? item.Id : item.AlbumId || item.Id,
      duration: durationSec,
    };
  }

  async getItems(params = {}) {
    const userId = await this.ensureUserId();
    const response = await this.client.get(`/Users/${userId}/Items`, {
      params: {
        Fields: 'BasicSyncInfo,PrimaryImageAspectRatio,AlbumArtist,Artists,Album,RunTimeTicks',
        ...params,
      },
    });
    return response.data.Items || [];
  }

  async getItem(itemId) {
    const userId = await this.ensureUserId();
    const response = await this.client.get(`/Users/${userId}/Items/${itemId}`, {
      params: {
        Fields: 'BasicSyncInfo,PrimaryImageAspectRatio,AlbumArtist,Artists,Album,RunTimeTicks',
      },
    });
    return response.data;
  }

  async ping() {
    if (!this.apiKey) {
      console.warn('Jellyfin API key is not configured');
      return false;
    }
    try {
      const response = await this.client.get('/System/Ping');
      return response.status === 200;
    } catch (error) {
      console.error('Jellyfin ping failed:', error.message);
      return false;
    }
  }

  async getSystemInfo() {
    try {
      const response = await this.client.get('/System/Info/Public');
      return response.data;
    } catch (error) {
      console.error('Failed to get Jellyfin system info:', error.message);
      return null;
    }
  }

  async search(query, options = {}) {
    const artistCount = options.artistCount || 10;
    const albumCount = options.albumCount || 10;
    const songCount = options.songCount || 25;

    const items = await this.getItems({
      SearchTerm: query,
      IncludeItemTypes: 'MusicArtist,MusicAlbum,Audio',
      Recursive: true,
      Limit: artistCount + albumCount + songCount,
    });

    const artists = [];
    const albums = [];
    const songs = [];

    items.forEach((item) => {
      if (item.Type === 'MusicArtist' && artists.length < artistCount) {
        artists.push(this.normalizeArtist(item));
      } else if (item.Type === 'MusicAlbum' && albums.length < albumCount) {
        albums.push(this.normalizeAlbum(item));
      } else if (item.Type === 'Audio' && songs.length < songCount) {
        songs.push(this.normalizeSong(item));
      }
    });

    return { artist: artists, album: albums, song: songs };
  }

  async getSong(songId) {
    const item = await this.getItem(songId);
    return this.normalizeSong(item);
  }

  async getArtist(artistId) {
    const artistItem = await this.getItem(artistId);
    const albums = await this.getItems({
      ParentId: artistId,
      IncludeItemTypes: 'MusicAlbum',
      SortBy: 'SortName',
    });

    return {
      id: artistId,
      name: artistItem?.Name || 'Unknown Artist',
      coverArt: artistItem?.ImageTags?.Primary ? artistId : null,
      album: albums.map((album) => this.normalizeAlbum(album)),
    };
  }

  async getAlbum(albumId) {
    const albumItem = await this.getItem(albumId);
    const songs = await this.getItems({
      ParentId: albumId,
      IncludeItemTypes: 'Audio',
      SortBy: 'IndexNumber',
    });

    return {
      id: albumId,
      name: albumItem?.Name || 'Unknown Album',
      artist: albumItem?.AlbumArtist,
      song: songs.map((song) => this.normalizeSong(song)),
    };
  }

  async getArtists() {
    const items = await this.getItems({
      IncludeItemTypes: 'MusicArtist',
      Recursive: true,
      SortBy: 'SortName',
    });
    return items.map((item) => this.normalizeArtist(item));
  }

  async getRandomSongs(options = {}) {
    const size = options.size || 50;
    const items = await this.getItems({
      IncludeItemTypes: 'Audio',
      Recursive: true,
      SortBy: 'Random',
      Limit: size,
    });
    return items.map((item) => this.normalizeSong(item));
  }

  getStreamUrl(itemId) {
    return `${this.baseUrl}/Audio/${itemId}/stream`;
  }

  getCoverArtUrl(itemId) {
    return `${this.baseUrl}/Items/${itemId}/Images/Primary?maxWidth=300&maxHeight=300`;
  }
}

module.exports = JellyfinService;
