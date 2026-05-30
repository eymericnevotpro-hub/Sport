/* nutrition.js — calcule les besoins caloriques et macros à partir du profil.
   Mifflin-St Jeor (BMR) × activité, ajusté selon l'objectif. */

const ACTIVITY = { 'Débutant': 1.45, 'Intermédiaire': 1.55, 'Avancé': 1.65 };
const GOAL_ADJ = { 'Prise de masse': 350, 'Perte de gras': -450, 'Maintien': 0, 'Force': 150 };

const DEFAULT_GOAL = { kcalGoal: 2200, p: 160, c: 220, f: 70, computed: false };

export function computeNutritionGoal(p) {
  // Override explicite (recommandation IA appliquée, ou réglage manuel).
  if (p && p.nutritionOverride && p.nutritionOverride.kcalGoal) {
    return { ...p.nutritionOverride, computed: true, override: true };
  }
  if (!p || !p.weight || !p.height || !p.age) return DEFAULT_GOAL;

  const bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex === 'femme' ? -161 : 5);
  const tdee = bmr * (ACTIVITY[p.level] || 1.55);
  const kcal = Math.max(1200, Math.round((tdee + (GOAL_ADJ[p.goal] || 0)) / 10) * 10);

  const proteinPerKg = p.goal === 'Perte de gras' ? 2.2 : 2.0;
  const protein = Math.round(p.weight * proteinPerKg);
  const fat = Math.round(p.weight * 0.9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));

  return { kcalGoal: kcal, p: protein, c: carbs, f: fat, computed: true };
}
