import { useState, useEffect } from 'react';
import { llmService } from '../services/llm-service';
import { configService } from '../services/config-service';

interface Provider {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'testing' | 'degraded';
  responseTime: number;
  endpoint: string;
  lastUsed?: string;
  requestCount: number;
  error?: string;
}

export function useLLMProviders() {
  const [providers, setProviders] = useState<Provider[]>([
    { id: 'groq', name: 'Groq API', status: 'testing', responseTime: 0, endpoint: 'api.groq.com', requestCount: 0 },
  ]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Configure LLM service with API keys
    const config = configService.getConfig();
    llmService.configure({
      groqApiKey: config.llm.groqApiKey,
      geminiApiKey: config.llm.geminiApiKey,
    });

    // Test all providers
    testAllProviders();
  }, []);

  const testAllProviders = async () => {
    setIsLoading(true);
    
    const testPromises = providers.map(async (provider) => {
      const result = await llmService.testConnection(provider.id as any);
      
      return {
        ...provider,
        status: result.success ? ('online' as const) : ('offline' as const),
        responseTime: result.responseTime,
        error: result.error,
      };
    });

    const results = await Promise.all(testPromises);
    setProviders(results);
    setIsLoading(false);
  };

  const incrementRequestCount = (providerId: string) => {
    setProviders(prev => prev.map(p => 
      p.id === providerId 
        ? { ...p, requestCount: p.requestCount + 1, lastUsed: new Date().toISOString() }
        : p
    ));
  };

  return {
    providers,
    isLoading,
    testAllProviders,
    incrementRequestCount,
  };
}
