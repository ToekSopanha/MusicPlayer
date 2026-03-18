<template>
  <div class="audio-visualizer">
    <canvas ref="canvasRef" class="visualizer-canvas"></canvas>
    <div v-if="features" class="features-display">
      <div class="feature-item">
        <span class="feature-label">Tempo</span>
        <span class="feature-value">{{ Math.round(features.tempo) }} BPM</span>
      </div>
      <div class="feature-item">
        <span class="feature-label">Energy</span>
        <div class="feature-bar">
          <div class="feature-fill" :style="{ width: (features.energy * 100) + '%' }"></div>
        </div>
      </div>
      <div class="feature-item">
        <span class="feature-label">Danceability</span>
        <div class="feature-bar">
          <div class="feature-fill" :style="{ width: (features.danceability * 100) + '%' }"></div>
        </div>
      </div>
      <div class="feature-item">
        <span class="feature-label">Valence</span>
        <div class="feature-bar">
          <div class="feature-fill" :style="{ width: (features.valence * 100) + '%' }"></div>
        </div>
      </div>
      <div class="feature-item">
        <span class="feature-label">Acousticness</span>
        <div class="feature-bar">
          <div class="feature-fill" :style="{ width: (features.acousticness * 100) + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  features: {
    type: Object,
    default: null
  },
  isPlaying: {
    type: Boolean,
    default: false
  }
})

const canvasRef = ref(null)
let animationId = null

function drawBars() {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  
  ctx.clearRect(0, 0, width, height)
  
  const barCount = 32
  const barWidth = width / barCount - 2
  
  for (let i = 0; i < barCount; i++) {
    const barHeight = props.isPlaying 
      ? Math.random() * height * 0.8 + height * 0.1
      : height * 0.1
    
    const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight)
    gradient.addColorStop(0, '#00d4aa')
    gradient.addColorStop(0.5, '#7c5cff')
    gradient.addColorStop(1, '#ff6b9d')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.roundRect(i * (barWidth + 2), height - barHeight, barWidth, barHeight, 2)
    ctx.fill()
  }
  
  animationId = requestAnimationFrame(drawBars)
}

onMounted(() => {
  if (canvasRef.value) {
    canvasRef.value.width = canvasRef.value.offsetWidth
    canvasRef.value.height = 100
    drawBars()
  }
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})

watch(() => props.isPlaying, (playing) => {
  if (playing && !animationId) {
    drawBars()
  }
})
</script>

<style scoped>
.audio-visualizer {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.visualizer-canvas {
  width: 100%;
  height: 100px;
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
}

.features-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.feature-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.feature-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-primary);
}

.feature-bar {
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.feature-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-tertiary));
  border-radius: 3px;
  transition: width 0.3s ease;
}
</style>
