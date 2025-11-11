import { useEffect, useState } from 'react';
import { mcpService } from '../services/mcp-service';
import { puppeteerService } from '../services/puppeteer-service';
import { analyticsService } from '../services/analytics-service';
import { socialMediaService } from '../services/social-media-service';
import { activityService } from '../services/activity-service';
import { configService } from '../services/config-service';

interface ServiceStatus {
  mcp: 'connected' | 'disconnected' | 'error';
  puppeteer: 'connected' | 'disconnected' | 'error';
  analytics: 'connected' | 'disconnected' | 'error';
  social: 'connected' | 'disconnected' | 'error';
  activity: 'connected' | 'disconnected' | 'error';
}

export function useServices() {
  const [status, setStatus] = useState<ServiceStatus>({
    mcp: 'disconnected',
    puppeteer: 'disconnected',
    analytics: 'disconnected',
    social: 'disconnected',
    activity: 'disconnected',
  });

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initializeServices();

    return () => {
      disconnectServices();
    };
  }, []);

  const initializeServices = async () => {
    setIsInitializing(true);
    const config = configService.getConfig();

    // Configure services
    mcpService.configure({
      endpoint: config.services.mcpEndpoint,
    });

    puppeteerService.configure({
      host: config.services.puppeteerHost,
      debugPort: config.services.puppeteerDebugPort,
      headless: config.services.headlessMode,
    });

    analyticsService.configure(config.services.llmGatewayEndpoint);
    socialMediaService.configure(config.services.llmGatewayEndpoint);
    activityService.configure(config.services.llmGatewayEndpoint);

    // Connect to services
    await connectServices();
    setIsInitializing(false);
  };

  const connectServices = async () => {
    // Connect to MCP
    try {
      await mcpService.connect();
      setStatus(prev => ({ ...prev, mcp: 'connected' }));
      
      mcpService.on('connection', (data) => {
        setStatus(prev => ({ 
          ...prev, 
          mcp: data.status === 'connected' ? 'connected' : 'disconnected' 
        }));
      });

      mcpService.on('error', () => {
        setStatus(prev => ({ ...prev, mcp: 'error' }));
      });
    } catch (error) {
      setStatus(prev => ({ ...prev, mcp: 'disconnected' }));
    }

    // Connect to Puppeteer
    try {
      await puppeteerService.connect();
      setStatus(prev => ({ ...prev, puppeteer: 'connected' }));

      puppeteerService.on('connection', (data) => {
        setStatus(prev => ({ 
          ...prev, 
          puppeteer: data.status === 'connected' ? 'connected' : 'disconnected' 
        }));
      });

      puppeteerService.on('error', () => {
        setStatus(prev => ({ ...prev, puppeteer: 'error' }));
      });
    } catch (error) {
      setStatus(prev => ({ ...prev, puppeteer: 'disconnected' }));
    }

    // Connect to Analytics WebSocket
    try {
      await analyticsService.connectRealtime();
      setStatus(prev => ({ ...prev, analytics: 'connected' }));
    } catch (error) {
      setStatus(prev => ({ ...prev, analytics: 'disconnected' }));
    }

    // Connect to Social Media WebSocket
    try {
      await socialMediaService.connectRealtime();
      setStatus(prev => ({ ...prev, social: 'connected' }));
    } catch (error) {
      setStatus(prev => ({ ...prev, social: 'disconnected' }));
    }

    // Connect to Activity WebSocket
    try {
      await activityService.connectRealtime();
      setStatus(prev => ({ ...prev, activity: 'connected' }));
    } catch (error) {
      setStatus(prev => ({ ...prev, activity: 'disconnected' }));
    }
  };

  const disconnectServices = () => {
    mcpService.disconnect();
    puppeteerService.disconnect();
    analyticsService.disconnect();
    socialMediaService.disconnect();
    activityService.disconnect();
  };

  const reconnectService = async (serviceName: keyof ServiceStatus) => {
    setStatus(prev => ({ ...prev, [serviceName]: 'disconnected' }));

    try {
      switch (serviceName) {
        case 'mcp':
          await mcpService.connect();
          setStatus(prev => ({ ...prev, mcp: 'connected' }));
          break;
        case 'puppeteer':
          await puppeteerService.connect();
          setStatus(prev => ({ ...prev, puppeteer: 'connected' }));
          break;
        case 'analytics':
          await analyticsService.connectRealtime();
          setStatus(prev => ({ ...prev, analytics: 'connected' }));
          break;
        case 'social':
          await socialMediaService.connectRealtime();
          setStatus(prev => ({ ...prev, social: 'connected' }));
          break;
        case 'activity':
          await activityService.connectRealtime();
          setStatus(prev => ({ ...prev, activity: 'connected' }));
          break;
      }
    } catch (error) {
      console.error(`Failed to reconnect ${serviceName}:`, error);
      setStatus(prev => ({ ...prev, [serviceName]: 'error' }));
    }
  };

  return {
    status,
    isInitializing,
    reconnectService,
    services: {
      mcp: mcpService,
      puppeteer: puppeteerService,
      analytics: analyticsService,
      social: socialMediaService,
      activity: activityService,
    },
  };
}
