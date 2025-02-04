import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/loginPage/LoginPage';
import RegisterPage from './pages/registerPage/RegisterPage';
import HomePage from './pages/homePage/HomePage';
import AdminPage from './pages/adminPage/AdminPage';
import MyBetsPage from './pages/MyBetsPage/MyBetsPage';
import LeaderboardPage from './pages/LeaderboardPage/LeaderboardPage';
import UserBetsPage from './pages/UserBetsPage/UserBetsPage';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/my-bets" element={<MyBetsPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/user-bets/:username" element={<UserBetsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
