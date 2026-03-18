<template>
  <div class="album-card">
    <div class="album-image">
      <img 
        :src="album.images?.[0]?.url || album.image || '/placeholder-album.png'" 
        :alt="album.name"
      />
      <div class="album-overlay">
        <button class="play-btn" @click="handlePlay">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="album-info">
      <h3 class="album-title">{{ album.name }}</h3>
      <p class="album-artist">{{ album.artists?.[0]?.name || album.artist_name }}</p>
      <p v-if="album.year || album.release_date" class="album-year">
        {{ album.year || album.release_date?.substring(0, 4) }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { usePlayerStore } from '../stores/player'

const props = defineProps({
  album: {
    type: Object,
    required: true
  }
})

const playerStore = usePlayerStore()

function handlePlay() {
  // Could implement album playback
  console.log('Play album:', props.album.name)
}
</script>

<style scoped>
.album-card {
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.album-card:hover {
  background: var(--bg-tertiary);
  transform: translateY(-4px);
}

.album-card:hover .album-overlay {
  opacity: 1;
}

.album-image {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 16px;
}

.album-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.album-overlay .play-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-primary);
  color: var(--bg-primary);
  border-radius: 50%;
  box-shadow: 0 8px 20px rgba(0, 212, 170, 0.4);
  transition: transform var(--transition-normal);
}

.album-card:hover .play-btn {
  transform: translateY(0);
}

.album-info {
  min-width: 0;
}

.album-title {
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.album-artist {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-year {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}
</style>
