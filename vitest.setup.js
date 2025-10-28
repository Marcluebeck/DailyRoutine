import { afterEach, vi } from 'vitest';

afterEach(() => {
  // Vitest automatically restores mocks, but explicit call guards against leaked spies
  vi.restoreAllMocks();
});
