import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initDatabase } from './config/database.js';

import authRoutes from './routes/auth.js';
import musicRoutes from './routes/music.js';
import libraryRoutes from './routes/library.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/library', libraryRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

const startServer = async () => {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`🎵 LessTone API running on http://localhost:${PORT}`);
  });
};

startServer();
