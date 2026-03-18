<template>
  <header class="header">
    <div class="header-content">
      <router-link to="/" class="logo">
        <span class="logo-icon">🎵</span>
        <span class="logo-text">LessTone</span>
      </router-link>

      <nav class="nav">
        <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
          Home
        </router-link>
        <router-link to="/search" class="nav-link" :class="{ active: $route.path === '/search' }">
          Search
        </router-link>
        <router-link v-if="authStore.isAuthenticated" to="/library" class="nav-link" :class="{ active: $route.path === '/library' }">
          Library
        </router-link>
      </nav>

      <div class="header-actions">
        <SearchBar v-if="showSearch" />
        
        <template v-if="authStore.isAuthenticated">
          <router-link to="/library" class="user-btn">
            <div class="user-avatar">{{ authStore.user?.username?.[0]?.toUpperCase() }}</div>
          </router-link>
          <button @click="handleLogout" class="btn btn-ghost">Logout</button>
        </template>
        <template v-else>
          <router-link to="/login" class="btn btn-primary">Sign In</router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import SearchBar from './SearchBar.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const showSearch = computed(() => route.path !== '/search')

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(10, 10, 15, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  text-decoration: none;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav {
  display: flex;
  gap: 8px;
}

.nav-link {
  padding: 10px 20px;
  color: var(--text-secondary);
  font-weight: 500;
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.nav-link.active {
  color: var(--accent-primary);
  background: rgba(0, 212, 170, 0.1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-btn {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: var(--bg-primary);
}

@media (max-width: 768px) {
  .nav {
    display: none;
  }
  
  .logo-text {
    display: none;
  }
}
</style>
