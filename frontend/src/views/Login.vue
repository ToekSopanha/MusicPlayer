<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <span class="logo-icon">🎵</span>
          <span class="logo-text">LessTone</span>
        </div>
        <h1>{{ isLogin ? 'Welcome back' : 'Create account' }}</h1>
        <p>{{ isLogin ? 'Sign in to continue' : 'Start your music journey' }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div v-if="!isLogin" class="form-group">
          <label>Username</label>
          <input
            v-model="username"
            type="text"
            class="input"
            placeholder="Choose a username"
            required
          />
        </div>
        
        <div class="form-group">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            class="input"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div class="form-group">
          <label>Password</label>
          <input
            v-model="password"
            type="password"
            class="input"
            placeholder="Enter your password"
            required
          />
        </div>

        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>

        <button 
          type="submit" 
          class="btn btn-primary btn-full" 
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account') }}
        </button>
      </form>

      <div class="login-footer">
        <p>
          {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
          <button @click="toggleMode" class="link-btn">
            {{ isLogin ? 'Sign up' : 'Sign in' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLogin = ref(true)
const username = ref('')
const email = ref('')
const password = ref('')

function toggleMode() {
  isLogin.value = !isLogin.value
  authStore.error = null
}

async function handleSubmit() {
  let success
  
  if (isLogin.value) {
    success = await authStore.login(email.value, password.value)
  } else {
    success = await authStore.register(username.value, email.value, password.value)
  }
  
  if (success) {
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  }
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 24px;
}

.logo-icon {
  font-size: 32px;
}

.logo-text {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.login-header p {
  color: var(--text-secondary);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.error-message {
  padding: 12px;
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.3);
  border-radius: var(--radius-md);
  color: var(--error);
  font-size: 14px;
}

.btn-full {
  width: 100%;
  padding: 16px;
  font-size: 16px;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
}

.login-footer p {
  color: var(--text-secondary);
  font-size: 14px;
}

.link-btn {
  color: var(--accent-primary);
  font-weight: 600;
  margin-left: 4px;
}

.link-btn:hover {
  text-decoration: underline;
}
</style>
