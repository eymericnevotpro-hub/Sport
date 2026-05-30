/* programStore.js — persisted selection of the active training program. */
import { PROGRAMS } from './programs.js';

const KEY = 'bond.program.v1';

function load() {
  try {
    const id = localStorage.getItem(KEY);
    return PROGRAMS.some((p) => p.id === id) ? id : PROGRAMS[0].id;
  } catch { return PROGRAMS[0].id; }
}

let current = load();
const subs = new Set();

export function getProgramId() { return current; }

export function setProgramId(id) {
  if (!PROGRAMS.some((p) => p.id === id)) return;
  current = id;
  try { localStorage.setItem(KEY, id); } catch { /* quota */ }
  subs.forEach((fn) => fn());
}

export function subscribeProgram(fn) { subs.add(fn); return () => subs.delete(fn); }
