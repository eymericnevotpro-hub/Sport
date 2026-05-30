// Vercel serverless function — assistant Claude intégré (coach sport + nutrition).
// Répond en français et peut proposer des changements appliqués par l'app
// (changer de programme, ajuster la nutrition) via l'outil `respond`.

const MODEL = 'claude-sonnet-4-6';
const apiKey = process.env.ANTHROPIC_API_KEY;

const FOOD_ITEM = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    qty: { type: 'number', description: 'Quantité (ex: 150 pour 150 g, 2 pour 2 unités).' },
    unit: { type: 'string', description: "Unité ('g', '' pour unités, etc.)." },
    kcal: { type: 'number' },
    protein: { type: 'number' }, carbs: { type: 'number' }, fat: { type: 'number' },
  },
  required: ['name', 'kcal'],
};
const MEAL_ARRAY = { type: 'array', items: FOOD_ITEM };

const RESPOND_TOOL = {
  name: 'respond',
  description: "Répond à l'utilisateur et, si pertinent, applique des changements dans l'app.",
  input_schema: {
    type: 'object',
    properties: {
      reply: { type: 'string', description: "Réponse à l'utilisateur, en français, concise, concrète et bienveillante (tutoiement)." },
      actions: {
        type: 'array',
        description: "Changements à appliquer dans l'app. Vide si l'utilisateur pose juste une question.",
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['set_program', 'set_nutrition', 'set_meal_plan', 'set_day_exercises'] },
            programId: { type: 'string', enum: ['ppl', 'split', 'upperlow', 'fullbody'], description: 'Pour set_program.' },
            kcal: { type: 'number', description: 'Pour set_nutrition : calories/jour.' },
            protein: { type: 'number' }, carbs: { type: 'number' }, fat: { type: 'number' },
            day: { type: 'string', description: "Pour set_day_exercises : le TITRE exact d'un jour du programme actuel (voir context.joursDuProgramme)." },
            exercises: {
              type: 'array',
              description: "Pour set_day_exercises : nouvelle liste d'exercices. Utilise UNIQUEMENT des clés de context.exercicesDisponibles.",
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string', description: "Clé d'exercice de la bibliothèque (context.exercicesDisponibles)." },
                  sets: { type: 'number' }, reps: { type: 'number' }, weight: { type: 'number', description: 'kg (0 si poids du corps).' },
                },
                required: ['key', 'sets', 'reps'],
              },
            },
            meals: {
              type: 'object',
              description: "Pour set_meal_plan : repas de la journée (chaque aliment avec quantité + macros).",
              properties: { b: MEAL_ARRAY, l: MEAL_ARRAY, s: MEAL_ARRAY, d: MEAL_ARRAY },
            },
          },
          required: ['type'],
        },
      },
    },
    required: ['reply'],
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!apiKey) { res.status(500).json({ error: 'Clé API non configurée.' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const { messages = [], context = {} } = body || {};

  const history = (Array.isArray(messages) ? messages : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content }));
  if (!history.length || history[history.length - 1].role !== 'user') {
    res.status(400).json({ error: 'Message manquant.' });
    return;
  }

  const system =
    "Tu es l'assistant intégré de BOND, une app de sport & nutrition. Tu es un coach expert, " +
    "bienveillant, qui tutoie et reste concis et concret.\n\n" +
    'Profil et état actuels de l\'utilisateur : ' + JSON.stringify(context) + '\n\n' +
    "Tu peux APPLIQUER des changements via l'outil respond > actions :\n" +
    "- set_program(programId) : ppl, split, upperlow, fullbody.\n" +
    "- set_nutrition(kcal, protein, carbs, fat) : objectifs nutritionnels quotidiens.\n" +
    "- set_day_exercises(day, exercises) : remplace les exercices d'UNE séance. `day` = le titre EXACT d'un jour de context.joursDuProgramme. " +
    "`exercises` n'utilise QUE des `key` listées dans context.exercicesDisponibles (sinon pas de visuel). Donne sets/reps/weight cohérents avec le niveau et le poids de l'athlète.\n" +
    "- set_meal_plan(meals) : crée le plan repas du jour (b/l/s/d) avec quantités et macros, en visant context.nutritionCible (ex: plan végétarien, plus de protéines, etc.).\n\n" +
    "RÈGLE IMPORTANTE : si l'utilisateur demande un plan repas, une modification de séance, " +
    "un changement de programme ou de nutrition, tu DOIS le faire via une action (set_meal_plan, " +
    "set_day_exercises, set_program, set_nutrition). N'écris JAMAIS le détail complet d'un plan repas " +
    "ou d'une liste d'exercices dans `reply` : mets les données dans l'action, et garde `reply` court " +
    "(une phrase de confirmation). Pour un plan repas, remplis toujours les 4 repas (b/l/s/d) avec " +
    "quantités et macros visant context.nutritionCible. " +
    "Si une demande d'exercice n'existe pas dans la bibliothèque, choisis l'équivalent le plus proche disponible. " +
    "Réponds toujours en appelant l'outil respond.";

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system,
        tools: [RESPOND_TOOL],
        tool_choice: { type: 'tool', name: 'respond' },
        messages: history,
      }),
    });
    if (!r.ok) {
      const t = await r.text().catch(() => '');
      console.error('chat api error', r.status, t);
      res.status(502).json({ error: 'Assistant indisponible, réessaie.' });
      return;
    }
    const data = await r.json();
    const tool = (data.content || []).find((b) => b.type === 'tool_use');
    if (!tool || !tool.input) { res.status(502).json({ error: 'Réponse IA invalide.' }); return; }
    res.status(200).json({ reply: tool.input.reply || '', actions: Array.isArray(tool.input.actions) ? tool.input.actions : [] });
  } catch (e) {
    console.error('chat handler error', e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
