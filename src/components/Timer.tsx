import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TimerProps {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  timerState: 'active' | 'warning' | 'danger';
  progress: number;
  onToggle: () => void;
  onReset: () => void;
}

export function Timer({
  minutes,
  seconds,
  isRunning,
  timerState,
  progress,
  onToggle,
  onReset,
}: TimerProps) {
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-3">
      {/* Circular progress indicator */}
      <div className="relative h-12 w-12">
        <svg className="h-12 w-12 -rotate-90 transform" viewBox="0 0 48 48">
          {/* Background circle */}
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress)}`}
            className={cn(
              'transition-all duration-300',
              timerState === 'active' && 'text-timer-active',
              timerState === 'warning' && 'text-timer-warning',
              timerState === 'danger' && 'text-timer-danger animate-pulse-soft'
            )}
          />
        </svg>
        
        {/* Time display in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'text-xs font-semibold tabular-nums',
              timerState === 'active' && 'text-timer-active',
              timerState === 'warning' && 'text-timer-warning',
              timerState === 'danger' && 'text-timer-danger'
            )}
          >
            {formattedTime}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
        >
          {isRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
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
    </div>
  );
}
