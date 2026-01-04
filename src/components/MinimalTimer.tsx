import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MinimalTimerProps {
  isRunning: boolean;
  progress: number;
  onToggle: () => void;
  onReset: () => void;
}

export function MinimalTimer({
  isRunning,
  progress,
  onToggle,
  onReset,
}: MinimalTimerProps) {
  if (isRunning) {
    // Show only a small green pulsing circle when running
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          className="relative h-4 w-4 cursor-pointer"
          title="Pause timer"
        >
          <span className="absolute inset-0 animate-pulse rounded-full bg-timer-active" />
          <span 
            className="absolute inset-0 rounded-full bg-timer-active opacity-50" 
            style={{ 
              transform: `scale(${1 + (1 - progress) * 0.5})`,
              transition: 'transform 0.3s ease-out'
            }}
          />
        </button>
      </div>
    );
  }

  // Show play button when not running
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="h-8 w-8"
      >
        <Play className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onReset}
        className="h-8 w-8"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
