# LessTone Music - Project Specification

## 1. Project Overview

**Project Name:** LessTone Music  
**Project Type:** Full-stack Music Streaming Web Application  
**Core Functionality:** A music discovery and streaming platform that combines metadata from MusicBrainz, streaming from Spotify, and audio analysis from Jamendo  
**Target Users:** Music enthusiasts who want to discover, stream, and analyze music

---

## 2. Technical Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite (for user data, playlists, favorites)
- **Authentication:** JWT tokens

### Frontend
- **Framework:** Vue.js 3 (Composition API)
- **Build Tool:** Vite
- **State Management:** Pinia
- **HTTP Client:** Axios
- **Styling:** Custom CSS with CSS Variables

### External APIs
- **MusicBrainz API** - Music metadata (artist, album, track info)
- **Spotify Web API** - Music streaming and playback
- **Jamendo API** - Audio analysis and features

---

## 3. UI/UX Specification

### Color Palette
- **Background Primary:** `#0a0a0f` (deep dark)
- **Background Secondary:** `#12121a` (card backgrounds)
- **Background Tertiary:** `#1a1a25` (hover states)
- **Accent Primary:** `#00d4aa` (teal/mint - main accent)
- **Accent Secondary:** `#ff6b9d` (pink - highlights)
- **Accent Tertiary:** `#7c5cff` (purple - secondary actions)
- **Text Primary:** `#ffffff`
- **Text Secondary:** `#a0a0b0`
- **Text Muted:** `#606070`
- **Border:** `#2a2a35`
- **Success:** `#00d4aa`
- **Error:** `#ff4757`

### Typography
- **Primary Font:** 'Outfit', sans-serif (headings)
- **Secondary Font:** 'DM Sans', sans-serif (body)
- **Font Sizes:**
  - Hero Title: 56px
  - Section Title: 32px
  - Card Title: 18px
  - Body: 14px
  - Small: 12px

### Layout Structure

#### Header
- Logo (left) - "LessTone" with musical note icon
- Navigation: Home, Search, Library
- Search bar (center)
- User menu (right) - Login/Profile

#### Main Content Areas
- Hero section with featured content
- Search results grid
- Track/Album/Artist cards
- Playlist view

#### Music Player (Fixed Bottom)
- Track info (artwork, title, artist)
- Playback controls (prev, play/pause, next)
- Progress bar with time
- Volume control
- Queue button

#### Responsive Breakpoints
- Mobile: < 768px (single column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (4-6 columns)

### Components

#### Track Card
- Album artwork (square, rounded corners 8px)
- Track title (truncate with ellipsis)
- Artist name
- Duration
- Play button overlay on hover
- Add to playlist button

#### Album Card
- Album artwork (larger)
- Album title
- Artist name
- Year, track count

#### Artist Card
- Circular artist image
- Artist name
- Follow button

#### Search Bar
- Rounded input with icon
- Live search suggestions
- Filter dropdown (tracks, albums, artists)

#### Audio Visualizer
- Waveform display using Jamendo audio data
- Animated bars synced to music

---

## 4. Functionality Specification

### Authentication
- User registration (email, username, password)
- User login with JWT
- Session persistence
- Logout functionality

### Search & Discovery
- Search across tracks, albums, artists
- Filter by type (MusicBrainz)
- Display results in grid/list view
- Pagination for results

### Music Playback (Spotify API)
- Play/pause tracks
- Skip forward/backward
- Seek within track
- Volume control
- Queue management
- Shuffle/repeat modes

### Audio Analysis (Jamendo API)
- Display audio features (tempo, energy, mood)
- Visual waveform representation
- Genre classification
- Similar tracks recommendations

### Library Management
- Save favorite tracks
- Create custom playlists
- View listening history
- Organize playlists (add/remove tracks)

### API Integration Flow
1. User searches → Backend queries MusicBrainz for metadata
2. User selects track → Backend gets Spotify stream URL
3. User plays track → Frontend streams from Spotify + shows Jamendo analysis

---

## 5. Project Structure

```
Music_Webapp/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── music.js
│   │   │   ├── spotify.js
│   │   │   ├── jamendo.js
│   │   │   └── library.js
│   │   ├── services/
│   │   │   ├── musicbrainz.js
│   │   │   ├── spotify.js
│   │   │   └── jamendo.js
│   │   ├── models/
│   │   │   └── user.js
│   │   └── index.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   │   └── styles/
│   │   │       └── main.css
│   │   ├── components/
│   │   │   ├── Header.vue
│   │   │   ├── MusicPlayer.vue
│   │   │   ├── TrackCard.vue
│   │   │   ├── AlbumCard.vue
│   │   │   ├── SearchBar.vue
│   │   │   └── AudioVisualizer.vue
│   │   ├── views/
│   │   │   ├── Home.vue
│   │   │   ├── Search.vue
│   │   │   ├── Library.vue
│   │   │   ├── Playlist.vue
│   │   │   └── Login.vue
│   │   ├── stores/
│   │   │   ├── auth.js
│   │   │   ├── player.js
│   │   │   └── library.js
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 6. Acceptance Criteria

### Must Have
- [ ] Backend server starts without errors
- [ ] Frontend builds and runs
- [ ] User can register and login
- [ ] User can search for music (MusicBrainz)
- [ ] User can play music (Spotify streaming)
- [ ] User can view audio analysis (Jamendo)
- [ ] User can save favorites
- [ ] User can create and manage playlists

### Visual Checkpoints
- [ ] Dark theme with teal/pink accents applied
- [ ] Music player fixed at bottom
- [ ] Cards display properly in grid
- [ ] Responsive on mobile/tablet/desktop
- [ ] Smooth animations on interactions

### API Keys Required
- Spotify Client ID & Client Secret
- MusicBrainz (free, no key needed)
- Jamendo Client ID
