// Social Media Service - Platform-specific posting and management

interface SocialPost {
  id: string;
  platform: 'twitter' | 'linkedin' | 'facebook';
  content: string;
  hashtags: string[];
  media?: SocialMediaAttachment[];
  scheduledFor?: number;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  postedAt?: number;
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
  };
}

interface SocialMediaAttachment {
  type: 'image' | 'video' | 'gif';
  url: string;
  altText?: string;
}

interface CreatePostRequest {
  platform: 'twitter' | 'linkedin' | 'facebook';
  content: string;
  hashtags?: string[];
  media?: SocialMediaAttachment[];
  scheduledFor?: number;
}

interface PlatformConnection {
  platform: string;
  connected: boolean;
  username?: string;
  profileUrl?: string;
  followerCount?: number;
  lastSync?: number;
}

interface PostSchedule {
  id: string;
  posts: SocialPost[];
  nextPostTime: number;
  frequency: number;
}

class SocialMediaService {
  private endpoint = 'http://localhost:8000';
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  configure(endpoint: string) {
    this.endpoint = endpoint;
  }

  // WebSocket for real-time post status updates
  connectRealtime(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Social media connection timeout'));
        if (this.ws) {
          this.ws.close();
        }
      }, 5000);

      try {
        const wsEndpoint = this.endpoint.replace('http', 'ws');
        this.ws = new WebSocket(`${wsEndpoint}/ws/social`);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          console.log('Social Media WebSocket connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.emit(data.type || 'update', data);
          } catch (error) {
            console.error('Failed to parse social media message:', error);
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          reject(error);
        };

        this.ws.onclose = () => {
          clearTimeout(timeout);
          console.log('Social Media WebSocket closed');
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

  // Post management
  async createPost(request: CreatePostRequest): Promise<SocialPost> {
    const response = await fetch(`${this.endpoint}/api/social/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create post: ${error}`);
    }

    return await response.json();
  }

  async getPosts(filter?: {
    platform?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<SocialPost[]> {
    const params = new URLSearchParams();
    if (filter?.platform) params.append('platform', filter.platform);
    if (filter?.status) params.append('status', filter.status);
    if (filter?.limit) params.append('limit', filter.limit.toString());
    if (filter?.offset) params.append('offset', filter.offset.toString());

    const response = await fetch(`${this.endpoint}/api/social/posts?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    return await response.json();
  }

  async getPost(postId: string): Promise<SocialPost> {
    const response = await fetch(`${this.endpoint}/api/social/posts/${postId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }

    return await response.json();
  }

  async updatePost(postId: string, updates: Partial<SocialPost>): Promise<SocialPost> {
    const response = await fetch(`${this.endpoint}/api/social/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update post: ${error}`);
    }

    return await response.json();
  }

  async deletePost(postId: string): Promise<void> {
    const response = await fetch(`${this.endpoint}/api/social/posts/${postId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete post: ${response.statusText}`);
    }
  }

  async publishPost(postId: string): Promise<SocialPost> {
    const response = await fetch(`${this.endpoint}/api/social/posts/${postId}/publish`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to publish post: ${error}`);
    }

    return await response.json();
  }

  async schedulePost(postId: string, scheduledFor: number): Promise<SocialPost> {
    const response = await fetch(`${this.endpoint}/api/social/posts/${postId}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledFor }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to schedule post: ${error}`);
    }

    return await response.json();
  }

  // Platform connections
  async getPlatformConnections(): Promise<PlatformConnection[]> {
    const response = await fetch(`${this.endpoint}/api/social/connections`);

    if (!response.ok) {
      throw new Error(`Failed to fetch connections: ${response.statusText}`);
    }

    return await response.json();
  }

  async connectPlatform(platform: string, credentials: Record<string, string>): Promise<PlatformConnection> {
    const response = await fetch(`${this.endpoint}/api/social/connections/${platform}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to connect platform: ${error}`);
    }

    return await response.json();
  }

  async disconnectPlatform(platform: string): Promise<void> {
    const response = await fetch(`${this.endpoint}/api/social/connections/${platform}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to disconnect platform: ${response.statusText}`);
    }
  }

  async testConnection(platform: string): Promise<{ connected: boolean; error?: string }> {
    const response = await fetch(`${this.endpoint}/api/social/connections/${platform}/test`);

    if (!response.ok) {
      throw new Error(`Failed to test connection: ${response.statusText}`);
    }

    return await response.json();
  }

  // Schedule management
  async getSchedule(): Promise<PostSchedule> {
    const response = await fetch(`${this.endpoint}/api/social/schedule`);

    if (!response.ok) {
      throw new Error(`Failed to fetch schedule: ${response.statusText}`);
    }

    return await response.json();
  }

  async updateSchedule(updates: Partial<PostSchedule>): Promise<PostSchedule> {
    const response = await fetch(`${this.endpoint}/api/social/schedule`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update schedule: ${error}`);
    }

    return await response.json();
  }

  // Media upload
  async uploadMedia(file: File, platform: string): Promise<SocialMediaAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('platform', platform);

    const response = await fetch(`${this.endpoint}/api/social/media/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to upload media: ${error}`);
    }

    return await response.json();
  }
}

export const socialMediaService = new SocialMediaService();
export type {
  SocialPost,
  SocialMediaAttachment,
  CreatePostRequest,
  PlatformConnection,
  PostSchedule,
};
