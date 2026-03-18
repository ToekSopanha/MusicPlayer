<template>
  <div class="playlist-page">
    <div v-if="libraryStore.loading" class="loading">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="playlist" class="playlist-content">
      <div class="playlist-header">
        <div class="playlist-art">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div class="playlist-meta">
          <span class="playlist-type">Playlist</span>
          <h1 class="playlist-name">{{ playlist.name }}</h1>
          <p class="playlist-description">{{ playlist.description || 'No description' }}</p>
          <p class="playlist-stats">{{ playlist.tracks?.length || 0 }} tracks</p>
        </div>
      </div>

      <div v-if="playlist.tracks?.length > 0" class="tracks-section">
        <div class="tracks-header">
          <span class="col-number">#</span>
          <span class="col-title">Title</span>
          <span class="col-album">Album</span>
          <span class="col-duration">Duration</span>
          <span class="col-actions"></span>
        </div>
        <div class="tracks-list">
          <div 
            v-for="(track, index) in playlist.tracks" 
            :key="track.id"
            class="track-row"
            @click="playTrack(track, index)"
          >
            <span class="col-number">{{ index + 1 }}</span>
            <div class="col-title">
              <img 
                :src="track.album_art || '/placeholder-album.png'" 
                class="track-art"
              />
              <div class="track-info">
                <span class="track-name">{{ track.track_name }}</span>
                <span class="track-artist">{{ track.artist_name }}</span>
              </div>
            </div>
            <span class="col-album">{{ track.album_name || '-' }}</span>
            <span class="col-duration">{{ formatDuration(track.duration) }}</span>
            <div class="col-actions">
              <button 
                class="action-btn" 
                :class="{ active: libraryStore.isFavorite(track.track_id) }"
                @click.stop="toggleFavorite(track)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" :fill="libraryStore.isFavorite(track.track_id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
              <button class="action-btn" @click.stop="removeTrack(track.track_id)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <h3>This playlist is empty</h3>
        <p>Add some tracks from the search page</p>
        <router-link to="/search" class="btn btn-primary">Search Music</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLibraryStore } from '../stores/library'
import { usePlayerStore } from '../stores/player'

const route = useRoute()
const router = useRouter()
const libraryStore = useLibraryStore()
const playerStore = usePlayerStore()

const playlist = ref(null)

function formatDuration(ms) {
  if (!ms) return '0:00'
  const seconds = Math.floor(ms / 1000)
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function playTrack(track, index) {
  const trackData = {
    id: track.track_id,
    name: track.track_name,
    artists: [{ name: track.artist_name }],
    album: { name: track.album_name, images: [{ url: track.album_art }] },
    duration_ms: track.duration,
    preview_url: null
  }
  playerStore.playTrack(trackData)
}

async function toggleFavorite(track) {
  const trackData = {
    id: track.track_id,
    name: track.track_name,
    artists: [{ name: track.artist_name }],
    album: { name: track.album_name, images: [{ url: track.album_art }] },
    duration: track.duration
  }
  
  if (libraryStore.isFavorite(track.track_id)) {
    await libraryStore.removeFavorite(track.track_id)
  } else {
    await libraryStore.addFavorite(trackData)
  }
  await libraryStore.fetchPlaylist(route.params.id)
}

async function removeTrack(trackId) {
  await libraryStore.removeTrackFromPlaylist(route.params.id, trackId)
  await libraryStore.fetchPlaylist(route.params.id)
}

onMounted(async () => {
  playlist.value = await libraryStore.fetchPlaylist(route.params.id)
})
</script>

<style scoped>
.playlist-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.loading {
  text-align: center;
  padding: 60px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.playlist-header {
  display: flex;
  align-items: flex-end;
  gap: 32px;
  margin-bottom: 40px;
}

.playlist-art {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);
  flex-shrink: 0;
}

.playlist-meta {
  flex: 1;
}

.playlist-type {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
}

.playlist-name {
  font-size: 48px;
  margin: 8px 0;
}

.playlist-description {
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.playlist-stats {
  font-size: 14px;
  color: var(--text-muted);
}

.tracks-header {
  display: grid;
  grid-template-columns: 40px 1fr 1fr 80px 80px;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.track-row {
  display: grid;
  grid-template-columns: 40px 1fr 1fr 80px 80px;
  gap: 16px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-normal);
}

.track-row:hover {
  background: var(--bg-tertiary);
}

.col-number {
  display: flex;
  align-items: center;
  color: var(--text-muted);
}

.track-row:hover .col-number {
  display: none;
}

.track-row::after {
  content: "▶";
  display: none;
  align-items: center;
  color: var(--accent-primary);
}

.track-row:hover::after {
  display: flex;
}

.col-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.track-art {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.track-info {
  display: flex;
  flex-direction: column;
}

.track-name {
  font-weight: 500;
}

.track-artist {
  font-size: 13px;
  color: var(--text-secondary);
}

.col-album, .col-duration {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.col-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.track-row:hover .col-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  border-radius: 50%;
}

.action-btn:hover {
  color: var(--text-primary);
  background: var(--bg-elevated);
}

.action-btn.active {
  color: var(--accent-secondary);
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-state h3 {
  font-size: 24px;
  margin-bottom: 12px;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .playlist-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .playlist-art {
    width: 180px;
    height: 180px;
  }
  
  .playlist-name {
    font-size: 32px;
  }
  
  .tracks-header, .track-row {
    grid-template-columns: 30px 1fr 60px;
  }
  
  .col-album {
    display: none;
  }
}
</style>
