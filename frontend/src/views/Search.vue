<template>
  <div class="search-page">
    <div class="search-header">
      <h1 class="page-title">Search</h1>
      <div class="search-box">
        <input
          v-model="query"
          type="text"
          class="search-input"
          placeholder="Search for music..."
          @keyup.enter="performSearch"
        />
        <button class="btn btn-primary" @click="performSearch">Search</button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Searching...</p>
    </div>

    <div v-else-if="results" class="results">
      <div class="results-header" v-if="hasAnyResults">
        <h2>Results</h2>
        <span class="result-count">{{ totalResults }} results</span>
      </div>
      
      <div v-if="results.youtube?.length" class="results-section">
        <h3 class="source-title">
          <span class="source-icon youtube"></span>
          YouTube
        </h3>
        <div class="youtube-grid">
          <YouTubeCard 
            v-for="video in results.youtube" 
            :key="video.id" 
            :video="video"
          />
        </div>
      </div>
        
      <div v-if="results.jamendo?.length" class="results-section">
        <h3 class="source-title">
          <span class="source-icon jamendo"></span>
          Jamendo
        </h3>
        <div class="tracks-list">
          <TrackCard 
            v-for="track in results.jamendo" 
            :key="track.id" 
            :track="track"
          />
        </div>
      </div>

      <div v-if="results.musicbrainz?.length" class="results-section">
        <h3 class="source-title">
          <span class="source-icon musicbrainz"></span>
          MusicBrainz
        </h3>
        <div class="tracks-list">
          <div v-for="track in results.musicbrainz" :key="track.id" class="mb-track">
            <span class="mb-title">{{ track.title }}</span>
            <span class="mb-artist">{{ track.artist }}</span>
          </div>
        </div>
      </div>

      <div v-if="!hasAnyResults" class="empty-state">
        <h3>No results found</h3>
        <p>Try a different search term</p>
      </div>
    </div>

    <div v-else-if="searchHistory.length > 0" class="history-section">
      <div class="history-header">
        <h2>Recent Searches</h2>
        <button class="btn btn-ghost" @click="clearHistory">Clear All</button>
      </div>
      <div class="history-list">
        <div 
          v-for="item in searchHistory" 
          :key="item.id" 
          class="history-item"
          @click="query = item.query; performSearch()"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>{{ item.query }}</span>
          <button class="history-delete" @click.stop="deleteHistoryItem(item.id)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="initial-state">
      <div class="search-illustration">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      <h2>Search for Music</h2>
      <p>Find your favorite songs on YouTube & Jamendo</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import TrackCard from '../components/TrackCard.vue'
import YouTubeCard from '../components/YouTubeCard.vue'
import { usePlayerStore } from '../stores/player'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const playerStore = usePlayerStore()
const authStore = useAuthStore()

const query = ref('')
const results = ref(null)
const loading = ref(false)
const searchHistory = ref([])

const hasAnyResults = computed(() => {
  if (!results.value) return false
  return (results.value.youtube?.length > 0) || 
         (results.value.jamendo?.length > 0) || 
         (results.value.musicbrainz?.length > 0)
})

const totalResults = computed(() => {
  if (!results.value) return 0
  return (results.value.youtube?.length || 0) + 
         (results.value.jamendo?.length || 0) + 
         (results.value.musicbrainz?.length || 0)
})

async function loadSearchHistory() {
  if (!authStore.isAuthenticated) return
  try {
    const response = await axios.get('/api/auth/search-history')
    searchHistory.value = response.data
  } catch (err) {
    console.error('Failed to load search history:', err)
  }
}

async function saveSearchHistory(q) {
  if (!authStore.isAuthenticated || !q.trim()) return
  try {
    await axios.post('/api/auth/search-history', { query: q })
    await loadSearchHistory()
  } catch (err) {
    console.error('Failed to save search history:', err)
  }
}

async function deleteHistoryItem(id) {
  try {
    await axios.delete(`/api/auth/search-history/${id}`)
    await loadSearchHistory()
  } catch (err) {
    console.error('Failed to delete history item:', err)
  }
}

async function clearHistory() {
  try {
    await axios.delete('/api/auth/search-history')
    searchHistory.value = []
  } catch (err) {
    console.error('Failed to clear history:', err)
  }
}

async function performSearch() {
  if (!query.value.trim()) return
  loading.value = true
  results.value = null
  try {
    const response = await axios.get('/api/music/search', {
      params: { q: query.value, type: 'track', limit: 20 }
    })
    results.value = response.data
    await saveSearchHistory(query.value)
  } catch (err) {
    console.error('Search error:', err)
  } finally {
    loading.value = false
  }
}

watch(() => route.query.q, (newQ) => {
  if (newQ) { query.value = newQ; performSearch() }
}, { immediate: true })

onMounted(() => {
  loadSearchHistory()
})
</script>

<style scoped>
.search-page { max-width: 1400px; margin: 0 auto; padding: 40px 24px; }
.search-header { margin-bottom: 40px; }
.page-title { font-size: 40px; margin-bottom: 24px; }
.search-box { display: flex; gap: 12px; }
.search-input { flex: 1; padding: 16px 24px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-full); color: var(--text-primary); font-size: 16px; }
.search-input:focus { border-color: var(--accent-primary); }
.loading { text-align: center; padding: 60px; }
.spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--accent-primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
@keyframes spin { to { transform: rotate(360deg); } }
.results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.results-header h2 { font-size: 28px; }
.result-count { color: var(--text-secondary); }
.source-title { display: flex; align-items: center; gap: 10px; font-size: 18px; margin-bottom: 16px; margin-top: 32px; }
.source-icon { width: 12px; height: 12px; border-radius: 50%; }
.source-icon.youtube { background: #ff0000; }
.source-icon.jamendo { background: #ff6b9d; }
.source-icon.musicbrainz { background: #7c5cff; }
.youtube-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.tracks-list { display: flex; flex-direction: column; gap: 4px; }
.mb-track { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; padding: 14px 16px; background: var(--bg-secondary); border-radius: var(--radius-md); font-size: 14px; }
.mb-title { font-weight: 500; }
.mb-artist { color: var(--text-secondary); }
.empty-state, .initial-state { text-align: center; padding: 80px 20px; }
.initial-state h2, .empty-state h3 { font-size: 24px; margin-bottom: 12px; }
.initial-state p, .empty-state p { color: var(--text-secondary); }
.search-illustration { color: var(--text-muted); margin-bottom: 24px; }
.history-section { margin-top: 20px; }
.history-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.history-header h2 { font-size: 24px; }
.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: var(--bg-secondary); border-radius: var(--radius-md); cursor: pointer; transition: all var(--transition-normal); }
.history-item:hover { background: var(--bg-tertiary); }
.history-item svg { color: var(--text-secondary); flex-shrink: 0; }
.history-item span { flex: 1; }
.history-delete { padding: 4px; color: var(--text-secondary); border-radius: var(--radius-sm); opacity: 0; transition: opacity var(--transition-normal); }
.history-item:hover .history-delete { opacity: 1; }
.history-delete:hover { color: var(--text-primary); background: var(--bg-tertiary); }
.btn-ghost { background: transparent; color: var(--text-secondary); padding: 8px 16px; }
.btn-ghost:hover { color: var(--text-primary); }
@media (max-width: 768px) { .search-box { flex-direction: column; } .youtube-grid { grid-template-columns: 1fr; } }
</style>
