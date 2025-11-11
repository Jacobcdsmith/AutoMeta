import { useState, useEffect } from 'react';
import { Server, Wifi, HardDrive, Activity } from 'lucide-react';
import { useServices } from '../hooks/useServices';
import { activityService } from '../services/activity-service';
import type { SystemMetrics } from '../services/activity-service';

export function StatusBar() {
  const { status } = useServices();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [startTime] = useState(Date.now());
  const [uptime, setUptime] = useState('0m');

  useEffect(() => {
    // Fetch system metrics
    const fetchMetrics = async () => {
      try {
        const data = await activityService.getSystemMetrics();
        setMetrics(data);
      } catch (error) {
        // Metrics service not available - continue without metrics
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update uptime display
    const updateUptime = () => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      setUptime(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`);
    };

    updateUptime();
    const interval = setInterval(updateUptime, 60000);

    return () => clearInterval(interval);
  }, [startTime]);

  const getStatusColor = (serviceStatus: 'connected' | 'disconnected' | 'error') => {
    switch (serviceStatus) {
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-yellow-400';
      case 'error': return 'text-red-400';
    }
  };

  const getStatusText = (serviceStatus: 'connected' | 'disconnected' | 'error') => {
    switch (serviceStatus) {
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      case 'error': return 'Error';
    }
  };

  return (
    <footer className="border-t border-zinc-800 bg-zinc-900/50 backdrop-blur px-6 py-3">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Server className={`w-4 h-4 ${getStatusColor(status.mcp)}`} />
            <span className="text-zinc-400">
              MCP: <span className={getStatusColor(status.mcp)}>{getStatusText(status.mcp)}</span> (3003)
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Wifi className={`w-4 h-4 ${getStatusColor(status.puppeteer)}`} />
            <span className="text-zinc-400">
              Puppeteer: <span className={getStatusColor(status.puppeteer)}>{getStatusText(status.puppeteer)}</span> (9222)
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <HardDrive className={`w-4 h-4 ${getStatusColor(status.analytics)}`} />
            <span className="text-zinc-400">
              Gateway: <span className={getStatusColor(status.analytics)}>{getStatusText(status.analytics)}</span> (8000)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-zinc-500">
          {metrics && (
            <>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>{metrics.requestsPerMinute}/min</span>
              </div>
              <span className="text-zinc-700">•</span>
              <span>{metrics.activeConnections} connections</span>
              <span className="text-zinc-700">•</span>
            </>
          )}
          <span>Uptime: {uptime}</span>
        </div>
      </div>
    </footer>
  );
}
