import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
  initialMinutes?: number;
  onComplete?: () => void;
}

export function useTimer({ initialMinutes = 5, onComplete }: UseTimerOptions = {}) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(initialMinutes * 60);

  const setDuration = useCallback((minutes: number) => {
    setIsRunning(false);
    setInitialTime(minutes * 60);
    setTotalSeconds(minutes * 60);
  }, []);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const progress = totalSeconds / initialTime;
  
  // Determine timer state for styling
  const timerState: 'active' | 'warning' | 'danger' = 
    progress > 0.3 ? 'active' : progress > 0.1 ? 'warning' : 'danger';

  const start = useCallback(() => {
    if (totalSeconds > 0) {
      setIsRunning(true);
    }
  }, [totalSeconds]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTotalSeconds(initialTime);
  }, [initialTime]);

  const toggle = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }, [isRunning, pause, start]);

  useEffect(() => {
    if (isRunning && totalSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onComplete]);

  return {
    minutes,
    seconds,
    totalSeconds,
    isRunning,
    progress,
    timerState,
    start,
    pause,
    reset,
    toggle,
    setDuration,
    currentDuration: Math.round(initialTime / 60),
  };
}
