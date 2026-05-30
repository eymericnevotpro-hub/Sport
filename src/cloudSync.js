/* cloudSync.js — keeps profile, program and photos in sync with the server
   (/api/state) so the same data shows up on PC and phone. localStorage stays
   as an offline cache; the server is the source of truth on initial load.

   Carefully avoids clobbering a fresh local change (e.g. a photo just taken
   with the camera) with a stale server pull when the tab becomes visible. */
import * as profile from './profileStore.js';
import * as program from './programStore.js';
import * as photos from './photoStore.js';

let loaded = false;     // initial pull finished
let hydrating = false;  // applying server data → don't echo it back
let pushTimer = null;   // debounce push
let pullTimer = null;   // debounce the visibility re-pull
let lastSent = '';      // skip redundant pushes
let localRev = 0;       // bumped on every genuine local change
let lastChangeAt = 0;   // timestamp of the last local change

function snapshot() {
  return {
    v: 1,
    profile: profile.exportState(),
    program: program.exportState(),
    photos: photos.exportState(),
  };
}

async function pull() {
  const rev = localRev; // remember the local revision before the network round-trip
  try {
    const r = await fetch('/api/state', { cache: 'no-store' });
    if (r.ok) {
      const d = await r.json();
      // A local change happened while we were fetching → the server data is now
      // stale relative to the user; don't overwrite their fresh edit.
      if (rev !== localRev) { loaded = true; return; }
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
  if (hydrating) return; // change caused by our own hydration → ignore
  localRev++;
  lastChangeAt = Date.now();
  // A genuine local change cancels any pending re-pull so it can't clobber us.
  if (pullTimer) { clearTimeout(pullTimer); pullTimer = null; }
  if (!loaded) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => { pushTimer = null; push(); }, 1200);
}

// Safe to re-pull only when nothing local is pending/recent.
function canPull() {
  return !pushTimer && Date.now() - lastChangeAt > 4000;
}

export function initCloudSync() {
  profile.subscribeProfile(schedule);
  program.subscribeProgram(schedule);
  photos.subscribe(schedule);
  pull();
  // When returning to the app (switching device/tab), re-pull after a short
  // delay — but only if nothing is pending and no local change interrupts it.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !loaded) return;
    if (pullTimer) clearTimeout(pullTimer);
    pullTimer = setTimeout(() => {
      pullTimer = null;
      if (canPull()) pull();
    }, 1800);
  });
}
