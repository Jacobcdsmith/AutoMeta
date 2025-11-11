// Configuration Service - Manages app configuration and API keys

interface AppConfig {
  llm: {
    groqApiKey: string;
    geminiApiKey: string;
    openaiApiKey?: string;
    lmStudioEndpoint?: string;
    primaryProvider: 'groq' | 'gemini' | 'openai' | 'lmstudio';
    autoFallback: boolean;
  };
  services: {
    puppeteerDebugPort: number;
    puppeteerHost: string;
    headlessMode: boolean;
    llmGatewayEndpoint: string;
    mcpEndpoint: string;
  };
  social: {
    twitter: {
      apiKey?: string;
      apiSecret?: string;
      accessToken?: string;
      accessTokenSecret?: string;
      enabled: boolean;
    };
    linkedin: {
      clientId?: string;
      clientSecret?: string;
      enabled: boolean;
    };
  };
  automation: {
    postFrequencyHours: number;
    maxPostsPerDay: number;
    autoPosting: boolean;
    researchMode: boolean;
    autoHashtags: boolean;
  };
}

const DEFAULT_CONFIG: AppConfig = {
  llm: {
    groqApiKey: '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',
    geminiApiKey: 'AIzaSyAD3e68UcYh9bnTdGhzCCquhdK8yPAgmTI',
    primaryProvider: 'groq',
    autoFallback: true,
  },
  services: {
    puppeteerDebugPort: 9222,
    puppeteerHost: 'localhost',
    headlessMode: false,
    llmGatewayEndpoint: 'http://localhost:8000',
    mcpEndpoint: 'http://localhost:3003',
  },
  social: {
    twitter: {
      enabled: false,
    },
    linkedin: {
      enabled: false,
    },
  },
  automation: {
    postFrequencyHours: 4,
    maxPostsPerDay: 6,
    autoPosting: true,
    researchMode: true,
    autoHashtags: true,
  },
};

class ConfigService {
  private config: AppConfig;
  private listeners: Set<(config: AppConfig) => void> = new Set();

  constructor() {
    // Load from localStorage or use defaults
    const stored = localStorage.getItem('agenticMediaPosterConfig');
    this.config = stored ? JSON.parse(stored) : DEFAULT_CONFIG;
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AppConfig>) {
    this.config = {
      ...this.config,
      ...updates,
      llm: { ...this.config.llm, ...updates.llm },
      services: { ...this.config.services, ...updates.services },
      social: { 
        ...this.config.social,
        twitter: { ...this.config.social.twitter, ...updates.social?.twitter },
        linkedin: { ...this.config.social.linkedin, ...updates.social?.linkedin },
      },
      automation: { ...this.config.automation, ...updates.automation },
    };

    // Persist to localStorage
    localStorage.setItem('agenticMediaPosterConfig', JSON.stringify(this.config));

    // Notify listeners
    this.listeners.forEach(listener => listener(this.config));
  }

  subscribe(listener: (config: AppConfig) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  resetToDefaults() {
    this.config = DEFAULT_CONFIG;
    localStorage.removeItem('agenticMediaPosterConfig');
    this.listeners.forEach(listener => listener(this.config));
  }
}

export const configService = new ConfigService();
export type { AppConfig };
