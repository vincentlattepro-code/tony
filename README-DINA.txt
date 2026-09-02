DINA LIVE2D — PACK GITHUB PAGES

CONTENU
- index.html : interface Dina
- app.js : chargement Live2D, mouvements, suivi du pointeur, test audio et synchro bouche
- manifest.json : paramètres PWA
- assets/dina/ : fichiers runtime du modèle Live2D + dina_kokoro.wav

INSTALLATION SUR LE DEPOT GITHUB
1. Conserver GitHub Pages activé sur la branche principale.
2. Remplacer index.html, app.js et manifest.json par ceux de ce pack.
3. Téléverser le dossier assets/ en conservant exactement son arborescence.
4. Les anciens fichiers Tony/videos peuvent être supprimés après validation de Dina.
5. Attendre le déploiement GitHub Pages puis recharger la page sans cache.

TEST
- Dina doit apparaître et rester animée.
- Le regard suit le pointeur.
- Cliquer TEST VOIX FRANÇAISE : dina_kokoro.wav est joué et ParamMouthOpenY suit l'amplitude audio.

IMPORTANT
- Le WAV est uniquement un test/référence. La future voix Kokoro sera générée par le backend local puis envoyée au navigateur.
- Cette page charge Cubism Core depuis l'URL officielle Live2D, PixiJS et pixi-live2d-display depuis CDN. Une connexion réseau est donc nécessaire au chargement initial.
- Les anciens WAV japonais/anglais/coréens/chinois ont volontairement été retirés du pack.
- Le gros modèle fr_FR-mls-medium.onnx trouvé dans le ZIP n'est PAS utilisé : c'est un modèle Piper, pas Kokoro, et il n'est pas nécessaire à GitHub Pages.
