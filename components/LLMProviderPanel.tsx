import { useState, useEffect } from 'react';
import { Activity, CheckCircle2, XCircle, AlertCircle, ChevronDown, RefreshCw } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useLLMProviders } from '../hooks/useLLMProviders';

export function LLMProviderPanel() {
  const { providers, isLoading, testAllProviders } = useLLMProviders();

  const [logs, setLogs] = useState<Array<{ time: string; message: string; type: 'info' | 'success' | 'error' }>>([
    { time: '14:32:15', message: 'Connected to Groq API', type: 'success' },
    { time: '14:32:18', message: 'Content generated successfully', type: 'success' },
    { time: '14:32:22', message: 'Posted to Twitter', type: 'success' },
    { time: '14:32:25', message: 'Scheduled LinkedIn post', type: 'info' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const messages = [
        'Analyzing web content...',
        'Generating post content...',
        'Checking posting schedule...',
        'Processing images...',
      ];
      
      const newLog = {
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        message: messages[Math.floor(Math.random() * messages.length)],
        type: 'info' as const,
      };
      
      setLogs(prev => [newLog, ...prev].slice(0, 50));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col border-l border-zinc-800">
      {/* LLM Providers Section */}
      <div className="border-b border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            LLM Providers
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
              {providers.filter(p => p.status === 'online').length}/{providers.length} Online
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={testAllProviders}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          {providers.map((provider) => (
            <Collapsible key={provider.id}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
                  <StatusIcon status={provider.status} />
                  <div className="flex-1 text-left">
                    <div className="text-sm text-zinc-100">{provider.name}</div>
                    <div className="text-xs text-zinc-500">
                      {provider.status === 'testing' ? 'Testing...' : `${provider.responseTime}ms avg`}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-600">{provider.requestCount} req</div>
                  <ChevronDown className="w-4 h-4 text-zinc-600" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Endpoint:</span>
                      <span className="text-zinc-400">{provider.endpoint}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Status:</span>
                      <span className={provider.status === 'online' ? 'text-green-400' : 'text-red-400'}>
                        {provider.status === 'online' ? 'Connected' : provider.error || 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>

      {/* Activity Logs Section */}
      <div className="flex-1 flex flex-col p-6 min-h-0">
        <h3 className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live Activity
        </h3>
        
        <ScrollArea className="flex-1 -mx-2">
          <div className="space-y-2 px-2">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-3 text-xs p-2 rounded hover:bg-zinc-900/50">
                <span className="text-zinc-600 font-mono shrink-0">{log.time}</span>
                <LogIcon type={log.type} />
                <span className="text-zinc-400 flex-1">{log.message}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: 'online' | 'offline' | 'degraded' | 'testing' }) {
  if (status === 'online') {
    return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  }
  if (status === 'offline') {
    return <XCircle className="w-4 h-4 text-red-500" />;
  }
  if (status === 'testing') {
    return <div className="w-4 h-4 border-2 border-zinc-700 border-t-purple-500 rounded-full animate-spin" />;
  }
  return <AlertCircle className="w-4 h-4 text-yellow-500" />;
}

function LogIcon({ type }: { type: 'info' | 'success' | 'error' }) {
  const colors = {
    info: 'text-blue-400',
    success: 'text-green-400',
    error: 'text-red-400',
  };
  
  return <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors[type].replace('text-', 'bg-')} mt-1.5`} />;
}
