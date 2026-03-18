import express from 'express';
import { dbRun, dbGet, dbAll } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/favorites', (req, res) => {
  try {
    const favorites = dbAll(
      'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

router.post('/favorites', (req, res) => {
  try {
    const { trackId, trackName, artistName, albumName, albumArt, duration, spotifyUri } = req.body;

    if (!trackId || !trackName || !artistName) {
      return res.status(400).json({ error: 'Track info required' });
    }

    const existing = dbGet(
      'SELECT id FROM favorites WHERE user_id = ? AND track_id = ?',
      [req.user.id, trackId]
    );

    if (existing) {
      return res.status(400).json({ error: 'Already in favorites' });
    }

    const result = dbRun(
      'INSERT INTO favorites (user_id, track_id, track_name, artist_name, album_name, album_art, duration, spotify_uri) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, trackId, trackName, artistName, albumName, albumArt, duration, spotifyUri]
    );

    res.status(201).json({ id: result.lastInsertRowid, message: 'Added to favorites' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

router.delete('/favorites/:trackId', (req, res) => {
  try {
    const { trackId } = req.params;
    
    dbRun('DELETE FROM favorites WHERE user_id = ? AND track_id = ?', [req.user.id, trackId]);
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

router.get('/playlists', (req, res) => {
  try {
    const playlists = dbAll(
      'SELECT * FROM playlists WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(playlists);
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ error: 'Failed to get playlists' });
  }
});

router.post('/playlists', (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Playlist name required' });
    }

    const result = dbRun(
      'INSERT INTO playlists (user_id, name, description) VALUES (?, ?, ?)',
      [req.user.id, name, description || null]
    );

    res.status(201).json({ 
      id: result.lastInsertRowid, 
      name, 
      description,
      message: 'Playlist created' 
    });
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

router.get('/playlists/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const playlist = dbGet(
      'SELECT * FROM playlists WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const tracks = dbAll(
      'SELECT * FROM playlist_tracks WHERE playlist_id = ? ORDER BY position ASC',
      [id]
    );

    res.json({ ...playlist, tracks });
  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({ error: 'Failed to get playlist' });
  }
});

router.delete('/playlists/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    dbRun('DELETE FROM playlist_tracks WHERE playlist_id = ?', [id]);
    dbRun('DELETE FROM playlists WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ message: 'Playlist deleted' });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

router.post('/playlists/:id/tracks', (req, res) => {
  try {
    const { id } = req.params;
    const { trackId, trackName, artistName, albumName, albumArt, duration } = req.body;

    const playlist = dbGet(
      'SELECT id FROM playlists WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const maxPosition = dbGet(
      'SELECT MAX(position) as max FROM playlist_tracks WHERE playlist_id = ?',
      [id]
    );

    const position = (maxPosition?.max || 0) + 1;

    const result = dbRun(
      'INSERT INTO playlist_tracks (playlist_id, track_id, track_name, artist_name, album_name, album_art, duration, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, trackId, trackName, artistName, albumName, albumArt, duration, position]
    );

    res.status(201).json({ id: result.lastInsertRowid, message: 'Track added to playlist' });
  } catch (error) {
    console.error('Add track error:', error);
    res.status(500).json({ error: 'Failed to add track' });
  }
});

router.delete('/playlists/:playlistId/tracks/:trackId', (req, res) => {
  try {
    const { playlistId, trackId } = req.params;

    const playlist = dbGet(
      'SELECT id FROM playlists WHERE id = ? AND user_id = ?',
      [playlistId, req.user.id]
    );

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    dbRun('DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?', [playlistId, trackId]);
    res.json({ message: 'Track removed from playlist' });
  } catch (error) {
    console.error('Remove track error:', error);
    res.status(500).json({ error: 'Failed to remove track' });
  }
});

export default router;
