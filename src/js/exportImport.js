import { exportState, importState } from './storage.js';

export function exportToBlob() {
  const json = exportState();
  return new Blob([json], { type: 'application/json' });
}

export function downloadExport(filename = 'mein-super-start-export.json') {
  const blob = exportToBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return blob;
}

export async function importFromFile(file) {
  const content = await file.text();
  importState(content);
}
