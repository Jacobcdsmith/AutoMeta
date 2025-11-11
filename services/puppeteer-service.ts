// Puppeteer Service - Browser automation integration
// Connects to remote Puppeteer instance via Chrome DevTools Protocol

interface PuppeteerConfig {
  host: string;
  debugPort: number;
  headless: boolean;
}

interface BrowserState {
  url: string;
  title: string;
  screenshot?: string;
  isLoading: boolean;
  tabs: BrowserTab[];
  activeTabId: string;
}

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

interface NavigationOptions {
  url: string;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
}

interface ScreenshotOptions {
  fullPage?: boolean;
  quality?: number;
  type?: 'png' | 'jpeg';
}

interface ElementInteraction {
  selector: string;
  action: 'click' | 'type' | 'select' | 'hover';
  value?: string;
}

class PuppeteerService {
  private config: PuppeteerConfig = {
    host: 'localhost',
    debugPort: 9222,
    headless: false,
  };

  private ws: WebSocket | null = null;
  private currentState: BrowserState | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  configure(config: Partial<PuppeteerConfig>) {
    this.config = { ...this.config, ...config };
  }

  // Connect to Puppeteer via WebSocket (Chrome DevTools Protocol)
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Puppeteer connection timeout'));
      }, 5000);

      try {
        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), 3000);

        fetch(`http://${this.config.host}:${this.config.debugPort}/json/version`, {
          signal: controller.signal
        })
          .then(res => {
            clearTimeout(fetchTimeout);
            return res.json();
          })
          .then(data => {
            const webSocketDebuggerUrl = data.webSocketDebuggerUrl;
            this.ws = new WebSocket(webSocketDebuggerUrl);

            this.ws.onopen = () => {
              clearTimeout(timeout);
              console.log('Puppeteer WebSocket connected');
              this.emit('connection', { status: 'connected' });
              resolve();
            };

            this.ws.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
              } catch (error) {
                console.error('Failed to parse Puppeteer message:', error);
              }
            };

            this.ws.onerror = (error) => {
              clearTimeout(timeout);
              this.emit('error', { error });
              reject(error);
            };

            this.ws.onclose = () => {
              clearTimeout(timeout);
              console.log('Puppeteer WebSocket closed');
              this.emit('connection', { status: 'disconnected' });
            };
          })
          .catch(error => {
            clearTimeout(timeout);
            clearTimeout(fetchTimeout);
            reject(error);
          });
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  private handleMessage(data: any) {
    if (data.method) {
      this.emit(data.method, data.params);
    }
    if (data.result) {
      this.emit('result', data);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Event system
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

  // REST API calls to Puppeteer service
  private getBaseUrl(): string {
    return `http://${this.config.host}:${this.config.debugPort}`;
  }

  async navigate(options: NavigationOptions): Promise<void> {
    const response = await fetch(`${this.getBaseUrl()}/api/navigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`Navigation failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async getScreenshot(options: ScreenshotOptions = {}): Promise<string> {
    const response = await fetch(`${this.getBaseUrl()}/api/screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`Screenshot failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.screenshot; // base64 encoded image
  }

  async getCurrentState(): Promise<BrowserState> {
    const response = await fetch(`${this.getBaseUrl()}/api/state`);

    if (!response.ok) {
      throw new Error(`Get state failed: ${response.statusText}`);
    }

    this.currentState = await response.json();
    return this.currentState!;
  }

  async interact(interaction: ElementInteraction): Promise<void> {
    const response = await fetch(`${this.getBaseUrl()}/api/interact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interaction),
    });

    if (!response.ok) {
      throw new Error(`Interaction failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async executeScript(script: string): Promise<any> {
    const response = await fetch(`${this.getBaseUrl()}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script }),
    });

    if (!response.ok) {
      throw new Error(`Script execution failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result;
  }

  async getTabs(): Promise<BrowserTab[]> {
    const response = await fetch(`${this.getBaseUrl()}/api/tabs`);

    if (!response.ok) {
      throw new Error(`Get tabs failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tabs;
  }

  async switchTab(tabId: string): Promise<void> {
    const response = await fetch(`${this.getBaseUrl()}/api/tabs/${tabId}/activate`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Switch tab failed: ${response.statusText}`);
    }
  }

  async closeTab(tabId: string): Promise<void> {
    const response = await fetch(`${this.getBaseUrl()}/api/tabs/${tabId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Close tab failed: ${response.statusText}`);
    }
  }

  async createTab(url?: string): Promise<BrowserTab> {
    const response = await fetch(`${this.getBaseUrl()}/api/tabs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Create tab failed: ${response.statusText}`);
    }

    return await response.json();
  }

  getState(): BrowserState | null {
    return this.currentState;
  }
}

export const puppeteerService = new PuppeteerService();
export type { 
  PuppeteerConfig, 
  BrowserState, 
  BrowserTab, 
  NavigationOptions, 
  ScreenshotOptions,
  ElementInteraction 
};
