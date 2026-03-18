import axios from 'axios';

const SPOTIFY_BASE = 'https://api.spotify.com/v1';

let spotifyToken = null;
let tokenExpiry = null;

const getSpotifyToken = async () => {
  if (spotifyToken && tokenExpiry && Date.now() < tokenExpiry) {
    return spotifyToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const response = await axios.post('https://accounts.spotify.com/api/token',
    new URLSearchParams({ grant_type: 'client_credentials' }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      }
    }
  );

  spotifyToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;

  return spotifyToken;
};

const spotifyClient = axios.create({
  baseURL: SPOTIFY_BASE
});

spotifyClient.interceptors.request.use(async (config) => {
  const token = await getSpotifyToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const searchSpotify = async (query, types = ['track'], limit = 20) => {
  try {
    const response = await spotifyClient.get('/search', {
      params: {
        q: query,
        type: types.join(','),
        limit
      }
    });

    return {
      tracks: response.data.tracks?.items.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(a => ({ id: a.id, name: a.name })),
        album: {
          id: track.album.id,
          name: track.album.name,
          images: track.album.images,
          release_date: track.album.release_date
        },
        duration_ms: track.duration_ms,
        uri: track.uri,
        preview_url: track.preview_url,
        popularity: track.popularity
      })) || [],
      albums: response.data.albums?.items.map(album => ({
        id: album.id,
        name: album.name,
        artists: album.artists.map(a => ({ id: a.id, name: a.name })),
        images: album.images,
        release_date: album.release_date,
        total_tracks: album.total_tracks
      })) || [],
      artists: response.data.artists?.items.map(artist => ({
        id: artist.id,
        name: artist.name,
        images: artist.images,
        popularity: artist.popularity,
        genres: artist.genres
      })) || []
    };
  } catch (error) {
    console.error('Spotify search error:', error.message);
    throw new Error('Failed to search Spotify');
  }
};

export const getTrackById = async (trackId) => {
  try {
    const response = await spotifyClient.get(`/tracks/${trackId}`);
    const track = response.data;

    return {
      id: track.id,
      name: track.name,
      artists: track.artists.map(a => ({ id: a.id, name: a.name })),
      album: {
        id: track.album.id,
        name: track.album.name,
        images: track.album.images,
        release_date: track.album.release_date
      },
      duration_ms: track.duration_ms,
      uri: track.uri,
      preview_url: track.preview_url,
      popularity: track.popularity
    };
  } catch (error) {
    console.error('Spotify track error:', error.message);
    throw new Error('Failed to get track');
  }
};

export const getAudioFeatures = async (trackId) => {
  try {
    const response = await spotifyClient.get(`/audio-features/${trackId}`);
    const features = response.data;

    return {
      tempo: features.tempo,
      key: features.key,
      mode: features.mode,
      time_signature: features.time_signature,
      danceability: features.danceability,
      energy: features.energy,
      speechiness: features.speechiness,
      acousticness: features.acousticness,
      instrumentalness: features.instrumentalness,
      liveness: features.liveness,
      valence: features.valence,
      loudness: features.loudness
    };
  } catch (error) {
    console.error('Spotify audio features error:', error.message);
    throw new Error('Failed to get audio features');
  }
};

export const getRecommendations = async (seedTracks, limit = 20) => {
  try {
    const response = await spotifyClient.get('/recommendations', {
      params: {
        seed_tracks: seedTracks.join(','),
        limit
      }
    });

    return response.data.tracks.map(track => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map(a => ({ id: a.id, name: a.name })),
      album: {
        id: track.album.id,
        name: track.album.name,
        images: track.album.images
      },
      duration_ms: track.duration_ms,
      uri: track.uri,
      preview_url: track.preview_url
    }));
  } catch (error) {
    console.error('Spotify recommendations error:', error.message);
    throw new Error('Failed to get recommendations');
  }
};

export default {
  searchSpotify,
  getTrackById,
  getAudioFeatures,
  getRecommendations
};
