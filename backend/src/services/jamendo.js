import axios from 'axios';

const JAMENDO_BASE = 'https://api.jamendo.com/v3.0';

const getClientId = () => {
  const clientId = process.env.JAMENDO_CLIENT_ID;
  if (!clientId) {
    throw new Error('Jamendo client ID not configured');
  }
  return clientId;
};

const jamendoClient = axios.create({
  baseURL: JAMENDO_BASE
});

export const searchJamendoTracks = async (query, limit = 20, offset = 0) => {
  try {
    const response = await jamendoClient.get('/tracks', {
      params: {
        client_id: getClientId(),
        format: 'json',
        limit,
        offset,
        search: query,
        include: 'musicinfo+stats'
      }
    });

    return response.data.results.map(track => ({
      id: track.id,
      name: track.name,
      artist_name: track.artist_name,
      album_name: track.album_name,
      album_id: track.album_id,
      duration: parseInt(track.duration),
      genres: track.musicinfo?.genres?.map(g => g.name) || [],
      tags: track.musicinfo?.tags || [],
      popularity: track.stats?.rate?.text || 0,
      audio: track.audio,
      audiodownload: track.audiodownload,
      image: track.image
    }));
  } catch (error) {
    console.error('Jamendo search error:', error.message);
    throw new Error('Failed to search Jamendo');
  }
};

export const getJamendoTrack = async (trackId) => {
  try {
    const response = await jamendoClient.get('/tracks', {
      params: {
        client_id: getClientId(),
        format: 'json',
        id: trackId,
        include: 'musicinfo+stats+comments'
      }
    });

    const track = response.data.results[0];
    return {
      id: track.id,
      name: track.name,
      artist_name: track.artist_name,
      artist_id: track.artist_id,
      album_name: track.album_name,
      album_id: track.album_id,
      duration: parseInt(track.duration),
      genres: track.musicinfo?.genres?.map(g => g.name) || [],
      tags: track.musicinfo?.tags || [],
      license: track.license,
      audio: track.audio,
      audiodownload: track.audiodownload,
      image: track.image,
      stats: track.stats
    };
  } catch (error) {
    console.error('Jamendo track error:', error.message);
    throw new Error('Failed to get track from Jamendo');
  }
};

export const getJamendoAudioAnalysis = async (trackId) => {
  try {
    const response = await jamendoClient.get('/tracks', {
      params: {
        client_id: getClientId(),
        format: 'json',
        id: trackId
      }
    });

    const track = response.data.results[0];
    return {
      trackId: track.id,
      duration: parseInt(track.duration),
      waveform: track.waveform || null,
      genres: track.musicinfo?.genres?.map(g => g.name) || [],
      mood: track.musicinfo?.mood || [],
      tempo: track.musicinfo?.speed || [],
      instrumentation: track.musicinfo?.instrument?.join(', ') || ''
    };
  } catch (error) {
    console.error('Jamendo audio analysis error:', error.message);
    throw new Error('Failed to get audio analysis');
  }
};

export const getJamendoPlaylists = async (limit = 20) => {
  try {
    const response = await jamendoClient.get('/playlists', {
      params: {
        client_id: getClientId(),
        format: 'json',
        limit,
        order: 'popularity_total'
      }
    });

    return response.data.results.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      creator_name: playlist.creator_name,
      trackcount: playlist.trackcount,
      image: playlist.image,
      url: playlist.url
    }));
  } catch (error) {
    console.error('Jamendo playlists error:', error.message);
    throw new Error('Failed to get playlists');
  }
};

export const getJamendoGenres = async () => {
  try {
    const response = await jamendoClient.get('/musicinfo/genres', {
      params: {
        client_id: getClientId(),
        format: 'json'
      }
    });

    return response.data.results;
  } catch (error) {
    console.error('Jamendo genres error:', error.message);
    throw new Error('Failed to get genres');
  }
};

export default {
  searchJamendoTracks,
  getJamendoTrack,
  getJamendoAudioAnalysis,
  getJamendoPlaylists,
  getJamendoGenres
};
