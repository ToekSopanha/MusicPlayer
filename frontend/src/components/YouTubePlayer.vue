<template>
  <div class="music-player">
    <div class="player-content">
      <div class="track-info" v-if="playerStore.currentVideo">
        <img 
          :src="playerStore.currentVideo.thumbnail || playerStore.currentVideo.image || playerStore.currentVideo.image" 
          :alt="playerStore.currentVideo.title || playerStore.currentVideo.name"
          class="track-art"
        />
        <div class="track-details">
          <div class="track-name">{{ playerStore.currentVideo.title || playerStore.currentVideo.name }}</div>
          <div class="track-artist">
            {{ playerStore.currentVideo.channelTitle || playerStore.currentVideo.artist_name }}
          </div>
        </div>
      </div>
      
      <div class="player-controls">
        <div class="controls-buttons">
          <button class="control-btn" @click="playerStore.playPrevious">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          
          <button class="play-btn" @click="playerStore.togglePlay">
            <svg v-if="!playerStore.isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
            </svg>
          </button>
          
          <button class="control-btn" @click="playerStore.playNext">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
        </div>
        
        <div class="progress-container">
          <span class="time">{{ playerStore.formattedCurrentTime }}</span>
          <div class="progress-bar" @click="handleProgressClick">
            <div class="progress-fill" :style="{ width: playerStore.progress + '%' }"></div>
          </div>
          <span class="time">{{ playerStore.formattedDuration }}</span>
        </div>
      </div>
      
      <div class="player-extra">
        <div class="volume-control">
          <button class="control-btn" @click="toggleMute">
            <svg v-if="playerStore.volume === 0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            :value="playerStore.volume"
            @input="handleVolumeChange"
            class="volume-slider"
          />
        </div>
        
        <button class="control-btn" @click="playerStore.clearYouTubeVideo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePlayerStore } from '../stores/player'

const playerStore = usePlayerStore()
const previousVolume = ref(0.8)

function handleProgressClick(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const percent = ((e.clientX - rect.left) / rect.width) * 100
  playerStore.seekPercent(percent)
}

function handleVolumeChange(e) {
  playerStore.setVolume(parseFloat(e.target.value))
}

function toggleMute() {
  if (playerStore.volume > 0) {
    previousVolume.value = playerStore.volume
    playerStore.setVolume(0)
  } else {
    playerStore.setVolume(previousVolume.value)
  }
}
</script>

<style scoped>
.music-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 90px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  z-index: 200;
}

.player-content {
  max-width: 1400px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.track-info {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 200px;
  max-width: 300px;
}

.track-art {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.track-details {
  overflow: hidden;
}

.track-name {
  font-weight: 600;
  font-size: 14px;
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

.player-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 600px;
}

.controls-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.control-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  border-radius: 50%;
  transition: all var(--transition-normal);
}

.control-btn:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.play-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--text-primary);
  color: var(--bg-primary);
  border-radius: 50%;
  transition: all var(--transition-normal);
}

.play-btn:hover {
  transform: scale(1.08);
}

.progress-container {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
}

.time {
  font-size: 12px;
  color: var(--text-muted);
  min-width: 40px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}

.progress-bar:hover {
  height: 6px;
}

.progress-fill {
  height: 100%;
  background: var(--accent-primary);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.player-extra {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 200px;
  justify-content: flex-end;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-slider {
  width: 100px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--bg-tertiary);
  border-radius: 2px;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: var(--accent-primary);
  border-radius: 50%;
  cursor: pointer;
}

@media (max-width: 768px) {
  .player-content {
    padding: 0 12px;
  }
  
  .track-info {
    min-width: auto;
    max-width: 120px;
  }
  
  .player-extra {
    display: none;
  }
}
</style>
