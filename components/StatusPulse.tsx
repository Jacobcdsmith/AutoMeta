import { cn } from './ui/utils';

interface StatusPulseProps {
  status: 'connected' | 'disconnected' | 'connecting';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function StatusPulse({
  status,
  label,
  size = 'md',
  showLabel = true,
  className,
}: StatusPulseProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusConfig = {
    connected: {
      color: 'bg-green-500',
      ringColor: 'ring-green-500/30',
      animate: true,
      text: 'Connected',
    },
    disconnected: {
      color: 'bg-zinc-600',
      ringColor: 'ring-zinc-600/30',
      animate: false,
      text: 'Disconnected',
    },
    connecting: {
      color: 'bg-yellow-500',
      ringColor: 'ring-yellow-500/30',
      animate: true,
      text: 'Connecting...',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            'rounded-full',
            sizeClasses[size],
            config.color,
            config.animate && 'animate-pulse'
          )}
        />
        {config.animate && (
          <div
            className={cn(
              'absolute rounded-full ring-2',
              sizeClasses[size === 'sm' ? 'md' : size === 'md' ? 'lg' : 'lg'],
              config.ringColor,
              'animate-ping'
            )}
          />
        )}
      </div>
      {showLabel && (
        <span className="text-xs text-zinc-400">{label || config.text}</span>
      )}
    </div>
  );
}
