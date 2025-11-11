/**
 * Demo Data Service
 * Provides consistent demo/fallback data when backend is unavailable
 * All demo data is clearly labeled to avoid confusion
 */

// Demo engagement metrics
export const demoEngagementMetrics = {
  likes: 0,
  comments: 0,
  shares: 0,
  impressions: 0,
  reach: 0,
  engagementRate: 0,
};

// Demo platform metrics
export const demoPlatformMetrics = [
  {
    platform: 'Twitter',
    engagement: 0,
    reach: 0,
    posts: 0,
    followers: 0,
  },
  {
    platform: 'LinkedIn',
    engagement: 0,
    reach: 0,
    posts: 0,
    followers: 0,
  },
];

// Demo time series data
export const demoTimeSeriesData = [
  { timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000, value: 0, metric: 'engagement' },
  { timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, value: 0, metric: 'engagement' },
  { timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, value: 0, metric: 'engagement' },
  { timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, value: 0, metric: 'engagement' },
  { timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, value: 0, metric: 'engagement' },
  { timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, value: 0, metric: 'engagement' },
  { timestamp: Date.now(), value: 0, metric: 'engagement' },
];

// Demo top posts
export const demoTopPosts = [];

// Real-time metrics from actual backend services
export function getSystemMetrics() {
  return {
    // These can be populated from actual service calls
    postsGeneratedToday: 0,
    averageResponseTime: 0,
    requestsPerHour: 0,
    successRate: 100,
    activePlatforms: 0,
  };
}

// Helper to determine if data is demo data
export function isDemoData(data: any): boolean {
  if (!data) return true;
  if (Array.isArray(data) && data.length === 0) return true;
  if (typeof data === 'object') {
    const values = Object.values(data);
    return values.every((v) => v === 0 || v === null || v === undefined);
  }
  return false;
}

// Format demo message
export function getDemoDataMessage(feature: string): string {
  return `${feature} analytics will appear here once you start posting content. Connect your social media accounts in settings to begin.`;
}

export const DEMO_INDICATORS = {
  NO_DATA: 'No data available yet',
  CONNECT_ACCOUNTS: 'Connect social media accounts to see analytics',
  START_POSTING: 'Start posting to see engagement metrics',
  BACKEND_UNAVAILABLE: 'Analytics service temporarily unavailable',
};
