import { Badge } from '../components/ui/badge';
import { AlertCircle, Database } from 'lucide-react';
import { cn } from '../components/ui/utils';

interface DataSourceBadgeProps {
  isDemo: boolean;
  className?: string;
}

export function DataSourceBadge({ isDemo, className }: DataSourceBadgeProps) {
  if (!isDemo) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'text-xs bg-green-500/10 text-green-400 border-green-500/30',
          className
        )}
      >
        <Database className="w-3 h-3 mr-1" />
        Live Data
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs bg-zinc-800 text-zinc-400 border-zinc-700',
        className
      )}
    >
      <AlertCircle className="w-3 h-3 mr-1" />
      Demo Mode
    </Badge>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="p-4 bg-zinc-900 rounded-full mb-4">
        {icon || <AlertCircle className="w-8 h-8 text-zinc-500" />}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-md mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
