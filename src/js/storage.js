const STORAGE_KEY = 'mein-super-start::state';

function deepClone(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

const defaultState = {
  points: 0,
  inventory: [],
  tasks: [
    { id: 'brush-teeth', name: 'Zähne putzen', duration: 3 },
    { id: 'get-dressed', name: 'Anziehen', duration: 5 },
    { id: 'breakfast', name: 'Frühstück', duration: 10 }
  ],
  settings: {
    autoAdvance: false,
    voiceEnabled: false,
    motivationMessages: [
      'Glitzer-Alarm! Weiter so!',
      'Wow, du rockst den Morgen!',
      'Noch ein Schritt bis zum Regenbogen!'
    ],
    shopOverrides: {}
  },
  progression: {
    completedTaskIds: [],
    activeTaskId: null
  }
};

let state = loadState();
const listeners = new Set();

function loadState() {
  if (typeof localStorage === 'undefined') {
    return deepClone(defaultState);
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return deepClone(defaultState);
    }
    const parsed = JSON.parse(stored);
    return {
      ...deepClone(defaultState),
      ...parsed,
      settings: {
        ...deepClone(defaultState.settings),
        ...(parsed.settings || {})
      },
      progression: {
        ...deepClone(defaultState.progression),
        ...(parsed.progression || {})
      }
    };
  } catch (error) {
    console.warn('Konnte gespeicherte Daten nicht laden', error);
    return deepClone(defaultState);
  }
}

function persist() {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function emit() {
  const snapshot = getState();
  listeners.forEach((listener) => listener(snapshot));
}

export function getState() {
  return deepClone(state);
}

export function onStateChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function updateState(updater) {
  const draft = getState();
  const nextState = updater(draft) || draft;
  state = nextState;
  persist();
  emit();
}

export function resetDay() {
  updateState((draft) => {
    draft.progression.completedTaskIds = [];
    draft.progression.activeTaskId = null;
    return draft;
  });
}

export function setTasks(tasks) {
  updateState((draft) => {
    draft.tasks = tasks;
    draft.progression.completedTaskIds = draft.progression.completedTaskIds.filter((id) =>
      tasks.some((task) => task.id === id)
    );
    if (!tasks.some((task) => task.id === draft.progression.activeTaskId)) {
      draft.progression.activeTaskId = null;
    }
    return draft;
  });
}

export function setSettings(settings) {
  updateState((draft) => {
    draft.settings = { ...draft.settings, ...settings };
    return draft;
  });
}

export function setShopOverride(itemId, cost) {
  updateState((draft) => {
    if (!draft.settings.shopOverrides) {
      draft.settings.shopOverrides = {};
    }
    draft.settings.shopOverrides[itemId] = cost;
    return draft;
  });
}

export function getShopOverride(itemId) {
  const { settings } = getState();
  return settings.shopOverrides?.[itemId] ?? null;
}

export function addPoints(points) {
  updateState((draft) => {
    draft.points = Math.max(0, draft.points + points);
    return draft;
  });
}

export function spendPoints(cost) {
  const current = getState();
  if (current.points < cost) {
    return false;
  }
  updateState((draft) => {
    draft.points -= cost;
    return draft;
  });
  return true;
}

export function markTaskActive(taskId) {
  updateState((draft) => {
    draft.progression.activeTaskId = taskId;
    return draft;
  });
}

export function markTaskComplete(taskId) {
  updateState((draft) => {
    if (!draft.progression.completedTaskIds.includes(taskId)) {
      draft.progression.completedTaskIds.push(taskId);
    }
    draft.progression.activeTaskId = null;
    return draft;
  });
}

export function purchaseItem(itemId) {
  updateState((draft) => {
    if (!draft.inventory.includes(itemId)) {
      draft.inventory.push(itemId);
    }
    return draft;
  });
}

export function exportState() {
  const snapshot = getState();
  return JSON.stringify(snapshot, null, 2);
}

export function importState(jsonString) {
  const parsed = JSON.parse(jsonString);
  state = {
    ...deepClone(defaultState),
    ...parsed,
    settings: {
      ...deepClone(defaultState.settings),
      ...(parsed.settings || {})
    },
    progression: {
      ...deepClone(defaultState.progression),
      ...(parsed.progression || {})
    }
  };
  persist();
  emit();
}

export function getDefaultState() {
  return deepClone(defaultState);
}
