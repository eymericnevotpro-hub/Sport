/* photoStore.js — localStorage-backed image store with pub/sub.
   Replaces the Claude Design <image-slot> sidecar so uploads persist in a
   real browser and the AI feature can read the data URLs. */

const KEY = 'bond.photos.v1';
const MAX_DIM = 1024;

let store = load();
const subs = new Set();

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }
  catch { return {}; }
}
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* quota */ }
}

export function getPhoto(id) { return store[id] || null; }

export function setPhoto(id, dataUrl) {
  if (!id) return;
  if (dataUrl) store[id] = dataUrl; else delete store[id];
  persist();
  subs.forEach((fn) => fn());
}

export function subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }

// Cloud sync hooks.
export function exportState() { return store; }
export function importState(s) {
  if (s && typeof s === 'object') { store = s; persist(); subs.forEach((fn) => fn()); }
}

// Downscale an uploaded File to a capped JPEG data URL.
export async function fileToDataUrl(file) {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.82);
  } finally {
    bitmap.close && bitmap.close();
  }
}
