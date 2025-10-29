import { beforeEach, describe, expect, it, vi } from 'vitest';

const createLocalStorageMock = () => {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
};

describe('gameLogic', () => {
  let storage;
  let gameLogic;

  beforeEach(async () => {
    globalThis.localStorage = createLocalStorageMock();
    vi.resetModules();
    storage = await import('../src/js/storage.js');
    gameLogic = await import('../src/js/gameLogic.js');
  });

  it('marks task active when starting and returns the task data', () => {
    const [task] = storage.getState().tasks;
    const started = gameLogic.startTask(task.id);
    expect(started).toMatchObject({ id: task.id, duration: task.duration });
    expect(storage.getState().progression.activeTaskId).toBe(task.id);
  });

  it('completes a task, awards points and resets active task', () => {
    const [task] = storage.getState().tasks;
    gameLogic.startTask(task.id);
    const result = gameLogic.completeTask(task.id);
    expect(result.pointsAwarded).toBe(Math.max(5, task.duration * 2));
    const state = storage.getState();
    expect(state.points).toBe(result.pointsAwarded);
    expect(state.progression.completedTaskIds).toContain(task.id);
    expect(state.progression.activeTaskId).toBeNull();
  });

  it('evaluates rewards based on completed tasks', () => {
    storage.updateState((draft) => {
      draft.progression.completedTaskIds = ['a', 'b', 'c'];
      return draft;
    });
    const rewards = gameLogic.evaluateRewards([
      { id: 'first', threshold: 1, name: 'Erste' },
      { id: 'fifth', threshold: 5, name: 'Fünfte' }
    ]);
    expect(rewards).toEqual([
      expect.objectContaining({ id: 'first', earned: true }),
      expect.objectContaining({ id: 'fifth', earned: false })
    ]);
  });

  it('allows purchasing shop items only when enough points are available', () => {
    storage.addPoints(30);
    const canAfford = gameLogic.buyItem({ id: 'sparkle', cost: 20 });
    expect(canAfford).toBe(true);
    expect(storage.getState().inventory).toContain('sparkle');
    expect(gameLogic.buyItem({ id: 'cloud', cost: 50 })).toBe(false);
  });

  it('returns motivational messages from custom or default pools', () => {
    const fallback = gameLogic.getMotivationMessage();
    expect(typeof fallback).toBe('string');
    const custom = ['Los geht\'s!', 'Weiter machen!'];
    const result = gameLogic.getMotivationMessage(custom);
    expect(custom).toContain(result);
  });

  it('returns the next unfinished task', () => {
    const { tasks } = storage.getState();
    const [firstTask, secondTask] = tasks;
    storage.updateState((draft) => {
      draft.progression.completedTaskIds = [firstTask.id];
      return draft;
    });
    const next = gameLogic.nextTask(tasks);
    expect(next).toMatchObject({ id: secondTask.id });
  });
});
