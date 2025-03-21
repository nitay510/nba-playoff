/***************************************************
 * server.js
 * Located in /server folder
 **************************************************/
// Optional: If you still want local .env usage in dev only:
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import your routes
const authRoutes = require('./routes/authRoutes');
const seriesRoutes = require('./routes/seriesRoutes');
const leagueRoutes = require('./routes/leagueRoutes');
const userBetRoutes = require('./routes/userBetRoutes');

/***************************************************
 * Express App Setup
 **************************************************/
const app = express();
const PORT = process.env.PORT || 5000;

/***************************************************
 * Middleware
 **************************************************/
app.use(
  cors({
    origin: 'http://localhost:3000', // or your final front-end domain
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

/***************************************************
 * MongoDB Connection
 **************************************************/
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

/***************************************************
 * API Routes
 **************************************************/
app.use('/api/auth', authRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/user-bets', userBetRoutes);
app.use('/api/leagues', leagueRoutes);

/***************************************************
 * Serve React Build
 **************************************************/
// If you have a React build in ../client/build:
app.use(express.static(path.join(__dirname, 'build')));

// Catch-all: if route not found in API, serve React index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

/***************************************************
 * Start Server
 **************************************************/
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
