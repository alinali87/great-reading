import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTimer } from "../useTimer";

describe("useTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with default 5 minutes", () => {
    const { result } = renderHook(() => useTimer());

    expect(result.current.minutes).toBe(5);
    expect(result.current.seconds).toBe(0);
    expect(result.current.totalSeconds).toBe(300);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.progress).toBe(1);
    expect(result.current.timerState).toBe("active");
  });

  it("should initialize with custom duration", () => {
    const { result } = renderHook(() => useTimer({ initialMinutes: 10 }));

    expect(result.current.minutes).toBe(10);
    expect(result.current.seconds).toBe(0);
    expect(result.current.totalSeconds).toBe(600);
    expect(result.current.currentDuration).toBe(10);
  });

  it("should start the timer", () => {
    const { result } = renderHook(() => useTimer({ initialMinutes: 1 }));

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.totalSeconds).toBe(59);
  });

  it("should pause the timer", () => {
    const { result } = renderHook(() => useTimer({ initialMinutes: 1 }));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.totalSeconds).toBe(58);

    act(() => {
      result.current.pause();
    });

    expect(result.current.isRunning).toBe(false);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Should still be 58 since it's paused
    expect(result.current.totalSeconds).toBe(58);
  });

  it("should reset the timer", () => {
    const { result } = renderHook(() => useTimer({ initialMinutes: 5 }));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.totalSeconds).toBe(290);

    act(() => {
      result.current.reset();
    });

    expect(result.current.totalSeconds).toBe(300);
    expect(result.current.isRunning).toBe(false);
  });

  it("should toggle between start and pause", () => {
    const { result } = renderHook(() => useTimer({ initialMinutes: 5 }));

    expect(result.current.isRunning).toBe(false);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isRunning).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isRunning).toBe(false);
  });

  it("should call onComplete when timer reaches zero", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useTimer({ initialMinutes: 1, onComplete }),
    );

    act(() => {
      result.current.start();
    });

    // Fast forward to 1 second before completion
    act(() => {
      vi.advanceTimersByTime(59000);
    });

    expect(result.current.totalSeconds).toBe(1);
    expect(onComplete).not.toHaveBeenCalled();

    // Complete the timer
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.totalSeconds).toBe(0);
    expect(result.current.isRunning).toBe(false);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("should update duration", () => {
    const { result } = renderHook(() => useTimer({ initialMinutes: 5 }));

    act(() => {
      result.current.setDuration(15);
    });

    expect(result.current.minutes).toBe(15);
    expect(result.current.totalSeconds).toBe(900);
    expect(result.current.currentDuration).toBe(15);
    expect(result.current.isRunning).toBe(false);
  });

  it("should calculate progress correctly", () => {
    const { result } = renderHook(() => useTimer({ initialMinutes: 10 }));

    expect(result.current.progress).toBe(1);

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(300000); // 5 minutes
    });

    expect(result.current.progress).toBe(0.5);
  });

  it("should update timer state based on progress", () => {
    const { result } = renderHook(() => useTimer({ initialMinutes: 10 }));

    expect(result.current.timerState).toBe("active");

    act(() => {
      result.current.start();
    });

    // Progress > 0.3 -> active
    act(() => {
      vi.advanceTimersByTime(300000); // 5 minutes, progress = 0.5
    });
    expect(result.current.timerState).toBe("active");

    // Progress between 0.1 and 0.3 -> warning
    act(() => {
      vi.advanceTimersByTime(300000); // another 5 minutes, progress = 0
    });
    expect(result.current.timerState).toBe("danger");
  });

  it("should not start if totalSeconds is 0", () => {
    const { result } = renderHook(() => useTimer({ initialMinutes: 1 }));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(result.current.totalSeconds).toBe(0);
    expect(result.current.isRunning).toBe(false);

    // Try to start again
    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(false);
  });

  it("should format minutes and seconds correctly", () => {
    const { result } = renderHook(() => useTimer({ initialMinutes: 1 }));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.minutes).toBe(0);
    expect(result.current.seconds).toBe(55);
  });
});
