<template>
  <div class="track-card" @click="handlePlay">
    <div class="track-image">
      <img 
        :src="track.image || track.album?.images?.[0]?.url || '/placeholder-album.png'" 
        :alt="track.name"
      />
      <div class="track-overlay">
        <button class="play-btn" @click.stop="handlePlay">
          <svg v-if="!isCurrentTrack || !playerStore.isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="track-info">
      <h3 class="track-title">{{ track.name }}</h3>
      <p class="track-artist">{{ track.artists?.[0]?.name || track.artist_name }}</p>
    </div>
    <div class="track-actions">
      <button 
        class="action-btn" 
        :class="{ active: isFavorite }"
        @click.stop="toggleFavorite"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
      <div class="dropdown" @click.stop>
        <button class="action-btn" @click="toggleDropdown">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="12" cy="19" r="2"/>
          </svg>
        </button>
        <div v-if="showOptions" class="dropdown-menu" @click.stop>
          <div 
            v-for="playlist in libraryStore.playlists" 
            :key="playlist.id"
            class="dropdown-item"
            @click="addToPlaylist(playlist.id)"
          >
            {{ playlist.name }}
          </div>
          <div v-if="libraryStore.playlists.length === 0" class="dropdown-item disabled">
            No playlists yet
          </div>
        </div>
      </div>
    </div>
    <div class="track-duration">{{ formatDuration(track.duration_ms || track.duration) }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePlayerStore } from '../stores/player'
import { useLibraryStore } from '../stores/library'
import axios from 'axios'

const props = defineProps({
  track: {
    type: Object,
    required: true
  }
})

const playerStore = usePlayerStore()
const libraryStore = useLibraryStore()

const showOptions = ref(false)

const isCurrentTrack = computed(() => playerStore.currentTrack?.id === props.track.id)
const isFavorite = computed(() => libraryStore.isFavorite(props.track.id))

function handlePlay() {
  playerStore.playTrack(props.track)
}

async function toggleFavorite() {
  if (isFavorite.value) {
    await libraryStore.removeFavorite(props.track.id)
  } else {
    await libraryStore.addFavorite(props.track)
  }
}

async function addToPlaylist(playlistId) {
  try {
    await axios.post(`/api/library/playlists/${playlistId}/tracks`, {
      track_id: props.track.id,
      track_name: props.track.name,
      artist_name: props.track.artists?.[0]?.name || props.track.artist_name,
      album_name: props.track.album?.name || props.track.album_name,
      album_art: props.track.image || props.track.album?.images?.[0]?.url,
      duration: props.track.duration_ms || props.track.duration
    })
    showOptions.value = false
    alert('Added to playlist!')
  } catch (err) {
    console.error('Failed to add to playlist:', err)
    alert('Failed to add to playlist')
  }
}

function formatDuration(ms) {
  if (!ms) return '0:00'
  const seconds = Math.floor(ms / 1000)
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function toggleDropdown() {
  showOptions.value = !showOptions.value
  if (showOptions.value && libraryStore.playlists.length === 0) {
    libraryStore.fetchPlaylists()
  }
}

onMounted(() => {
  libraryStore.fetchPlaylists()
  document.addEventListener('click', () => {
    showOptions.value = false
  })
})
</script>

<style scoped>
.track-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.track-card:hover {
  background: var(--bg-tertiary);
}

.track-card:hover .track-overlay {
  opacity: 1;
}

.track-image {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
}

.track-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.track-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.track-overlay .play-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-primary);
  color: var(--bg-primary);
  border-radius: 50%;
}

.track-info {
  flex: 1;
  min-width: 0;
}

.track-title {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  border-radius: 50%;
  transition: all var(--transition-normal);
}

.action-btn:hover {
  color: var(--text-primary);
  background: var(--bg-elevated);
}

.action-btn.active {
  color: var(--accent-secondary);
}

.track-duration {
  font-size: 12px;
  color: var(--text-muted);
  min-width: 40px;
  text-align: right;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 0;
  min-width: 150px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
}

.dropdown-item:hover {
  background: var(--bg-tertiary);
}

.dropdown-item.disabled {
  color: var(--text-muted);
  cursor: default;
}
</style>
