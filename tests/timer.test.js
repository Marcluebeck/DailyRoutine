import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('timer', () => {
  let timer;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    timer = await import('../src/js/timer.js');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts down and calls complete handler when reaching zero', () => {
    const onTick = vi.fn();
    const onComplete = vi.fn();
    timer.onTick(onTick);
    timer.onComplete(onComplete);

    timer.start(3);

    expect(onTick).toHaveBeenCalledWith({ remainingSeconds: 3, totalSeconds: 3 });

    vi.advanceTimersByTime(3000);

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(timer.getRemainingSeconds()).toBe(0);
    expect(timer.isRunning()).toBe(false);
  });

  it('pauses without resetting remaining seconds', () => {
    const onTick = vi.fn();
    timer.onTick(onTick);
    timer.onComplete(() => {});

    timer.start(5);
    vi.advanceTimersByTime(2000);
    timer.pause();

    const lastCall = onTick.mock.calls.at(-1)[0];
    expect(lastCall.remainingSeconds).toBe(3);
    expect(timer.isRunning()).toBe(false);
    expect(timer.getRemainingSeconds()).toBe(3);
  });

  it('resets timer state to zero', () => {
    const onTick = vi.fn();
    timer.onTick(onTick);
    timer.onComplete(() => {});

    timer.start(4);
    timer.reset();

    expect(onTick).toHaveBeenLastCalledWith({ remainingSeconds: 0, totalSeconds: 0 });
    expect(timer.getRemainingSeconds()).toBe(0);
  });
});
