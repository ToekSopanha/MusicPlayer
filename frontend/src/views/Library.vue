<template>
  <div class="library-page">
    <div class="library-header">
      <h1 class="page-title">Your Library</h1>
      <button class="btn btn-primary" @click="showCreateModal = true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New Playlist
      </button>
    </div>

    <div class="library-tabs">
      <button 
        class="tab" 
        :class="{ active: activeTab === 'favorites' }"
        @click="activeTab = 'favorites'"
      >
        Favorites
      </button>
      <button 
        class="tab" 
        :class="{ active: activeTab === 'playlists' }"
        @click="activeTab = 'playlists'"
      >
        Playlists
      </button>
    </div>

    <div v-if="activeTab === 'favorites'" class="favorites-section">
      <div v-if="libraryStore.loading" class="loading">
        <div class="spinner"></div>
      </div>
      
      <div v-else-if="libraryStore.favorites.length > 0" class="tracks-list">
        <TrackCard 
          v-for="track in libraryStore.favorites" 
          :key="track.id" 
          :track="convertFavoriteToTrack(track)"
        />
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <h3>No favorites yet</h3>
        <p>Tracks you like will appear here</p>
        <router-link to="/search" class="btn btn-secondary">Discover Music</router-link>
      </div>
    </div>

    <div v-if="activeTab === 'playlists'" class="playlists-section">
      <div v-if="libraryStore.loading" class="loading">
        <div class="spinner"></div>
      </div>
      
      <div v-else-if="libraryStore.playlists.length > 0" class="playlists-grid">
        <div 
          v-for="playlist in libraryStore.playlists" 
          :key="playlist.id" 
          class="playlist-card"
          @click="router.push(`/playlist/${playlist.id}`)"
        >
          <div class="playlist-image">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <div class="playlist-info">
            <h3 class="playlist-name">{{ playlist.name }}</h3>
            <p class="playlist-count">{{ playlist.description || 'No description' }}</p>
          </div>
          <button 
            class="delete-btn" 
            @click.stop="deletePlaylist(playlist.id)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
        <h3>No playlists yet</h3>
        <p>Create your first playlist</p>
        <button class="btn btn-secondary" @click="showCreateModal = true">Create Playlist</button>
      </div>
    </div>

    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal">
        <h2>Create Playlist</h2>
        <input
          v-model="newPlaylistName"
          type="text"
          class="input"
          placeholder="Playlist name"
        />
        <input
          v-model="newPlaylistDesc"
          type="text"
          class="input"
          placeholder="Description (optional)"
        />
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="showCreateModal = false">Cancel</button>
          <button class="btn btn-primary" @click="createPlaylist" :disabled="!newPlaylistName.trim()">
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLibraryStore } from '../stores/library'
import TrackCard from '../components/TrackCard.vue'

const router = useRouter()
const libraryStore = useLibraryStore()

const activeTab = ref('favorites')
const showCreateModal = ref(false)
const newPlaylistName = ref('')
const newPlaylistDesc = ref('')

function convertFavoriteToTrack(favorite) {
  return {
    id: favorite.track_id,
    name: favorite.track_name,
    artists: [{ name: favorite.artist_name }],
    album: { name: favorite.album_name, images: [{ url: favorite.album_art }] },
    duration_ms: favorite.duration,
    uri: favorite.spotify_uri
  }
}

async function createPlaylist() {
  if (!newPlaylistName.value.trim()) return
  
  const playlist = await libraryStore.createPlaylist(newPlaylistName.value, newPlaylistDesc.value)
  if (playlist) {
    showCreateModal.value = false
    newPlaylistName.value = ''
    newPlaylistDesc.value = ''
    router.push(`/playlist/${playlist.id}`)
  }
}

async function deletePlaylist(id) {
  if (confirm('Delete this playlist?')) {
    await libraryStore.deletePlaylist(id)
  }
}

onMounted(() => {
  libraryStore.fetchFavorites()
  libraryStore.fetchPlaylists()
})
</script>

<style scoped>
.library-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.library-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.page-title {
  font-size: 40px;
}

.library-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 16px;
}

.tab {
  padding: 12px 24px;
  color: var(--text-secondary);
  font-weight: 500;
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
}

.tab:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.tab.active {
  color: var(--accent-primary);
  background: rgba(0, 212, 170, 0.1);
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

.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.playlist-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.playlist-card:hover {
  background: var(--bg-tertiary);
}

.playlist-image {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary));
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);
  flex-shrink: 0;
}

.playlist-info {
  flex: 1;
  min-width: 0;
}

.playlist-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.playlist-count {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  border-radius: 50%;
  transition: all var(--transition-normal);
  opacity: 0;
}

.playlist-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: var(--error);
  background: rgba(255, 71, 87, 0.1);
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  color: var(--text-muted);
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 20px;
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 32px;
  width: 100%;
  max-width: 400px;
}

.modal h2 {
  font-size: 24px;
  margin-bottom: 24px;
}

.modal .input {
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}
</style>
