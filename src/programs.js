/* programs.js — façade côté client : données partagées + adaptation liée au profil. */
import { getProfile } from './profileStore.js';
import { adaptDayWith } from './programsData.js';

export {
  PROGRAMS, WEEKDAYS, EX, exerciseList, makeExercise,
  getProgramById, durationOf, todayIndex, dayForSlot, shortLabel, withOverrideData,
} from './programsData.js';

// Adapte les charges au profil courant de l'utilisateur.
export function adaptDay(day) {
  return adaptDayWith(day, getProfile());
}
