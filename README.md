# BOND — Sport & Nutrition

Application mobile (Android) de suivi sport + nutrition, **énergique & minimaliste bouncy**,
accent vert menthe. Construite en **React + Vite**, déployée sur **Vercel**.

## Écrans

- **Accueil** — carte « Séance du jour », anneaux d'objectifs, aperçu nutrition, graphe de la semaine.
- **Séance** — programme de la semaine + détail des exercices (vignettes animées, séries/reps/poids/repos).
- **Séance en temps réel** — démo de l'exercice, validation des séries (compteurs reps/poids),
  chrono de repos circulaire (+15 s / passer / « à suivre »), écran de fin qui invite à la photo de progression.
- **Nutrition** — anneau calories, macros, hydratation, ajout d'aliments interactif.
- **Progrès** — suivi photo face / côté / dos avec comparaison avant/après, **analyse IA réelle (Claude Vision)**
  qui propose un programme ajusté, et statistiques (poids, mensurations).

Un panneau de réglages (bouton en bas à droite) permet de changer la couleur d'accent et de réduire les animations.

## IA — analyse des photos de progression

L'écran **Progrès** envoie les photos uploadées (face/côté/dos) à une **fonction serverless Vercel**
(`api/analyze.js`) qui appelle l'API Claude (vision) pour générer un bilan et un programme ajusté.
La clé API reste côté serveur — jamais exposée au client.

### Variable d'environnement requise

| Nom | Description |
| --- | --- |
| `ANTHROPIC_API_KEY` | Clé API Claude (configurée dans les variables d'environnement Vercel) |

## Développement

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de production dans dist/
```

> En local, l'endpoint `/api/analyze` n'est servi que via `vercel dev`
> (les routes `api/` sont des fonctions serverless Vercel).

## Stack

- React 18 + Vite 6
- Fonctions serverless Vercel (`/api`)
- API Claude (Anthropic) pour l'analyse photo

Les photos de démonstration des exercices proviennent de la base open-source *free-exercise-db* (domaine public).
