import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

let globalAudioElement = null
let globalYouTubePlayer = null

export const usePlayerStore = defineStore('player', () => {
  const currentTrack = ref(null)
  const currentVideo = ref(null)
  const queue = ref([])
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.8)
  const isShuffle = ref(false)
  const repeatMode = ref('none')
  const audioElement = ref(null)
  const audioFeatures = ref(null)
  const isYouTube = ref(false)

  function setGlobalAudioElement(el) {
    globalAudioElement = el
    audioElement.value = el
  }

  function setGlobalYouTubePlayer(player) {
    globalYouTubePlayer = player
  }

  const progress = computed(() => {
    if (!duration.value) return 0
    return (currentTime.value / duration.value) * 100
  })

  const formattedCurrentTime = computed(() => formatTime(currentTime.value))
  const formattedDuration = computed(() => formatTime(duration.value))

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  function initAudio() {
    if (!audioElement.value && !globalAudioElement) {
      audioElement.value = new Audio()
      globalAudioElement = audioElement.value
      audioElement.value.volume = volume.value
      
      audioElement.value.addEventListener('timeupdate', () => {
        currentTime.value = audioElement.value.currentTime
      })
      
      audioElement.value.addEventListener('loadedmetadata', () => {
        duration.value = audioElement.value.duration
      })
      
      audioElement.value.addEventListener('ended', () => {
        if (repeatMode.value === 'one') {
          audioElement.value.currentTime = 0
          audioElement.value.play()
        } else {
          playNext()
        }
      })
    } else if (globalAudioElement) {
      audioElement.value = globalAudioElement
    }
  }

  function playTrack(track, features = null) {
    initAudio()
    stopYouTube()
    currentTrack.value = track
    currentVideo.value = null
    isYouTube.value = false
    audioFeatures.value = features
    
    const streamUrl = track.stream_url || track.preview_url
    if (streamUrl && audioElement.value) {
      audioElement.value.src = streamUrl
      audioElement.value.play()
      isPlaying.value = true
    }
  }

  function playYouTubeVideo(video) {
    if (globalAudioElement) {
      globalAudioElement.pause()
    }
    if (currentVideo.value && globalYouTubePlayer && globalYouTubePlayer.stopVideo) {
      globalYouTubePlayer.stopVideo()
    }
    currentVideo.value = video
    currentTrack.value = null
    isYouTube.value = true
    isPlaying.value = true
    duration.value = 0
    currentTime.value = 0
    
    if (globalYouTubePlayer && globalYouTubePlayer.getDuration) {
      setTimeout(() => {
        const dur = globalYouTubePlayer.getDuration()
        if (dur) duration.value = dur
      }, 1000)
    }
  }

  function clearYouTubeVideo() {
    if (globalYouTubePlayer && globalYouTubePlayer.stopVideo) {
      globalYouTubePlayer.stopVideo()
    }
    currentVideo.value = null
    isYouTube.value = false
    isPlaying.value = false
  }

  function stopYouTube() {
    if (globalYouTubePlayer && globalYouTubePlayer.stopVideo) {
      globalYouTubePlayer.stopVideo()
    }
  }

  function stopAudio() {
    if (audioElement.value) {
      audioElement.value.pause()
      audioElement.value.currentTime = 0
    }
    isPlaying.value = false
  }

  function togglePlay() {
    if (!currentTrack.value && !currentVideo.value) return
    
    if (isYouTube.value) {
      if (globalYouTubePlayer && globalYouTubePlayer.playVideo) {
        if (isPlaying.value) {
          globalYouTubePlayer.pauseVideo()
        } else {
          globalYouTubePlayer.playVideo()
        }
      }
      isPlaying.value = !isPlaying.value
      return
    }
    
    if (!audioElement.value) return
    
    if (isPlaying.value) {
      audioElement.value.pause()
    } else {
      audioElement.value.play()
    }
    isPlaying.value = !isPlaying.value
  }

  function seek(time) {
    if (isYouTube.value) {
      if (globalYouTubePlayer && globalYouTubePlayer.seekTo) {
        globalYouTubePlayer.seekTo(time)
      }
      currentTime.value = time
      return
    }
    if (!audioElement.value) return
    audioElement.value.currentTime = time
    currentTime.value = time
  }

  function seekPercent(percent) {
    const time = (percent / 100) * duration.value
    seek(time)
  }

  function setVolume(val) {
    volume.value = val
    if (audioElement.value && !isYouTube.value) {
      audioElement.value.volume = val
    }
    if (globalYouTubePlayer && isYouTube.value) {
      globalYouTubePlayer.setVolume(val * 100)
    }
  }

  function addToQueue(track) {
    queue.value.push(track)
  }

  function playNext() {
    if (queue.value.length === 0) {
      if (repeatMode.value === 'all') {
        currentTime.value = 0
        if (audioElement.value) audioElement.value.currentTime = 0
        isPlaying.value = false
        togglePlay()
      } else {
        isPlaying.value = false
      }
      return
    }
    
    const nextTrack = isShuffle.value 
      ? queue.value[Math.floor(Math.random() * queue.value.length)]
      : queue.value.shift()
    
    if (nextTrack.source === 'youtube' || nextTrack.id?.startsWith && nextTrack.id.startsWith('youtube:')) {
      playYouTubeVideo(nextTrack)
    } else {
      playTrack(nextTrack)
    }
  }

  function updateYouTubeTime() {
    if (isYouTube.value && globalYouTubePlayer && globalYouTubePlayer.getCurrentTime) {
      currentTime.value = globalYouTubePlayer.getCurrentTime() || 0
    }
  }

  function playPrevious() {
    if (isYouTube.value) {
      if (currentTime.value > 3) {
        if (globalYouTubePlayer && globalYouTubePlayer.seekTo) {
          globalYouTubePlayer.seekTo(0)
        }
        currentTime.value = 0
      } else if (queue.value.length > 0) {
        playNext()
      }
      return
    }
    
    if (!audioElement.value) return
    
    if (currentTime.value > 3) {
      audioElement.value.currentTime = 0
    } else if (queue.value.length > 0) {
      playNext()
    }
  }

  function toggleShuffle() {
    isShuffle.value = !isShuffle.value
  }

  function cycleRepeat() {
    const modes = ['none', 'all', 'one']
    const currentIndex = modes.indexOf(repeatMode.value)
    repeatMode.value = modes[(currentIndex + 1) % modes.length]
  }

  function clearQueue() {
    queue.value = []
  }

  return {
    currentTrack,
    currentVideo,
    queue,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffle,
    repeatMode,
    isYouTube,
    progress,
    formattedCurrentTime,
    formattedDuration,
    audioFeatures,
    setGlobalAudioElement,
    setGlobalYouTubePlayer,
    playTrack,
    playYouTubeVideo,
    clearYouTubeVideo,
    stopYouTube,
    stopAudio,
    togglePlay,
    seek,
    seekPercent,
    setVolume,
    addToQueue,
    playNext,
    playPrevious,
    toggleShuffle,
    cycleRepeat,
    clearQueue,
    updateYouTubeTime
  }
})
