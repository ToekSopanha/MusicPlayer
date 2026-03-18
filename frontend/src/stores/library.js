import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = '/api'

export const useLibraryStore = defineStore('library', () => {
  const favorites = ref([])
  const playlists = ref([])
  const currentPlaylist = ref(null)
  const loading = ref(false)

  async function fetchFavorites() {
    loading.value = true
    try {
      const response = await axios.get(`${API_URL}/library/favorites`)
      favorites.value = response.data
    } catch (err) {
      console.error('Failed to fetch favorites:', err)
    } finally {
      loading.value = false
    }
  }

  async function addFavorite(track) {
    try {
      await axios.post(`${API_URL}/library/favorites`, {
        trackId: track.id,
        trackName: track.name,
        artistName: track.artists?.[0]?.name || track.artist_name,
        albumName: track.album?.name || track.album_name,
        albumArt: track.album?.images?.[0]?.url || track.image,
        duration: track.duration_ms || track.duration,
        spotifyUri: track.uri
      })
      await fetchFavorites()
      return true
    } catch (err) {
      console.error('Failed to add favorite:', err)
      return false
    }
  }

  async function removeFavorite(trackId) {
    try {
      await axios.delete(`${API_URL}/library/favorites/${trackId}`)
      favorites.value = favorites.value.filter(f => f.track_id !== trackId)
      return true
    } catch (err) {
      console.error('Failed to remove favorite:', err)
      return false
    }
  }

  function isFavorite(trackId) {
    return favorites.value.some(f => f.track_id === trackId)
  }

  async function fetchPlaylists() {
    loading.value = true
    try {
      const response = await axios.get(`${API_URL}/library/playlists`)
      playlists.value = response.data
    } catch (err) {
      console.error('Failed to fetch playlists:', err)
    } finally {
      loading.value = false
    }
  }

  async function createPlaylist(name, description = '') {
    try {
      const response = await axios.post(`${API_URL}/library/playlists`, { name, description })
      playlists.value.unshift(response.data)
      return response.data
    } catch (err) {
      console.error('Failed to create playlist:', err)
      return null
    }
  }

  async function fetchPlaylist(id) {
    loading.value = true
    try {
      const response = await axios.get(`${API_URL}/library/playlists/${id}`)
      currentPlaylist.value = response.data
      return response.data
    } catch (err) {
      console.error('Failed to fetch playlist:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function deletePlaylist(id) {
    try {
      await axios.delete(`${API_URL}/library/playlists/${id}`)
      playlists.value = playlists.value.filter(p => p.id !== id)
      return true
    } catch (err) {
      console.error('Failed to delete playlist:', err)
      return false
    }
  }

  async function addTrackToPlaylist(playlistId, track) {
    try {
      await axios.post(`${API_URL}/library/playlists/${playlistId}/tracks`, {
        trackId: track.id,
        trackName: track.name,
        artistName: track.artists?.[0]?.name || track.artist_name,
        albumName: track.album?.name || track.album_name,
        albumArt: track.album?.images?.[0]?.url || track.image,
        duration: track.duration_ms || track.duration
      })
      if (currentPlaylist.value && currentPlaylist.value.id === playlistId) {
        await fetchPlaylist(playlistId)
      }
      return true
    } catch (err) {
      console.error('Failed to add track to playlist:', err)
      return false
    }
  }

  async function removeTrackFromPlaylist(playlistId, trackId) {
    try {
      await axios.delete(`${API_URL}/library/playlists/${playlistId}/tracks/${trackId}`)
      if (currentPlaylist.value && currentPlaylist.value.id === playlistId) {
        currentPlaylist.value.tracks = currentPlaylist.value.tracks.filter(t => t.track_id !== trackId)
      }
      return true
    } catch (err) {
      console.error('Failed to remove track from playlist:', err)
      return false
    }
  }

  return {
    favorites,
    playlists,
    currentPlaylist,
    loading,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    fetchPlaylists,
    createPlaylist,
    fetchPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist
  }
})
