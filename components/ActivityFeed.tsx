import { useState, useEffect } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Globe, MessageSquare, Image, Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { activityService } from '../services/activity-service';
import type { ActivityEvent } from '../services/activity-service';

interface ActivityItem {
  id: string;
  type: 'browse' | 'generate' | 'image' | 'schedule' | 'post' | 'system' | 'error';
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'in-progress' | 'pending' | 'error';
  platform?: string;
  category?: string;
}

function mapActivityEvent(event: ActivityEvent): ActivityItem {
  const typeMap: Record<string, ActivityItem['type']> = {
    'llm': 'generate',
    'browser': 'browse',
    'social': 'post',
    'system': 'system',
    'mcp': 'system',
  };

  const statusMap: Record<string, ActivityItem['status']> = {
    'success': 'completed',
    'info': 'in-progress',
    'warning': 'pending',
    'error': 'error',
  };

  const now = Date.now();
  const diff = now - event.timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  let timestamp: string;
  if (minutes < 1) timestamp = 'just now';
  else if (minutes < 60) timestamp = `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  else if (hours < 24) timestamp = `${hours} hour${hours > 1 ? 's' : ''} ago`;
  else timestamp = `${days} day${days > 1 ? 's' : ''} ago`;

  return {
    id: event.id,
    type: typeMap[event.category] || 'system',
    title: event.message.split(':')[0] || event.message,
    description: event.message,
    timestamp,
    status: statusMap[event.type] || 'completed',
    category: event.category,
    platform: event.metadata?.platform,
  };
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Load initial activities
    const loadActivities = async () => {
      try {
        const events = await activityService.getActivities({ limit: 50 });
        setActivities(events.map(mapActivityEvent));
      } catch (error) {
        // Activity service not available - use empty state
      }
    };

    loadActivities();

    // Listen for real-time updates
    const handleActivity = (event: ActivityEvent) => {
      setActivities(prev => [mapActivityEvent(event), ...prev].slice(0, 100));
    };

    activityService.on('activity', handleActivity);

    return () => {
      activityService.off('activity', handleActivity);
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl mb-2">Activity Timeline</h2>
        <p className="text-sm text-zinc-400">Real-time agent actions and tasks</p>
      </div>

      <ScrollArea className="flex-1 -mx-2">
        <div className="space-y-4 px-2">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400">No activities yet</p>
              <p className="text-sm text-zinc-600 mt-2">Activity will appear here as the agent works</p>
            </div>
          ) : (
            activities.map((activity, index) => (
            <div key={activity.id} className="relative">
              {index !== activities.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-px bg-zinc-800" />
              )}
              
              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-full border-2 border-zinc-800 bg-zinc-900 flex items-center justify-center z-10">
                  <ActivityIcon type={activity.type} />
                </div>
                
                <div className="flex-1 pb-8">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:bg-zinc-900 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm mb-1">{activity.title}</h4>
                        <p className="text-sm text-zinc-400">{activity.description}</p>
                      </div>
                      <StatusBadge status={activity.status} />
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                      <span>{activity.timestamp}</span>
                      {activity.platform && (
                        <>
                          <span>•</span>
                          <span>{activity.platform}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const iconClass = "w-5 h-5";
  
  switch (type) {
    case 'browse':
      return <Globe className={`${iconClass} text-blue-400`} />;
    case 'generate':
      return <MessageSquare className={`${iconClass} text-purple-400`} />;
    case 'image':
      return <Image className={`${iconClass} text-pink-400`} />;
    case 'schedule':
      return <Calendar className={`${iconClass} text-yellow-400`} />;
    case 'post':
      return <CheckCircle2 className={`${iconClass} text-green-400`} />;
    case 'error':
      return <AlertTriangle className={`${iconClass} text-red-400`} />;
    default:
      return <Clock className={`${iconClass} text-zinc-400`} />;
  }
}

function StatusBadge({ status }: { status: string }) {
  const variants = {
    completed: 'bg-green-500/10 text-green-400 border-green-500/30',
    'in-progress': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    error: 'bg-red-500/10 text-red-400 border-red-500/30',
  };
  
  return (
    <span className={`text-xs px-2 py-1 rounded border ${variants[status as keyof typeof variants]}`}>
      {status}
    </span>
  );
}
