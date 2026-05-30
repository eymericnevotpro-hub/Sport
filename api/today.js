// Vercel serverless — renvoie la séance du jour résolue (programme → jour →
// exercices avec charges adaptées au profil). Consommé par l'app montre.
import { get } from '@vercel/blob';
import {
  getProgramById, todayIndex, dayForSlot, withOverrideData, adaptDayWith,
} from '../src/programsData.js';

const PATH = 'state.json';
const token = process.env.BLOB_READ_WRITE_TOKEN;

async function readState() {
  if (!token) return {};
  const result = await get(PATH, { access: 'private', token, useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return {};
  return await new Response(result.stream).json().catch(() => ({}));
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const st = await readState();
    const profile = (st.profile && st.profile.profile) || {};
    const ps = st.program;
    const programId = typeof ps === 'string' ? ps : (ps && ps.id) || 'ppl';
    const overrides = (ps && ps.overrides) || {};
    const program = getProgramById(programId);

    // weekday optionnel (0=Lun..6=Dim) envoyé par la montre (heure locale).
    let idx = todayIndex();
    const q = req.query && req.query.weekday;
    if (q != null && q !== '') { const n = parseInt(q, 10); if (n >= 0 && n <= 6) idx = n; }

    let day = dayForSlot(program, idx);
    let exercises = [];
    if (day) {
      day = withOverrideData(day, overrides);
      day = adaptDayWith(day, profile);
      exercises = day.exercises.map((e) => ({
        name: e.name, sets: e.sets, reps: e.reps, weight: e.weight || 0, rest: e.rest || 75,
      }));
    }
    res.status(200).json({
      program: program.name,
      rest: !day,
      title: day ? day.title : 'Repos',
      kcal: day ? day.kcal : 0,
      exercises,
      athlete: profile.name || 'Brick',
    });
  } catch (e) {
    console.error('today handler error', e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
