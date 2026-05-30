// Vercel serverless function — assistant Claude intégré (coach sport + nutrition).
// Répond en français et peut proposer des changements appliqués par l'app
// (changer de programme, ajuster la nutrition) via l'outil `respond`.

const MODEL = 'claude-sonnet-4-6';
const apiKey = process.env.ANTHROPIC_API_KEY;

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
            type: { type: 'string', enum: ['set_program', 'set_nutrition'] },
            programId: { type: 'string', enum: ['ppl', 'split', 'upperlow', 'fullbody'], description: 'Pour set_program : ppl=Push/Pull/Legs, split=Split par muscle, upperlow=Haut/Bas, fullbody=Full Body.' },
            kcal: { type: 'number', description: 'Pour set_nutrition : calories/jour.' },
            protein: { type: 'number' }, carbs: { type: 'number' }, fat: { type: 'number' },
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
    "- set_program(programId) parmi : ppl (Push/Pull/Legs), split (Split par muscle), upperlow (Haut/Bas), fullbody (Full Body).\n" +
    "- set_nutrition(kcal, protein, carbs, fat) pour fixer les objectifs nutritionnels quotidiens.\n" +
    "N'applique une action que si l'utilisateur le demande clairement. Sinon, réponds juste. " +
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
