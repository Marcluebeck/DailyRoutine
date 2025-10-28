import { beforeEach, describe, expect, it, vi } from 'vitest';

const createLocalStorageMock = (initial = {}) => {
  let store = { ...initial };
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

describe('storage', () => {
  let storage;

  const importStorage = async () => {
    storage = await import('../src/js/storage.js');
  };

  beforeEach(async () => {
    globalThis.localStorage = createLocalStorageMock();
    vi.resetModules();
    await importStorage();
  });

  it('provides default state with starter tasks and settings', () => {
    const state = storage.getState();
    expect(state.tasks.map((task) => task.id)).toEqual([
      'brush-teeth',
      'get-dressed',
      'breakfast'
    ]);
    expect(state.settings.motivationMessages.length).toBeGreaterThan(0);
    expect(state.progression.completedTaskIds).toEqual([]);
  });

  it('updates tasks and cleans up progression when setTasks is used', () => {
    const { tasks } = storage.getState();
    const [firstTask] = tasks;
    storage.setTasks([
      firstTask,
      { id: 'new-task', name: 'Neue Aufgabe', duration: 4 }
    ]);
    const updated = storage.getState();
    expect(updated.tasks).toHaveLength(2);
    expect(updated.tasks[1].id).toBe('new-task');
    expect(updated.progression.activeTaskId).toBeNull();
    expect(updated.progression.completedTaskIds.every((id) => id === firstTask.id)).toBe(true);
  });

  it('adds and spends points without dropping below zero', () => {
    storage.addPoints(10);
    let current = storage.getState();
    expect(current.points).toBe(10);
    expect(storage.spendPoints(5)).toBe(true);
    current = storage.getState();
    expect(current.points).toBe(5);
    expect(storage.spendPoints(10)).toBe(false);
    expect(storage.getState().points).toBe(5);
  });

  it('imports external state while merging defaults', async () => {
    const snapshot = storage.getState();
    const imported = {
      ...snapshot,
      tasks: [{ id: 'read-book', name: 'Buch lesen', duration: 6 }],
      settings: { voiceEnabled: true }
    };
    storage.importState(JSON.stringify(imported));
    const state = storage.getState();
    expect(state.tasks).toHaveLength(1);
    expect(state.settings.voiceEnabled).toBe(true);
    // Default messages should still exist because of merge
    expect(state.settings.motivationMessages.length).toBeGreaterThan(0);
  });
});
