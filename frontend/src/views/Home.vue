<template>
  <div class="home">
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          Discover Your <span class="text-gradient">Perfect Sound</span>
        </h1>
        <p class="hero-subtitle">
          Stream millions of tracks from YouTube and Jamendo. Search, play, and create your perfect playlist.
        </p>
        <div class="hero-actions">
          <router-link to="/search" class="btn btn-primary">Start Exploring</router-link>
          <button v-if="authStore.isAuthenticated" @click="router.push('/library')" class="btn btn-secondary">
            Your Library
          </button>
        </div>
      </div>
      <div class="hero-visual">
        <div class="floating-cards">
          <div class="float-card" v-for="(card, i) in floatingCards" :key="i" :style="card.style">
            <img :src="card.image" :alt="card.title" />
          </div>
        </div>
      </div>
    </section>

    <section class="trending-section" v-if="popularTracks.length > 0">
      <div class="section-header">
        <h2 class="section-title">🔥 Trending Now</h2>
        <router-link to="/search" class="see-all">See all</router-link>
      </div>
      <div class="tracks-grid">
        <TrackCard 
          v-for="track in popularTracks.slice(0, 5)" 
          :key="track.id" 
          :track="track"
        />
      </div>
    </section>

    <section class="trending-section" v-if="trendingVideos.length > 0">
      <div class="section-header">
        <h2 class="section-title">🎬 Popular Videos</h2>
        <router-link to="/search" class="see-all">See all</router-link>
      </div>
      <div class="youtube-grid">
        <YouTubeCard 
          v-for="video in trendingVideos.slice(0, 4)" 
          :key="video.id" 
          :video="video"
        />
      </div>
    </section>

    <section class="features-section">
      <h2 class="section-title">Powered By</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon youtube">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
            </svg>
          </div>
          <h3>YouTube</h3>
          <p>Millions of music videos and songs</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon jamendo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <h3>Jamendo</h3>
          <p>Free independent music streaming</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon musicbrainz">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="4" fill="var(--bg-primary)"/>
            </svg>
          </div>
          <h3>MusicBrainz</h3>
          <p>Rich music metadata database</p>
        </div>
      </div>
    </section>

    <section v-if="authStore.isAuthenticated && libraryStore.favorites.length > 0" class="library-preview">
      <div class="section-header">
        <h2 class="section-title">❤️ Your Favorites</h2>
        <router-link to="/library" class="see-all">See all</router-link>
      </div>
      <div class="tracks-grid">
        <TrackCard 
          v-for="track in libraryStore.favorites.slice(0, 5)" 
          :key="track.id" 
          :track="convertFavoriteToTrack(track)"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { useLibraryStore } from '../stores/library'
import TrackCard from '../components/TrackCard.vue'
import YouTubeCard from '../components/YouTubeCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const libraryStore = useLibraryStore()

const popularTracks = ref([])
const trendingVideos = ref([])
const loading = ref(true)

const floatingCards = ref([
  { image: 'https://picsum.photos/seed/album1/200', style: { transform: 'rotate(-10deg) translateY(20px)' } },
  { image: 'https://picsum.photos/seed/album2/200', style: { transform: 'rotate(5deg) translateY(-30px)' } },
  { image: 'https://picsum.photos/seed/album3/200', style: { transform: 'rotate(-5deg) translateY(10px)' } },
  { image: 'https://picsum.photos/seed/album4/200', style: { transform: 'rotate(10deg) translateY(-20px)' } }
])

function convertFavoriteToTrack(favorite) {
  return {
    id: favorite.track_id,
    name: favorite.track_name,
    artist_name: favorite.artist_name,
    album: { name: favorite.album_name, images: [{ url: favorite.album_art }] },
    duration_ms: favorite.duration,
    stream_url: favorite.stream_url,
    image: favorite.album_art
  }
}

async function fetchTrending() {
  try {
    const [jamendoRes, youtubeRes] = await Promise.all([
      axios.get('/api/music/popular?limit=10'),
      axios.get('/api/music/youtube/popular?limit=6')
    ])
    popularTracks.value = jamendoRes.data
    trendingVideos.value = youtubeRes.data
  } catch (err) {
    console.error('Failed to fetch trending:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTrending()
  if (authStore.isAuthenticated) {
    libraryStore.fetchFavorites()
  }
})
</script>

<style scoped>
.home {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 60px 0;
}

.hero-title {
  font-size: 56px;
  line-height: 1.1;
  margin-bottom: 24px;
}

.hero-subtitle {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: 36px;
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.hero-visual {
  position: relative;
  height: 400px;
}

.floating-cards {
  position: relative;
  width: 100%;
  height: 100%;
}

.float-card {
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.float-card:nth-child(1) { left: 0; top: 10%; }
.float-card:nth-child(2) { right: 0; top: 0; }
.float-card:nth-child(3) { left: 20%; top: 50%; }
.float-card:nth-child(4) { right: 10%; top: 60%; }

.float-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trending-section {
  padding: 40px 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-title {
  font-size: 32px;
}

.see-all {
  color: var(--accent-primary);
  font-weight: 500;
}

.tracks-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.youtube-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.features-section {
  padding: 60px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  padding: 32px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  text-align: center;
  transition: all var(--transition-normal);
}

.feature-card:hover {
  border-color: var(--accent-primary);
  transform: translateY(-4px);
}

.feature-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.feature-icon.youtube {
  background: rgba(255, 0, 0, 0.15);
  color: #ff0000;
}

.feature-icon.jamendo {
  background: rgba(255, 107, 157, 0.15);
  color: #ff6b9d;
}

.feature-icon.musicbrainz {
  background: rgba(124, 92, 255, 0.15);
  color: #7c5cff;
}

.feature-card h3 {
  font-size: 20px;
  margin-bottom: 12px;
}

.feature-card p {
  color: var(--text-secondary);
  font-size: 14px;
}

.library-preview {
  padding: 60px 0;
}

@media (max-width: 1024px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-subtitle {
    margin-left: auto;
    margin-right: auto;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .hero-visual {
    display: none;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
