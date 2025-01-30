// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const seriesRoutes = require('./routes/seriesRoutes');
const userBetRoutes = require('./routes/userBetRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS (important for sending cookies cross-site)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/user-bets', userBetRoutes);

app.get('/', (req, res) => {
  res.send('NBA Playoff League API is running...');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
