// Vercel serverless function — analyzes progress photos with Claude (vision)
// and returns a coach summary + adjusted-program changes as structured JSON.
// The Anthropic API key lives in the ANTHROPIC_API_KEY env var (never shipped
// to the client).

const MODEL = 'claude-sonnet-4-6';
const MAX_IMAGES = 6;

const REPORT_TOOL = {
  name: 'report',
  description: "Renvoie le bilan physique, les points faibles, le programme d'entraînement ajusté et les recommandations nutritionnelles.",
  input_schema: {
    type: 'object',
    properties: {
      summary: {
        type: 'string',
        description:
          "Bilan court (2-3 phrases) en français, ton de coach motivant et tutoiement. Points forts observés et orientation générale. Pas de markdown.",
      },
      weakPoints: {
        type: 'array',
        description: "2 à 4 points faibles / zones en retard observés sur les photos (ex: 'Bas du dos', 'Mollets', 'Pectoraux supérieurs', 'Gras abdominal').",
        items: { type: 'string' },
      },
      changes: {
        type: 'array',
        description: "3 à 5 ajustements concrets du programme d'entraînement, ciblant les points faibles.",
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['add', 'up', 'down'], description: 'add = exercice/séance ajouté, up = charge/volume augmenté, down = volume réduit' },
            title: { type: 'string', description: 'Titre court de la modification (ex: "Soulevé de terre roumain").' },
            sub: { type: 'string', description: 'Détail court (ex: "Ajouté · Jeudi jambes · 4 × 10").' },
          },
          required: ['type', 'title', 'sub'],
        },
      },
      nutrition: {
        type: 'object',
        description: "Recommandation nutritionnelle quotidienne adaptée à l'objectif, au physique observé et aux mensurations.",
        properties: {
          kcal: { type: 'number', description: 'Calories par jour recommandées.' },
          protein: { type: 'number', description: 'Protéines en grammes/jour.' },
          carbs: { type: 'number', description: 'Glucides en grammes/jour.' },
          fat: { type: 'number', description: 'Lipides en grammes/jour.' },
          advice: { type: 'string', description: '1-2 phrases de conseil nutritionnel concret (ex: priorité protéines, hydratation, réduction sucres).' },
        },
        required: ['kcal', 'protein', 'carbs', 'fat', 'advice'],
      },
    },
    required: ['summary', 'weakPoints', 'changes', 'nutrition'],
  },
};

function parseDataUrl(dataUrl) {
  const m = /^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/i.exec(dataUrl || '');
  if (!m) return null;
  const media = m[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : m[1].toLowerCase();
  return { media_type: media, data: m[2] };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Clé API non configurée sur le serveur." });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const { photos = [], context = {} } = body || {};

  const valid = (Array.isArray(photos) ? photos : [])
    .map((p) => ({ label: p && p.label, img: parseDataUrl(p && p.dataUrl) }))
    .filter((p) => p.img)
    .slice(0, MAX_IMAGES);

  if (!valid.length) {
    res.status(400).json({ error: 'Aucune photo valide fournie.' });
    return;
  }

  const content = [
    {
      type: 'text',
      text:
        "Tu es un coach de musculation et nutrition expert. Analyse ces photos de progression physique " +
        "(face / côté / dos, parfois avant/après).\n\n" +
        'Contexte de l\'athlète (sers-t\'en comme base) : ' + JSON.stringify(context) + '\n\n' +
        'À partir de ce que tu OBSERVES sur les photos et du contexte :\n' +
        '1) identifie les points faibles / zones en retard,\n' +
        '2) propose des ajustements de programme qui ciblent ces points faibles,\n' +
        "3) donne une recommandation nutritionnelle quotidienne (kcal + macros) cohérente avec l'objectif et le physique observé.\n\n" +
        'Pour chaque photo, son angle/époque est indiqué juste avant. ' +
        "Sois bienveillant, précis et concret. Réponds uniquement en appelant l'outil report.",
    },
  ];
  for (const p of valid) {
    content.push({ type: 'text', text: `Photo — ${p.label} :` });
    content.push({ type: 'image', source: { type: 'base64', media_type: p.img.media_type, data: p.img.data } });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        tools: [REPORT_TOOL],
        tool_choice: { type: 'tool', name: 'report' },
        messages: [{ role: 'user', content }],
      }),
    });

    if (!r.ok) {
      const errText = await r.text().catch(() => '');
      console.error('Anthropic API error', r.status, errText);
      res.status(502).json({ error: "L'analyse a échoué (API). Réessaie dans un instant." });
      return;
    }

    const data = await r.json();
    const tool = (data.content || []).find((b) => b.type === 'tool_use');
    if (!tool || !tool.input) {
      res.status(502).json({ error: 'Réponse IA invalide.' });
      return;
    }
    const out = tool.input;
    res.status(200).json({
      summary: out.summary,
      weakPoints: out.weakPoints || [],
      changes: out.changes || [],
      nutrition: out.nutrition || null,
    });
  } catch (e) {
    console.error('analyze handler error', e);
    res.status(500).json({ error: "Erreur serveur pendant l'analyse." });
  }
}
