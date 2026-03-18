<template>
  <div class="app">
    <Header />
    <main class="main-content">
      <router-view />
    </main>
    <MusicPlayer v-if="playerStore.currentTrack && !playerStore.isYouTube" />
    <YouTubePlayer v-if="playerStore.currentVideo" :video="playerStore.currentVideo" />
    <div ref="audioRef" style="display: none;"></div>
    <div ref="youtubeContainer" id="youtube-player-container" style="display: none;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { usePlayerStore } from './stores/player'
import Header from './components/Header.vue'
import MusicPlayer from './components/MusicPlayer.vue'
import YouTubePlayer from './components/YouTubePlayer.vue'

const playerStore = usePlayerStore()
const audioRef = ref(null)
const youtubeContainer = ref(null)
let youTubePlayer = null
let ytReady = false

function loadYouTubeAPI() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve()
      return
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    window.onYouTubeIframeAPIReady = () => {
      resolve()
    }
  })
}

async function initYouTubePlayer(videoId) {
  await loadYouTubeAPI()
  if (youTubePlayer) {
    youTubePlayer.loadVideoById({videoId: videoId})
    return
  }
  youTubePlayer = new window.YT.Player('youtube-player-container', {
    height: '1',
    width: '1',
    videoId: videoId,
    playerVars: {
      autoplay: 1,
      mute: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
      playsinline: 1
    },
    events: {
      onReady: (event) => {
        ytReady = true
        event.target.playVideo()
        event.target.unmute()
        event.target.setVolume(playerStore.volume * 100)
      },
      onStateChange: (event) => {
        if (event.data === window.YT.PlayerState.ENDED) {
          playerStore.playNext()
        }
      }
    }
  })
  playerStore.setGlobalYouTubePlayer(youTubePlayer)
}

watch(() => playerStore.currentVideo, async (newVideo) => {
  if (newVideo) {
    const videoId = newVideo.videoId || newVideo.id
    if (videoId) {
      await initYouTubePlayer(videoId)
    }
  }
})

watch(() => playerStore.isPlaying, (playing) => {
  if (youTubePlayer && youTubePlayer.playVideo && ytReady) {
    if (playing) {
      youTubePlayer.playVideo()
    } else {
      youTubePlayer.pauseVideo()
    }
  }
})

onMounted(() => {
  const audio = new Audio()
  playerStore.setGlobalAudioElement(audio)
  
  setInterval(() => {
    playerStore.updateYouTubeTime()
  }, 1000)
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 90px;
}

.main-content {
  flex: 1;
  padding-top: 80px;
}
</style>
