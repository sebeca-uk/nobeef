import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_LEAGUE_RULES, DEFAULT_LEAGUE_TIERS } from '../data/competitionConfig';
import { ATHLETES_DATA, LOCKED_TEAMS, SEED_EVENTS, COMPETITION_DAYS, DRAFT_ANALYTICS } from '../data/seedData';

/**
 * LeagueContext
 * 
 * Provides all league configuration, competition data, and rules to the entire app.
 * Every component reads from this context instead of importing hardcoded seedData directly.
 * 
 * In Phase 1, this is populated from the legacy seed data.
 * In Phase 2+, this will be loaded from Firestore based on the URL route.
 */

const LeagueContext = createContext(null);

export const useLeague = () => {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }
  return context;
};

/**
 * Build the legacy league config from the existing seed data.
 * This is the "CrossFit Games 2026 / NoBeef" league that already exists.
 */
const buildLegacyLeagueConfig = () => {
  const athletes = ATHLETES_DATA;
  const lockedTeams = LOCKED_TEAMS;
  const events = SEED_EVENTS;
  const competitionDays = COMPETITION_DAYS;
  const draftAnalytics = DRAFT_ANALYTICS;

  // Compute dynamic analytics from teams data
  const allSquadAthletes = lockedTeams.flatMap(t => t.squad);
  const athletePickCounts = {};
  allSquadAthletes.forEach(name => {
    athletePickCounts[name] = (athletePickCounts[name] || 0) + 1;
  });
  const mostPickedAthlete = Object.entries(athletePickCounts)
    .sort(([, a], [, b]) => b - a)[0];

  return {
    // Identity & Branding
    id: 'nobeef-crossfit-games-2026',
    competitionId: 'crossfit-games-2026',
    gymId: 'nobeef',
    competitionName: 'CrossFit Games 2026',
    leagueName: 'NoBeef Fantasy League',
    gymName: 'NoBeef',
    tagline: 'Official Edition',
    organizers: 'Team Sim & JJ',
    lockDeadline: 'July 20, 2026',
    subtitle: 'Official Coach Dashboard • Live Leaderboard • RX+ Card Portal',

    // Rules (from defaults, matching the original hardcoded values)
    rules: localStorage.getItem('nobeef_legacy_league_rules') 
      ? JSON.parse(localStorage.getItem('nobeef_legacy_league_rules')) 
      : { ...DEFAULT_LEAGUE_RULES },

    // League Tiers
    leagueTiers: { ...DEFAULT_LEAGUE_TIERS },

    // Competition Data
    athletes,
    lockedTeams,
    events,
    competitionDays,
    draftAnalytics,

    // Computed analytics
    totalAthletes: athletes.length,
    menCount: athletes.filter(a => a.gender === 'Men').length,
    womenCount: athletes.filter(a => a.gender === 'Women').length,
    totalCoaches: lockedTeams.length,
    mostPickedAthlete: mostPickedAthlete
      ? {
          name: mostPickedAthlete[0],
          count: mostPickedAthlete[1],
          percentage: Math.round((mostPickedAthlete[1] / lockedTeams.length) * 100),
        }
      : null,

    // Passwords (from env, with defaults)
    sitePassword: (import.meta.env.VITE_SITE_PASSWORD || 'nobeef').toLowerCase(),
    adminPassword: (import.meta.env.VITE_ADMIN_PASSWORD || 'nobeef2026').toLowerCase(),
  };
};

/**
 * Helper: Get athlete price from the league's athlete pool
 */
export const getAthletePrice = (athleteName, athletes) => {
  const ath = athletes.find(a => a.name === athleteName);
  return ath ? ath.price : 0;
};

/**
 * Helper: Format currency value (e.g., "£4.5m")
 */
export const formatCurrency = (value, currency = '£') => {
  return `${currency}${value}m`;
};

/**
 * Helper: Format budget display (e.g., "£8.5m / £11.5m")
 */
export const formatBudget = (spent, cap, currency = '£') => {
  return `${currency}${spent.toFixed(1)}m / ${currency}${cap}m`;
};

export function LeagueProvider({ children }) {
  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLeague = () => {
    try {
      // Discover active gymSlug and competitionSlug from path
      const pathParts = window.location.pathname.split('/');
      let activeLeague = null;

      const gIndex = pathParts.indexOf('g');
      if (gIndex !== -1 && pathParts.length > gIndex + 2) {
        const gymSlug = pathParts[gIndex + 1];
        const compSlug = pathParts[gIndex + 2];
        const targetId = `${gymSlug}_${compSlug}`;

        // Retrieve custom leagues from localStorage
        const customLeagues = JSON.parse(localStorage.getItem('nobeef_custom_leagues') || '[]');
        activeLeague = customLeagues.find(l => l.id === targetId);
      }

      if (!activeLeague) {
        // Fallback to legacy static NoBeef CrossFit Games config
        activeLeague = buildLegacyLeagueConfig();
      } else {
        // Hydrate dynamic parameters (totals, most picked) for custom leagues
        const athletes = activeLeague.athletes || [];
        const lockedTeams = activeLeague.lockedTeams || [];
        
        const allSquadAthletes = lockedTeams.flatMap(t => t.squad);
        const athletePickCounts = {};
        allSquadAthletes.forEach(name => {
          athletePickCounts[name] = (athletePickCounts[name] || 0) + 1;
        });
        const mostPickedAthlete = Object.entries(athletePickCounts)
          .sort(([, a], [, b]) => b - a)[0];

        activeLeague.totalAthletes = athletes.length;
        activeLeague.menCount = athletes.filter(a => a.gender === 'Men').length;
        activeLeague.womenCount = athletes.filter(a => a.gender === 'Women').length;
        activeLeague.totalCoaches = lockedTeams.length;
        activeLeague.mostPickedAthlete = mostPickedAthlete
          ? {
              name: mostPickedAthlete[0],
              count: mostPickedAthlete[1],
              percentage: Math.round((mostPickedAthlete[1] / lockedTeams.length) * 100),
            }
          : null;
      }

      setLeague(activeLeague);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load league config:', err);
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeague();
  }, [window.location.pathname]);

  useEffect(() => {
    window.addEventListener('nobeef_data_change', loadLeague);
    return () => window.removeEventListener('nobeef_data_change', loadLeague);
  }, []);

  const updateLeagueRules = (updatedRules) => {
    if (!league) return;
    const updated = {
      ...league,
      rules: {
        ...league.rules,
        ...updatedRules
      }
    };
    if (updated.id === 'nobeef-crossfit-games-2026') {
      localStorage.setItem('nobeef_legacy_league_rules', JSON.stringify(updated.rules));
    } else {
      const customLeagues = JSON.parse(localStorage.getItem('nobeef_custom_leagues') || '[]');
      const idx = customLeagues.findIndex(l => l.id === updated.id);
      if (idx >= 0) {
        customLeagues[idx] = updated;
        localStorage.setItem('nobeef_custom_leagues', JSON.stringify(customLeagues));
      }
    }
    setLeague(updated);
    window.dispatchEvent(new Event('nobeef_data_change'));
  };

  const contextValue = league ? { ...league, updateLeagueRules } : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121316] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-medium">Loading league...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121316] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-white font-bold text-xl">Failed to load league</h2>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <LeagueContext.Provider value={contextValue}>
      {children}
    </LeagueContext.Provider>
  );
}

export default LeagueContext;
