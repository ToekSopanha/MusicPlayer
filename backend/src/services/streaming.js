import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

const JAMENDO_BASE = 'https://api.jamendo.com/v3.0';

const getClientId = () => {
  const clientId = process.env.JAMENDO_CLIENT_ID;
  if (!clientId) throw new Error('Jamendo client ID not configured');
  return clientId;
};

export const searchTracks = async (query, limit = 20, offset = 0) => {
  const response = await axios.get(`${JAMENDO_BASE}/tracks`, {
    params: {
      client_id: getClientId(),
      format: 'json',
      limit,
      offset,
      search: query,
      include: 'musicinfo+stats',
      order: 'popularity_total'
    }
  });

  return response.data.results.map(track => ({
    id: track.id,
    name: track.name,
    artist_name: track.artist_name,
    album_name: track.album_name,
    duration: parseInt(track.duration) * 1000,
    duration_ms: parseInt(track.duration) * 1000,
    image: track.image,
    stream_url: track.audio,
    preview_url: track.audio,
    genres: track.musicinfo?.genres?.map(g => g.name) || []
  }));
};

export const getTrackById = async (trackId) => {
  const response = await axios.get(`${JAMENDO_BASE}/tracks`, {
    params: {
      client_id: getClientId(),
      format: 'json',
      id: trackId,
      include: 'musicinfo+stats+album+artist'
    }
  });

  const track = response.data.results[0];
  return {
    id: track.id,
    name: track.name,
    artist_name: track.artist_name,
    artist: { id: track.artist_id, name: track.artist_name },
    album_name: track.album_name,
    album: { id: track.album_id, name: track.album_name, images: [{ url: track.image }] },
    duration: parseInt(track.duration) * 1000,
    duration_ms: parseInt(track.duration) * 1000,
    image: track.image,
    stream_url: track.audio,
    preview_url: track.audio,
    genres: track.musicinfo?.genres?.map(g => g.name) || []
  };
};

export const getPopularTracks = async (limit = 20) => {
  const response = await axios.get(`${JAMENDO_BASE}/tracks`, {
    params: {
      client_id: getClientId(),
      format: 'json',
      limit,
      include: 'musicinfo+stats',
      order: 'popularity_total'
    }
  });
  
  return response.data.results.map(track => ({
    id: track.id,
    name: track.name,
    artist_name: track.artist_name,
    album_name: track.album_name,
    duration: parseInt(track.duration) * 1000,
    image: track.image,
    stream_url: track.audio,
    preview_url: track.audio
  }));
};

export default { searchTracks, getTrackById, getPopularTracks };
