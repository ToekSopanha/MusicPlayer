# LessTone Music

A full-stack music streaming application built with Vue.js, Node.js, and integrated with Spotify, MusicBrainz, and Jamendo APIs.

## Features

- **Search**: Search tracks, albums, and artists across Spotify and MusicBrainz
- **Streaming**: Stream music via Spotify's preview URLs
- **Audio Analysis**: View audio features (tempo, energy, danceability) from Spotify
- **Library**: Save favorite tracks and create playlists
- **Authentication**: User registration and login with JWT

## Tech Stack

### Backend
- Node.js + Express
- SQLite (better-sqlite3)
- JWT Authentication

### Frontend
- Vue.js 3 (Composition API)
- Pinia (State Management)
- Vite

### APIs
- **Spotify Web API** - Streaming and audio features
- **MusicBrainz** - Music metadata
- **Jamendo** - Audio analysis

## Setup

### Prerequisites
- Node.js 18+
- Spotify Developer Account
- Jamendo Developer Account

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure API Keys

Edit `backend/.env`:

```
# Spotify (https://developer.spotify.com/dashboard)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Jamendo (https://developer.jamendo.com/)
JAMENDO_CLIENT_ID=your_jamendo_client_id

# JWT Secret
JWT_SECRET=your_secret_key
```

### 3. Run the Application

```bash
# Start backend (Terminal 1)
cd backend
npm run dev

# Start frontend (Terminal 2)
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## Project Structure

```
Music_Webapp/
├── backend/
│   ├── src/
│   │   ├── config/      # Database config
│   │   ├── middleware/  # Auth middleware
│   │   ├── routes/     # API routes
│   │   ├── services/   # API integrations
│   │   └── index.js    # Server entry
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── assets/     # Styles
│   │   ├── components/ # Vue components
│   │   ├── views/      # Page views
│   │   ├── stores/     # Pinia stores
│   │   └── router/     # Vue Router
│   └── package.json
└── SPEC.md             # Project specification
```

## License

MIT
