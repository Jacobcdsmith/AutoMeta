import { useState, useEffect } from 'react';
import { Monitor, RefreshCw, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { puppeteerService } from '../services/puppeteer-service';
import type { BrowserState } from '../services/puppeteer-service';

export function BrowserViewer() {
  const [isConnected, setIsConnected] = useState(false);
  const [browserState, setBrowserState] = useState<BrowserState | null>(null);
  const [screenshot, setScreenshot] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Connect to Puppeteer and listen for updates
    const handleConnection = (data: any) => {
      setIsConnected(data.status === 'connected');
    };

    const handleStateUpdate = async () => {
      try {
        const state = await puppeteerService.getCurrentState();
        setBrowserState(state);
      } catch (error) {
        // Service not available - this is expected if backend isn't running
      }
    };

    puppeteerService.on('connection', handleConnection);
    puppeteerService.on('Page.loadEventFired', handleStateUpdate);
    puppeteerService.on('Page.frameNavigated', handleStateUpdate);

    // Initial state fetch - don't fail if service isn't available
    handleStateUpdate();

    // Poll for screenshot updates only if connected
    const screenshotInterval = setInterval(async () => {
      if (isConnected) {
        try {
          const screenshotData = await puppeteerService.getScreenshot({ 
            type: 'jpeg', 
            quality: 80 
          });
          setScreenshot(screenshotData);
        } catch (error) {
          // Screenshot fetch failed - service may be unavailable
        }
      }
    }, 2000);

    return () => {
      puppeteerService.off('connection', handleConnection);
      puppeteerService.off('Page.loadEventFired', handleStateUpdate);
      puppeteerService.off('Page.frameNavigated', handleStateUpdate);
      clearInterval(screenshotInterval);
    };
  }, [isConnected]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      if (browserState?.url) {
        await puppeteerService.navigate({ url: browserState.url, waitUntil: 'load' });
      }
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Browser Controls */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
        <div className="flex-1 flex items-center gap-2 text-sm">
          <Monitor className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-500">localhost:9222</span>
          <span className="text-zinc-700">→</span>
          <span className="text-zinc-300 truncate">{browserState?.url || 'Connecting...'}</span>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="ghost"
            onClick={handleRefresh}
            disabled={isLoading || !isConnected}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="sm" variant="ghost" disabled={!isConnected}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Browser Preview */}
      <div className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/30 overflow-hidden relative">
        {!isConnected ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-zinc-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-400">Connecting to Puppeteer...</p>
              <p className="text-sm text-zinc-600 mt-2">Port 9222</p>
            </div>
          </div>
        ) : screenshot ? (
          <div className="h-full p-4">
            <img 
              src={`data:image/jpeg;base64,${screenshot}`}
              alt="Browser screenshot"
              className="w-full h-full object-contain rounded-lg"
            />
            {browserState?.isLoading && (
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-purple-500/10 border border-purple-500/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <span className="text-sm text-purple-300">Loading page...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Monitor className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400">Waiting for browser content...</p>
              <p className="text-sm text-zinc-600 mt-2">{browserState?.title || 'No page loaded'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
