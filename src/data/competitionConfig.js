/**
 * Default Competition Config
 * 
 * These defaults match the original NoBeef CrossFit Games 2026 rules.
 * When a gym creates a new league, these values are pre-filled in the wizard
 * but can be customised per-league.
 */

// Default league rules — used as template for new league creation
export const DEFAULT_LEAGUE_RULES = {
  salaryCap: 11.5,            // Budget in £ millions
  rosterMin: 3,               // Minimum squad size
  rosterMax: 5,               // Maximum squad size
  insuranceMaxPrice: 2.0,     // Insurance pick must be ≤ this price
  powerCards: ['MOVING_DAY', 'LOVELY_TIME', 'HOT_TAG'],
  maxPowerCards: 3,            // Max cards per coach
  movingDayMultiplier: 1.5,   // 1.5× on a full competition day
  lovelyTimeBonus100: 50,     // Guaranteed pts on a 100pt event
  lovelyTimeBonus50: 25,      // Guaranteed pts on a 50pt event
  currency: '£',
};

// Default league tiers — configurable per-league
export const DEFAULT_LEAGUE_TIERS = {
  free: {
    name: 'Free League',
    icon: '🏆',
    enabled: true,
    price: 0,
    minCoaches: 0,
  },
  paid_tier_1: {
    name: '£2 Buy-In League',
    icon: '🥈',
    enabled: true,
    price: 2,
    minCoaches: 5,
  },
  paid_tier_2: {
    name: '£5 Buy-In League',
    icon: '🥇',
    enabled: true,
    price: 5,
    minCoaches: 5,
  },
};

// Power card display metadata
export const POWER_CARD_INFO = {
  MOVING_DAY: {
    name: 'Moving Day',
    description: 'Apply a 1.5× multiplier to one athlete for an entire competition day.',
    icon: 'TrendingUp',
    color: 'emerald',
  },
  LOVELY_TIME: {
    name: 'Lovely Time',
    description: 'Override an athlete\'s score with a guaranteed point value for one event.',
    icon: 'Star',
    color: 'purple',
  },
  HOT_TAG: {
    name: 'Hot Tag',
    description: 'Swap one athlete out for an unpicked replacement for a single event.',
    icon: 'Flame',
    color: 'cyan',
  },
};

/**
 * Generate a random league join code
 * Format: XXXXX-XXXXX (e.g., N7BEF-Q9M2K)
 */
export const generateJoinCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I/O/0/1 to avoid confusion
  const segment = () =>
    Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${segment()}-${segment()}`;
};
