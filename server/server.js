/***************************************************
 * server.js
 * Located in /server folder
 **************************************************/
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import your routes (assuming /server/routes)
const authRoutes = require('./routes/authRoutes');
const seriesRoutes = require('./routes/seriesRoutes');
const leagueRoutes = require('./routes/leagueRoutes');
const userBetRoutes = require('./routes/userBetRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

/***************************************************
 * Middleware
 **************************************************/
app.use(
  cors({
    origin: 'http://localhost:3000', // or your client domain
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

/***************************************************
 * MongoDB Connection
 **************************************************/
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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
 * The build is in ../client/build
 **************************************************/
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

// Catch-all: return index.html if an unknown route is hit
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

/***************************************************
 * Start Server
 **************************************************/
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
