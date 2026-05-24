// frontend/src/api/navidromeAPI.js
import apiClient from './axios';

export const searchMusic = async (query, options = {}) => {
  const params = {
    query,
    artistCount: options.artistCount || 10,
    albumCount: options.albumCount || 10,
    songCount: options.songCount || 25,
  };
  const response = await apiClient.get('/navidrome/search', { params });
  return response.data;
};

export const getArtists = async () => {
  const response = await apiClient.get('/navidrome/artists');
  return response.data;
};

export const getArtist = async (artistId) => {
  const response = await apiClient.get(`/navidrome/artists/${artistId}`);
  return response.data;
};

export const getAlbum = async (albumId) => {
  const response = await apiClient.get(`/navidrome/albums/${albumId}`);
  return response.data;
};

export const getSong = async (songId) => {
  const response = await apiClient.get(`/navidrome/songs/${songId}`);
  return response.data;
};

export const getRandomSongs = async (options = {}) => {
  const params = {
    size: options.size || 50,
    genre: options.genre,
    fromYear: options.fromYear,
    toYear: options.toYear,
  };
  const response = await apiClient.get('/navidrome/songs/random', { params });
  return response.data;
};

export const getPlaylists = async () => {
  const response = await apiClient.get('/navidrome/playlists');
  return response.data;
};

export const getPlaylist = async (playlistId) => {
  const response = await apiClient.get(`/navidrome/playlists/${playlistId}`);
  return response.data;
};

export const getCoverArtUrl = (coverId) => {
  return `/api/navidrome/cover/${coverId}`;
};

export const getStreamUrl = (songId) => {
  // Use a relative path so Vite proxy handles the request and avoids cross-origin issues
  return `/api/navidrome/stream/proxy/${songId}`;
};

export const checkNavidromeHealth = async () => {
  try {
    const response = await apiClient.get('/navidrome/health');
    return response.data.status === 'connected';
  } catch (error) {
    return false;
  }
};
