import express from 'express';
import * as musicbrainz from '../services/musicbrainz.js';
import * as streaming from '../services/streaming.js';
import jamendo from '../services/jamendo.js';
import youtube from '../services/youtube.js';

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { q, type = 'track', limit = 20, offset = 0 } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });

    if (type === 'track') {
      const [jamendoResults, musicbrainzResults, youtubeResults] = await Promise.allSettled([
        streaming.searchTracks(q, parseInt(limit), parseInt(offset)),
        musicbrainz.searchTracks(q, limit, offset),
        youtube.searchVideos(q, parseInt(limit))
      ]);
      
      const youtubeTracks = youtubeResults.status === 'fulfilled' 
        ? youtubeResults.value.map(v => ({
            id: v.videoId,
            name: v.title,
            artist_name: v.channelTitle,
            album_name: 'YouTube',
            duration: youtube.parseDuration ? youtube.parseDuration(v.duration) : 0,
            duration_ms: youtube.parseDuration ? youtube.parseDuration(v.duration) : 0,
            image: v.thumbnail,
            stream_url: v.stream_url,
            embedUrl: v.embedUrl,
            source: 'youtube'
          }))
        : [];

      res.json({
        jamendo: jamendoResults.status === 'fulfilled' ? jamendoResults.value : [],
        musicbrainz: musicbrainzResults.status === 'fulfilled' ? musicbrainzResults.value : [],
        youtube: youtubeTracks
      });
    } else if (type === 'album') {
      const musicbrainzResults = await musicbrainz.searchAlbums(q, limit, offset);
      res.json({ musicbrainz: musicbrainzResults });
    } else if (type === 'artist') {
      const musicbrainzResults = await musicbrainz.searchArtists(q, limit, offset);
      res.json({ musicbrainz: musicbrainzResults });
    }
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/track/:id', async (req, res) => {
  try {
    const track = await streaming.getTrackById(req.params.id);
    res.json({ ...track, source: 'jamendo' });
  } catch (error) {
    console.error('Get track error:', error);
    res.status(500).json({ error: 'Failed to get track' });
  }
});

router.get('/video/:id', async (req, res) => {
  try {
    const video = await youtube.getVideoById(req.params.id);
    res.json({ ...video, source: 'youtube' });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Failed to get video' });
  }
});

router.get('/youtube/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });
    const results = await youtube.searchVideos(q, parseInt(limit));
    res.json(results);
  } catch (error) {
    console.error('YouTube search error:', error);
    res.status(500).json({ error: 'YouTube search failed' });
  }
});

router.get('/youtube/popular', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const videos = await youtube.getPopularVideos(parseInt(limit));
    res.json(videos);
  } catch (error) {
    console.error('YouTube popular error:', error);
    res.status(500).json({ error: 'Failed to get popular videos' });
  }
});

router.get('/popular', async (req, res) => {
  try {
    const tracks = await streaming.getPopularTracks(parseInt(req.query.limit) || 20);
    res.json(tracks);
  } catch (error) {
    console.error('Popular tracks error:', error);
    res.status(500).json({ error: 'Failed to get popular tracks' });
  }
});

router.get('/album/:id', async (req, res) => {
  try {
    const album = await musicbrainz.getAlbumById(req.params.id);
    res.json(album);
  } catch (error) {
    console.error('Get album error:', error);
    res.status(500).json({ error: 'Failed to get album' });
  }
});

router.get('/artist/:id', async (req, res) => {
  try {
    const artist = await musicbrainz.getArtistById(req.params.id);
    res.json(artist);
  } catch (error) {
    console.error('Get artist error:', error);
    res.status(500).json({ error: 'Failed to get artist' });
  }
});

export default router;
