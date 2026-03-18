<template>
  <div class="youtube-card" @click="handlePlay">
    <div class="card-image">
      <img :src="video.thumbnail || video.image" :alt="video.title || video.name" @error="handleImageError" />
      <div class="play-overlay">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
    </div>
    <div class="card-info">
      <h3 class="card-title">{{ video.title || video.name }}</h3>
      <p class="card-channel">{{ video.channelTitle || video.artist_name }}</p>
      <p class="card-views" v-if="video.viewCount">{{ formatViews(video.viewCount) }}</p>
    </div>
    <div class="card-actions">
      <button class="action-btn" @click.stop="toggleFavorite">
        <svg width="18" height="18" viewBox="0 0 24 24" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '../stores/player'
import { useLibraryStore } from '../stores/library'

const props = defineProps({
  video: { type: Object, required: true }
});

const playerStore = usePlayerStore();
const libraryStore = useLibraryStore();

const isFavorite = computed(() => {
  const id = props.video.id || props.video.videoId
  return libraryStore.isFavorite(id)
})

function handlePlay() {
  playerStore.playYouTubeVideo(props.video);
}

async function toggleFavorite() {
  const video = {
    id: props.video.id || props.video.videoId,
    name: props.video.title || props.video.name,
    artist_name: props.video.channelTitle || props.video.artist_name,
    album_name: 'YouTube',
    album_art: props.video.thumbnail || props.video.image,
    duration_ms: props.video.duration || props.video.duration_ms,
    stream_url: props.video.stream_url
  }
  
  if (isFavorite.value) {
    await libraryStore.removeFavorite(video.id)
  } else {
    await libraryStore.addFavorite(video)
  }
}

function handleImageError(event) {
  event.target.style.display = 'none';
  event.target.parentElement.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>';
  event.target.parentElement.style.background = '#ff0000';
}

function formatViews(views) {
  if (!views) return '';
  const num = parseInt(views);
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num;
}
</script>

<style scoped>
.youtube-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.youtube-card:hover {
  background: var(--bg-tertiary);
  transform: translateY(-2px);
}

.card-image {
  position: relative;
  width: 120px;
  height: 68px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-normal);
  color: white;
}

.youtube-card:hover .play-overlay {
  opacity: 1;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-channel {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.card-views {
  font-size: 11px;
  color: var(--text-muted);
}

.card-actions {
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
</style>
