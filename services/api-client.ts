/**
 * Unified API Client for Backend Services
 * Routes all requests through the backend gateway via Vite proxy
 */

const API_BASE = {
  llm: '/api/llm',
  puppeteer: '/api/puppeteer',
  mcp: '/api/mcp',
};

class APIClient {
  /**
   * Make an API request with error handling
   */
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error (${response.status}): ${error}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown API error');
    }
  }

  // LLM Gateway Methods
  async llmGenerate(payload: {
    prompt: string;
    platform?: string;
    max_tokens?: number;
    temperature?: number;
    provider?: string;
  }) {
    return this.request(`${API_BASE.llm}/generate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async llmHealth() {
    return this.request(`${API_BASE.llm}/health`);
  }

  // Puppeteer Methods
  async puppeteerHealth() {
    return this.request(`${API_BASE.puppeteer}/health`);
  }

  async puppeteerRun(payload: {
    jobId: string;
    platforms: string[];
    prompt: string;
    credentials: any;
  }) {
    return this.request(`${API_BASE.puppeteer}/run`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async puppeteerNavigate(url: string) {
    return this.request(`${API_BASE.puppeteer}/navigate`, {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  async puppeteerScreenshot() {
    return this.request(`${API_BASE.puppeteer}/screenshot`, {
      method: 'POST',
    });
  }

  async puppeteerState() {
    return this.request(`${API_BASE.puppeteer}/state`);
  }

  // MCP Methods
  async mcpHealth() {
    return this.request(`${API_BASE.mcp}/health`);
  }

  async mcpStatus() {
    return this.request(`${API_BASE.mcp}/status`);
  }

  async mcpExecuteWorkflow(workflowId: string, parameters: any) {
    return this.request(`${API_BASE.mcp}/workflows/${workflowId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ parameters }),
    });
  }
}

export const apiClient = new APIClient();
