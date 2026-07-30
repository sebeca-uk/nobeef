import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import LandingPage from './components/LandingPage.jsx';
import CompetitionPage from './components/CompetitionPage.jsx';
import GymPage from './components/GymPage.jsx';
import LeagueWizard from './components/LeagueWizard.jsx';
import { LeagueProvider } from './context/LeagueContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("NoBeef App ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#121316', color: '#ef4444', fontFamily: 'sans-serif' }}>
          <h2>Something went wrong loading the application.</h2>
          <pre style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', color: '#f8fafc' }}>
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Route Structure:
 * 
 * /                              → Landing page (browse competitions, join league)
 * /create-league                 → Setup wizard to register a custom gym league
 * /c/:competitionSlug            → Competition detail (athletes, events, leagues list)
 * /g/:gymSlug                    → Gym profile (their leagues across competitions)
 * /g/:gymSlug/:competitionSlug   → League portal (the full fantasy league experience)
 */

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter basename="/nobeef">
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Create League Wizard */}
            <Route path="/create-league" element={<LeagueWizard />} />

            {/* Competition Detail */}
            <Route path="/c/:competitionSlug" element={<CompetitionPage />} />

            {/* Gym Profile */}
            <Route path="/g/:gymSlug" element={<GymPage />} />

            {/* League Portal — the full fantasy league experience */}
            <Route
              path="/l/:leagueSlug"
              element={
                <LeagueProvider>
                  <App />
                </LeagueProvider>
              }
            />

            {/* Legacy gym/competition route — backwards compatibility for older links */}
            <Route
              path="/g/:gymSlug/:competitionSlug"
              element={
                <LeagueProvider>
                  <App />
                </LeagueProvider>
              }
            />

            {/* Legacy route — backwards compatibility for the original NoBeef league */}
            <Route
              path="/league"
              element={
                <LeagueProvider>
                  <App />
                </LeagueProvider>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

