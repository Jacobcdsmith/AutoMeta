// Analytics Service - Real-time metrics and engagement data

interface EngagementMetrics {
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  reach: number;
  engagementRate: number;
}

interface TimeSeriesData {
  timestamp: number;
  value: number;
  metric: string;
}

interface PlatformMetrics {
  platform: string;
  engagement: number;
  reach: number;
  posts: number;
  followers: number;
}

interface PostPerformance {
  id: string;
  platform: string;
  content: string;
  timestamp: number;
  metrics: EngagementMetrics;
  hashtags: string[];
}

interface AudienceGrowth {
  timestamp: number;
  followers: number;
  following: number;
  platform: string;
}

interface DemographicData {
  ageGroups: Record<string, number>;
  geographic: Record<string, number>;
  interests: string[];
}

interface AnalyticsQuery {
  startDate?: number;
  endDate?: number;
  platform?: string;
  metric?: string;
  granularity?: 'hour' | 'day' | 'week' | 'month';
}

class AnalyticsService {
  private endpoint = 'http://localhost:8000';
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  configure(endpoint: string) {
    this.endpoint = endpoint;
  }

  // WebSocket for real-time metrics updates
  connectRealtime(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Analytics connection timeout'));
        if (this.ws) {
          this.ws.close();
        }
      }, 5000);

      try {
        const wsEndpoint = this.endpoint.replace('http', 'ws');
        this.ws = new WebSocket(`${wsEndpoint}/ws/analytics`);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          console.log('Analytics WebSocket connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.emit(data.type || 'update', data);
          } catch (error) {
            console.error('Failed to parse analytics message:', error);
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          reject(error);
        };

        this.ws.onclose = () => {
          clearTimeout(timeout);
          console.log('Analytics WebSocket closed');
        };
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // REST API endpoints
  async getEngagementMetrics(query: AnalyticsQuery = {}): Promise<EngagementMetrics> {
    const params = new URLSearchParams();
    if (query.startDate) params.append('start', query.startDate.toString());
    if (query.endDate) params.append('end', query.endDate.toString());
    if (query.platform) params.append('platform', query.platform);

    const response = await fetch(`${this.endpoint}/api/analytics/engagement?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch engagement metrics: ${response.statusText}`);
    }

    return await response.json();
  }

  async getTimeSeriesData(query: AnalyticsQuery): Promise<TimeSeriesData[]> {
    const params = new URLSearchParams();
    if (query.startDate) params.append('start', query.startDate.toString());
    if (query.endDate) params.append('end', query.endDate.toString());
    if (query.metric) params.append('metric', query.metric);
    if (query.granularity) params.append('granularity', query.granularity);
    if (query.platform) params.append('platform', query.platform);

    const response = await fetch(`${this.endpoint}/api/analytics/timeseries?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch time series data: ${response.statusText}`);
    }

    return await response.json();
  }

  async getPlatformMetrics(query: AnalyticsQuery = {}): Promise<PlatformMetrics[]> {
    const params = new URLSearchParams();
    if (query.startDate) params.append('start', query.startDate.toString());
    if (query.endDate) params.append('end', query.endDate.toString());

    const response = await fetch(`${this.endpoint}/api/analytics/platforms?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch platform metrics: ${response.statusText}`);
    }

    return await response.json();
  }

  async getTopPosts(limit: number = 10, query: AnalyticsQuery = {}): Promise<PostPerformance[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (query.startDate) params.append('start', query.startDate.toString());
    if (query.endDate) params.append('end', query.endDate.toString());
    if (query.platform) params.append('platform', query.platform);

    const response = await fetch(`${this.endpoint}/api/analytics/posts/top?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch top posts: ${response.statusText}`);
    }

    return await response.json();
  }

  async getAudienceGrowth(query: AnalyticsQuery = {}): Promise<AudienceGrowth[]> {
    const params = new URLSearchParams();
    if (query.startDate) params.append('start', query.startDate.toString());
    if (query.endDate) params.append('end', query.endDate.toString());
    if (query.platform) params.append('platform', query.platform);
    if (query.granularity) params.append('granularity', query.granularity);

    const response = await fetch(`${this.endpoint}/api/analytics/audience/growth?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch audience growth: ${response.statusText}`);
    }

    return await response.json();
  }

  async getDemographics(query: AnalyticsQuery = {}): Promise<DemographicData> {
    const params = new URLSearchParams();
    if (query.platform) params.append('platform', query.platform);

    const response = await fetch(`${this.endpoint}/api/analytics/demographics?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch demographics: ${response.statusText}`);
    }

    return await response.json();
  }

  async getContentPerformance(query: AnalyticsQuery = {}): Promise<any[]> {
    const params = new URLSearchParams();
    if (query.startDate) params.append('start', query.startDate.toString());
    if (query.endDate) params.append('end', query.endDate.toString());

    const response = await fetch(`${this.endpoint}/api/analytics/content/performance?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch content performance: ${response.statusText}`);
    }

    return await response.json();
  }

  async getBestPostingTimes(query: AnalyticsQuery = {}): Promise<any[]> {
    const params = new URLSearchParams();
    if (query.platform) params.append('platform', query.platform);

    const response = await fetch(`${this.endpoint}/api/analytics/posting-times?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch posting times: ${response.statusText}`);
    }

    return await response.json();
  }

  async exportData(query: AnalyticsQuery, format: 'csv' | 'json' = 'json'): Promise<Blob> {
    const params = new URLSearchParams();
    if (query.startDate) params.append('start', query.startDate.toString());
    if (query.endDate) params.append('end', query.endDate.toString());
    if (query.platform) params.append('platform', query.platform);
    params.append('format', format);

    const response = await fetch(`${this.endpoint}/api/analytics/export?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to export data: ${response.statusText}`);
    }

    return await response.blob();
  }
}

export const analyticsService = new AnalyticsService();
export type {
  EngagementMetrics,
  TimeSeriesData,
  PlatformMetrics,
  PostPerformance,
  AudienceGrowth,
  DemographicData,
  AnalyticsQuery,
};
