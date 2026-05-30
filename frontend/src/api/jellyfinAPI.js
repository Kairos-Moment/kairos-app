// frontend/src/api/jellyfinAPI.js
import apiClient from './axios';

export const searchMusic = async (query, options = {}) => {
  const params = {
    query,
    artistCount: options.artistCount || 10,
    albumCount: options.albumCount || 10,
    songCount: options.songCount || 25,
  };
  const response = await apiClient.get('/jellyfin/search', { params });
  return response.data;
};

export const getArtists = async () => {
  const response = await apiClient.get('/jellyfin/artists');
  return response.data;
};

export const getArtist = async (artistId) => {
  const response = await apiClient.get(`/jellyfin/artists/${artistId}`);
  return response.data;
};

export const getAlbum = async (albumId) => {
  const response = await apiClient.get(`/jellyfin/albums/${albumId}`);
  return response.data;
};

export const getSong = async (songId) => {
  const response = await apiClient.get(`/jellyfin/songs/${songId}`);
  return response.data;
};

export const getRandomSongs = async (options = {}) => {
  const params = {
    size: options.size || 50,
  };
  const response = await apiClient.get('/jellyfin/songs/random', { params });
  return response.data;
};

export const getCoverArtUrl = (coverId) => {
  return `/api/jellyfin/cover/${coverId}`;
};

export const getStreamUrl = (songId) => {
  return `/api/jellyfin/stream/proxy/${songId}`;
};

export const checkJellyfinHealth = async () => {
  try {
    const response = await apiClient.get('/jellyfin/health');
    return response.data.status === 'connected';
  } catch (error) {
    return false;
  }
};
