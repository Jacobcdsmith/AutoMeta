import { useState } from 'react';
import { Play, Pause, Square, Settings, Zap } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { toast } from 'sonner@2.0.3';

interface ControlPanelProps {
  onOpenConfig: () => void;
}

export function ControlPanel({ onOpenConfig }: ControlPanelProps) {
  const [agentStatus, setAgentStatus] = useState<'idle' | 'running' | 'paused'>('idle');

  const handleStart = () => {
    setAgentStatus('running');
    toast.success('Agent started', {
      description: 'The media poster is now active and monitoring',
    });
  };

  const handlePause = () => {
    setAgentStatus('paused');
    toast.info('Agent paused', {
      description: 'Current task will complete before pausing',
    });
  };

  const handleStop = () => {
    setAgentStatus('idle');
    toast.info('Agent stopped', {
      description: 'All tasks have been terminated',
    });
  };

  return (
    <div className="flex items-center gap-3">
      {/* Status Indicator */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
        <div className={`w-2 h-2 rounded-full ${
          agentStatus === 'running' ? 'bg-green-500 animate-pulse' :
          agentStatus === 'paused' ? 'bg-yellow-500' :
          'bg-zinc-500'
        }`} />
        <span className="text-sm text-zinc-400 capitalize">{agentStatus}</span>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2">
        {agentStatus === 'idle' && (
          <Button onClick={handleStart} className="bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
        )}
        
        {agentStatus === 'running' && (
          <>
            <Button onClick={handlePause} variant="outline">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
            <Button onClick={handleStop} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          </>
        )}
        
        {agentStatus === 'paused' && (
          <>
            <Button onClick={handleStart} className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
            <Button onClick={handleStop} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          </>
        )}
      </div>

      {/* Quick Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Zap className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => toast.success('Manual post created')}>
            Create Manual Post
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info('Refreshing providers...')}>
            Refresh Providers
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info('Clearing cache...')}>
            Clear Cache
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => toast.info('Exporting logs...')}>
            Export Logs
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Settings Button */}
      <Button variant="outline" size="icon" onClick={onOpenConfig}>
        <Settings className="w-4 h-4" />
      </Button>
    </div>
  );
}
