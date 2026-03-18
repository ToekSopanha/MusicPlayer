import axios from 'axios';

const MUSICBRAINZ_BASE = 'https://musicbrainz.org/ws/2';

const musicbrainzClient = axios.create({
  baseURL: MUSICBRAINZ_BASE,
  headers: {
    'User-Agent': 'LessTone/1.0.0 (contact@lesstone.com)',
    'Accept': 'application/json'
  }
});

export const searchTracks = async (query, limit = 20, offset = 0) => {
  try {
    const response = await musicbrainzClient.get('/recording', {
      params: {
        query: query,
        limit,
        offset,
        fmt: 'json'
      }
    });
    
    return response.data.recordings.map(recording => ({
      id: recording.id,
      title: recording.title,
      artist: recording['artist-credit']?.[0]?.artist?.name || 'Unknown Artist',
      artistId: recording['artist-credit']?.[0]?.artist?.id,
      album: recording.releases?.[0]?.title,
      albumId: recording.releases?.[0]?.id,
      duration: recording.length ? Math.floor(recording.length / 1000) : 0,
      year: recording.releases?.[0]?.date?.substring(0, 4)
    }));
  } catch (error) {
    console.error('MusicBrainz search error:', error.message);
    throw new Error('Failed to search tracks');
  }
};

export const searchAlbums = async (query, limit = 20, offset = 0) => {
  try {
    const response = await musicbrainzClient.get('/release', {
      params: {
        query: query,
        limit,
        offset,
        fmt: 'json'
      }
    });
    
    return response.data.releases.map(release => ({
      id: release.id,
      title: release.title,
      artist: release['artist-credit']?.[0]?.artist?.name || 'Unknown Artist',
      artistId: release['artist-credit']?.[0]?.artist?.id,
      year: release.date?.substring(0, 4),
      country: release.country,
      type: release.releasetype
    }));
  } catch (error) {
    console.error('MusicBrainz album search error:', error.message);
    throw new Error('Failed to search albums');
  }
};

export const searchArtists = async (query, limit = 20, offset = 0) => {
  try {
    const response = await musicbrainzClient.get('/artist', {
      params: {
        query: query,
        limit,
        offset,
        fmt: 'json'
      }
    });
    
    return response.data.artists.map(artist => ({
      id: artist.id,
      name: artist.name,
      type: artist.type,
      country: artist.country,
      disambiguation: artist.disambiguation
    }));
  } catch (error) {
    console.error('MusicBrainz artist search error:', error.message);
    throw new Error('Failed to search artists');
  }
};

export const getArtistById = async (artistId) => {
  try {
    const response = await musicbrainzClient.get(`/artist/${artistId}`, {
      params: { fmt: 'json' }
    });
    
    const artist = response.data;
    return {
      id: artist.id,
      name: artist.name,
      type: artist.type,
      country: artist.country,
      disambiguation: artist.disambiguation,
      lifeSpan: artist['life-span']
    };
  } catch (error) {
    console.error('MusicBrainz artist error:', error.message);
    throw new Error('Failed to get artist');
  }
};

export const getAlbumById = async (albumId) => {
  try {
    const response = await musicbrainzClient.get(`/release/${albumId}`, {
      params: { 
        fmt: 'json',
        inc: 'recordings+artist-credits'
      }
    });
    
    const album = response.data;
    return {
      id: album.id,
      title: album.title,
      artist: album['artist-credit']?.[0]?.artist?.name || 'Unknown Artist',
      year: album.date?.substring(0, 4),
      country: album.country,
      type: album.releasetype,
      tracks: album.media?.flatMap(media => 
        media.tracks?.map(track => ({
          id: track.id,
          title: track.title,
          position: track.position,
          duration: track.length ? Math.floor(track.length / 1000) : 0
        })) || []
      ) || []
    };
  } catch (error) {
    console.error('MusicBrainz album error:', error.message);
    throw new Error('Failed to get album');
  }
};

export default {
  searchTracks,
  searchAlbums,
  searchArtists,
  getArtistById,
  getAlbumById
};
