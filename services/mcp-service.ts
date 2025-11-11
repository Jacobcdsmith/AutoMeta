// MCP Service - Model Context Protocol integration
// Handles communication with MCP server for tool orchestration

interface MCPConfig {
  endpoint: string;
  apiKey?: string;
}

interface MCPToolCall {
  toolId: string;
  parameters: Record<string, any>;
}

interface MCPToolResponse {
  toolId: string;
  result: any;
  status: 'success' | 'error';
  error?: string;
  timestamp: number;
}

interface MCPServerStatus {
  status: 'connected' | 'disconnected' | 'error';
  tools: MCPTool[];
  version: string;
  uptime: number;
}

interface MCPTool {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  category: string;
}

class MCPService {
  private config: MCPConfig = {
    endpoint: 'http://localhost:3003',
  };

  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  configure(config: Partial<MCPConfig>) {
    this.config = { ...this.config, ...config };
  }

  // WebSocket connection for real-time updates
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('MCP connection timeout'));
        if (this.ws) {
          this.ws.close();
        }
      }, 5000);

      try {
        const wsEndpoint = this.config.endpoint.replace('http', 'ws');
        this.ws = new WebSocket(`${wsEndpoint}/ws`);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          console.log('MCP WebSocket connected');
          this.reconnectAttempts = 0;
          this.emit('connection', { status: 'connected' });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.emit(data.type || 'message', data);
          } catch (error) {
            console.error('Failed to parse MCP message:', error);
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          this.emit('error', { error });
          reject(error);
        };

        this.ws.onclose = () => {
          clearTimeout(timeout);
          console.log('MCP WebSocket closed');
          this.emit('connection', { status: 'disconnected' });
        };
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting to MCP... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Event system for real-time updates
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

  // REST API calls
  async getStatus(): Promise<MCPServerStatus> {
    const response = await fetch(`${this.config.endpoint}/api/status`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MCP status error: ${response.statusText}`);
    }

    return await response.json();
  }

  async listTools(): Promise<MCPTool[]> {
    const response = await fetch(`${this.config.endpoint}/api/tools`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MCP list tools error: ${response.statusText}`);
    }

    return await response.json();
  }

  async callTool(toolCall: MCPToolCall): Promise<MCPToolResponse> {
    const response = await fetch(`${this.config.endpoint}/api/tools/execute`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(toolCall),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`MCP tool execution error: ${error}`);
    }

    return await response.json();
  }

  async executeWorkflow(workflowId: string, parameters: Record<string, any>): Promise<any> {
    const response = await fetch(`${this.config.endpoint}/api/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ parameters }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`MCP workflow execution error: ${error}`);
    }

    return await response.json();
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  // Send message through WebSocket
  send(type: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    } else {
      console.warn('WebSocket not connected, message not sent:', type);
    }
  }
}

export const mcpService = new MCPService();
export type { MCPConfig, MCPToolCall, MCPToolResponse, MCPServerStatus, MCPTool };
