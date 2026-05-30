/* cloudSync.js — keeps profile, program and photos in sync with the server
   (/api/state) so the same data shows up on PC and phone. localStorage stays
   as an offline cache; the server is the source of truth on load. */
import * as profile from './profileStore.js';
import * as program from './programStore.js';
import * as photos from './photoStore.js';

let loaded = false;     // initial pull finished
let hydrating = false;  // applying server data → don't echo it back
let timer = null;       // debounce push
let lastSent = '';      // skip redundant pushes

function snapshot() {
  return {
    v: 1,
    profile: profile.exportState(),
    program: program.exportState(),
    photos: photos.exportState(),
  };
}

async function pull() {
  try {
    const r = await fetch('/api/state', { cache: 'no-store' });
    if (r.ok) {
      const d = await r.json();
      if (d && typeof d === 'object') {
        hydrating = true;
        try {
          if (d.profile) profile.importState(d.profile);
          if (d.program) program.importState(d.program);
          if (d.photos) photos.importState(d.photos);
          lastSent = JSON.stringify(snapshot());
        } finally {
          hydrating = false;
        }
      }
    }
  } catch { /* offline → keep local cache */ }
  loaded = true;
}

async function push() {
  const snap = JSON.stringify(snapshot());
  if (snap === lastSent) return;
  lastSent = snap;
  try {
    await fetch('/api/state', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: snap,
    });
  } catch { /* will retry on next change */ }
}

function schedule() {
  if (hydrating || !loaded) return;
  clearTimeout(timer);
  timer = setTimeout(() => { timer = null; push(); }, 1200);
}

export function initCloudSync() {
  profile.subscribeProfile(schedule);
  program.subscribeProgram(schedule);
  photos.subscribe(schedule);
  pull();
  // Re-pull when returning to the app (e.g. switching device/tab) — but only
  // when there's nothing pending locally, so we never clobber unsaved edits.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && loaded && !timer) pull();
  });
}
