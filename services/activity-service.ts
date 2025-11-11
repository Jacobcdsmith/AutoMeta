// Activity Service - Real-time activity logging and monitoring

interface ActivityEvent {
  id: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'llm' | 'browser' | 'social' | 'system' | 'mcp';
  message: string;
  metadata?: Record<string, any>;
}

interface ActivityFilter {
  type?: 'info' | 'success' | 'warning' | 'error';
  category?: 'llm' | 'browser' | 'social' | 'system' | 'mcp';
  startDate?: number;
  endDate?: number;
  limit?: number;
  offset?: number;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  network: {
    in: number;
    out: number;
  };
  activeConnections: number;
  requestsPerMinute: number;
}

class ActivityService {
  private endpoint = 'http://localhost:8000';
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private activityBuffer: ActivityEvent[] = [];
  private maxBufferSize = 1000;

  configure(endpoint: string) {
    this.endpoint = endpoint;
  }

  // WebSocket for real-time activity stream
  connectRealtime(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Activity connection timeout'));
        if (this.ws) {
          this.ws.close();
        }
      }, 5000);

      try {
        const wsEndpoint = this.endpoint.replace('http', 'ws');
        this.ws = new WebSocket(`${wsEndpoint}/ws/activity`);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          console.log('Activity WebSocket connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'activity') {
              this.addToBuffer(data.event);
              this.emit('activity', data.event);
            } else {
              this.emit(data.type, data);
            }
          } catch (error) {
            console.error('Failed to parse activity message:', error);
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          reject(error);
        };

        this.ws.onclose = () => {
          clearTimeout(timeout);
          console.log('Activity WebSocket closed');
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

  private addToBuffer(event: ActivityEvent) {
    this.activityBuffer.unshift(event);
    if (this.activityBuffer.length > this.maxBufferSize) {
      this.activityBuffer = this.activityBuffer.slice(0, this.maxBufferSize);
    }
  }

  getBufferedActivities(): ActivityEvent[] {
    return [...this.activityBuffer];
  }

  // REST API endpoints
  async getActivities(filter: ActivityFilter = {}): Promise<ActivityEvent[]> {
    const params = new URLSearchParams();
    if (filter.type) params.append('type', filter.type);
    if (filter.category) params.append('category', filter.category);
    if (filter.startDate) params.append('start', filter.startDate.toString());
    if (filter.endDate) params.append('end', filter.endDate.toString());
    if (filter.limit) params.append('limit', filter.limit.toString());
    if (filter.offset) params.append('offset', filter.offset.toString());

    const response = await fetch(`${this.endpoint}/api/activity/events?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch activities: ${response.statusText}`);
    }

    const events = await response.json();
    events.forEach((event: ActivityEvent) => this.addToBuffer(event));
    return events;
  }

  async logActivity(event: Omit<ActivityEvent, 'id' | 'timestamp'>): Promise<ActivityEvent> {
    const response = await fetch(`${this.endpoint}/api/activity/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`Failed to log activity: ${response.statusText}`);
    }

    const savedEvent = await response.json();
    this.addToBuffer(savedEvent);
    return savedEvent;
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await fetch(`${this.endpoint}/api/activity/metrics`);

    if (!response.ok) {
      throw new Error(`Failed to fetch system metrics: ${response.statusText}`);
    }

    return await response.json();
  }

  async clearActivities(before?: number): Promise<void> {
    const params = new URLSearchParams();
    if (before) params.append('before', before.toString());

    const response = await fetch(`${this.endpoint}/api/activity/events?${params}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to clear activities: ${response.statusText}`);
    }

    if (!before) {
      this.activityBuffer = [];
    }
  }

  async exportActivities(filter: ActivityFilter = {}, format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const params = new URLSearchParams();
    if (filter.type) params.append('type', filter.type);
    if (filter.category) params.append('category', filter.category);
    if (filter.startDate) params.append('start', filter.startDate.toString());
    if (filter.endDate) params.append('end', filter.endDate.toString());
    params.append('format', format);

    const response = await fetch(`${this.endpoint}/api/activity/export?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to export activities: ${response.statusText}`);
    }

    return await response.blob();
  }
}

export const activityService = new ActivityService();
export type { ActivityEvent, ActivityFilter, SystemMetrics };
