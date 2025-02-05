import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar'; // Our new bottom nav
import LoginPage from './pages/loginPage/LoginPage';
import RegisterPage from './pages/registerPage/RegisterPage';
import HomePage from './pages/homePage/HomePage';
import AdminPage from './pages/adminPage/AdminPage';
import MyBetsPage from './pages/MyBetsPage/MyBetsPage';
import LeaderboardPage from './pages/LeaderboardPage/LeaderboardPage';
import UserBetsPage from './pages/UserBetsPage/UserBetsPage';
import LeaguesPage from './pages/LeaguesPage/LeaguesPage';
import './styles/global.scss'; // Ensure global styles are imported

function AppWrapper() {
  // We'll define a separate component so we can use `useLocation`
  const location = useLocation();

  // If the path is "/" (login) or "/register", we hide the nav
  const hideNav = location.pathname === '/' || location.pathname === '/register';

  return (
    <div className="app-content">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/my-bets" element={<MyBetsPage />} />
        <Route path="/leagues/:leagueId/leaderboard" element={<LeaderboardPage />} />
        <Route path="/leagues" element={<LeaguesPage />} />
        <Route path="/user-bets/:username" element={<UserBetsPage />} />
      </Routes>

      {!hideNav && <NavBar />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}


