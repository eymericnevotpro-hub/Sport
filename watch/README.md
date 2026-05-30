# BOND — App Galaxy Watch 7 (Wear OS)

App montre **privée** (sideloadée, pas sur le Play Store) qui affiche **la séance du jour**
et gère le **chrono de repos qui vibre même écran éteint**. Elle lit les **mêmes données
en ligne** que ton app web/téléphone (endpoint `https://sport-solo.vercel.app/api/today`),
donc le programme, le jour et les charges sont toujours synchronisés avec ton compte.

> La Galaxy Watch 7 tourne sous **Wear OS 5** (API 34). Ce projet cible API 34, min API 30.

## Ce que fait l'app
- Récupère la séance du jour (programme + jour de la semaine + charges adaptées à ton profil).
- Liste les exercices ; bouton **Commencer**.
- Validation des séries au poignet (**Valider ✓**).
- **Chrono de repos** entre les séries : décompte + **vibration forte à la fin, même écran verrouillé**
  (via une alarme exacte système). Boutons **+15s** et **Passer**.
- Jour de repos → écran « Repos ».

## Prérequis (sur ton PC)
1. **Android Studio** (dernière version) — https://developer.android.com/studio
2. Au premier lancement, laisse-le installer le **SDK Android 34** + les **build-tools**.

## Compiler le projet
1. Dans Android Studio : **File → Open** → sélectionne le dossier **`watch/`** (celui-ci).
2. Laisse **Gradle Sync** se faire (il télécharge tout seul Gradle et les dépendances).
   - Si demandé, accepte d'installer les composants manquants.
3. Quand la barre du bas affiche « BUILD SUCCESSFUL / Sync finished », c'est prêt.

## Activer le mode développeur sur la Galaxy Watch 7
1. Sur la montre : **Paramètres → À propos de la montre → Logiciel** → tape **7 fois** sur
   « Version du logiciel » → le mode développeur s'active.
2. **Paramètres → Options de développement** → active **Débogage ADB** et **Débogage sans fil**.
3. Note l'**adresse IP** de la montre (Débogage sans fil → l'IP:port est affiché) et assure-toi
   que la montre et le PC sont sur le **même Wi-Fi**.

## Installer l'app sur la montre
**Option A — sans fil (recommandé)**
1. Sur la montre, dans **Débogage sans fil → Associer l'appareil avec un code**, note `IP:port` + code.
2. Sur le PC (terminal), depuis le dossier des platform-tools du SDK (ou si `adb` est dans le PATH) :
   ```
   adb pair IP:PORT_DE_PAIRING        # entre le code affiché
   adb connect IP:PORT_DE_DEBUG       # le port de la page "Débogage sans fil"
   ```
3. Dans Android Studio, la montre apparaît dans la liste des appareils en haut → clique **Run ▶**.

**Option B — via Android Studio directement**
- Android Studio → menu appareils → **Pair Devices Using Wi-Fi** → scanne le QR ou entre le code,
  puis **Run ▶**.

L'app **BOND** apparaît ensuite dans la liste des apps de la montre.

## Important
- À la **première ouverture** sur la montre, Android peut demander l'autorisation des **alarmes/rappels**
  (pour la vibration écran éteint) → accepte.
- La montre doit avoir le **Wi-Fi** (ou data via téléphone) pour charger la séance depuis le compte en ligne.
- **Compte unique sans login** (comme l'app web) : la montre lit le même compte, donc les mêmes données.

## Limites connues (v1)
- Si Wear OS tue l'app pendant un long repos écran éteint, la **vibration de fin se déclenche quand même**
  (alarme système), mais l'écran de séance peut repartir de l'accueil au réveil — tu reprends en 1 tap.
- L'app montre est en **lecture** pour la structure de séance ; la validation des séries reste locale
  (pas encore renvoyée au compte). On pourra l'ajouter ensuite.

## Personnaliser
- Bundle ID : `com.brick.bondwatch` (modifiable dans `app/build.gradle.kts`).
- Couleur d'accent : variable `Mint` dans `Ui.kt` (orange `#FF7A4D`, cohérent avec l'app).
