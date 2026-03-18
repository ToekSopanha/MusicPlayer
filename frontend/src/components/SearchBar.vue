<template>
  <div class="search-bar">
    <input
      v-model="query"
      type="text"
      class="search-input"
      placeholder="Search tracks, albums, artists..."
      @keyup.enter="handleSearch"
    />
    <button class="search-btn" @click="handleSearch">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const query = ref('')

function handleSearch() {
  if (query.value.trim()) {
    router.push({ name: 'Search', query: { q: query.value } })
  }
}
</script>

<style scoped>
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 280px;
  padding: 12px 48px 12px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  color: var(--text-primary);
  font-size: 14px;
  transition: all var(--transition-normal);
}

.search-input:focus {
  width: 360px;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.15);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-btn {
  position: absolute;
  right: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  border-radius: 50%;
  transition: all var(--transition-normal);
}

.search-btn:hover {
  color: var(--accent-primary);
  background: var(--bg-tertiary);
}

@media (max-width: 768px) {
  .search-input {
    width: 200px;
  }
  
  .search-input:focus {
    width: 240px;
  }
}
</style>
