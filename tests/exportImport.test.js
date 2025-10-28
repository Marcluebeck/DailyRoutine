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

describe('export/import helpers', () => {
  let storage;
  let helpers;

  beforeEach(async () => {
    globalThis.localStorage = createLocalStorageMock();
    vi.resetModules();
    document.body.innerHTML = '';
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock');
    globalThis.URL.revokeObjectURL = vi.fn();
    storage = await import('../src/js/storage.js');
    helpers = await import('../src/js/exportImport.js');
  });

  it('creates a downloadable export and cleans up the temporary link', () => {
    const appendSpy = vi.spyOn(document.body, 'append');
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    const removeSpy = vi
      .spyOn(HTMLElement.prototype, 'remove')
      .mockImplementation(function () {
        if (this.parentNode) {
          this.parentNode.removeChild(this);
        }
      });

    const blob = helpers.downloadExport('test-export.json');

    expect(blob).toBeInstanceOf(Blob);
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(appendSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
  });

  it('imports data from file and updates storage state', async () => {
    storage.addPoints(10);
    const snapshot = storage.getState();
    const updated = { ...snapshot, points: 99 };
    const file = {
      text: () => Promise.resolve(JSON.stringify(updated))
    };

    await helpers.importFromFile(file);

    expect(storage.getState().points).toBe(99);
  });
});
