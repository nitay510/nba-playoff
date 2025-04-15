import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';

import NavBar                    from './components/NavBar';
import LoginPage                 from './pages/loginPage/LoginPage';
import RegisterPage              from './pages/registerPage/RegisterPage';
import ChampionSelectionPage     from './pages/registerPage/ChampionSelectionPage';
import HomePage                  from './pages/homePage/HomePage';
import AdminPage                 from './pages/adminPage/AdminPage';
import AdminFinishedPage         from './pages/adminPage/AdminFinishedPage';
import MyBetsPage                from './pages/MyBetsPage/MyBetsPage';
import LeaderboardPage           from './pages/LeaderboardPage/LeaderboardPage';
import UserBetsPage              from './pages/UserBetsPage/UserBetsPage';
import LeaguesPage               from './pages/LeaguesPage/LeaguesPage';
import RulesPage                 from './pages/RulesPage/RulesPage';
import WelcomePopup from './components/WelcomePopup';

import './styles/global.scss';

/* ──────────────────────────────────────────────── */
function AppWrapper() {
  const location = useLocation();

  /* grab ?invite=XXXX once and stash in localStorage */
  useEffect(() => {
    const params  = new URLSearchParams(location.search);
    const invite  = params.get('invite');            // e.g. 01c1d0
    if (invite) {
      localStorage.setItem('pendingLeague', invite);
      /* clean the url */
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location.search]);

  const hideNav =
    location.pathname === '/' ||
    location.pathname === '/register' ||
    location.pathname === '/choose-champion' ||
    location.pathname.startsWith('/admin') ||
    location.pathname === '/welcome';

  return (
    <div className="app-content">
      <Routes>
        <Route path="/"                         element={<LoginPage />} />
        <Route path="/register"                 element={<RegisterPage />} />
        <Route path="/choose-champion"          element={<ChampionSelectionPage />} />
        <Route path="/home"                     element={<HomePage />} />
        <Route path="/admin"                    element={<AdminPage />} />
        <Route path="/admin/finished"           element={<AdminFinishedPage />} />
        <Route path="/my-bets"                  element={<MyBetsPage />} />
        <Route path="/leagues"                  element={<LeaguesPage />} />
        <Route path="/leagues/:leagueId/leaderboard"
                                               element={<LeaderboardPage />} />
        <Route path="/user-bets/:username"      element={<UserBetsPage />} />
        <Route path="/rules"                    element={<RulesPage />} />
        <Route path="/welcome"                  element={<WelcomePopup />} />
      </Routes>

      {!hideNav && <NavBar />}
    </div>
  );
}

/* ──────────────────────────────────────────────── */
export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
