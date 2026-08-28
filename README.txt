TONY VIDEO AVATAR v3

Cette version utilise uniquement :
- la dernière image fournie par l'utilisateur ;
- les 7 vidéos PixVerse fournies.

Amélioration principale :
- deux lecteurs vidéo superposés ;
- la vidéo suivante est préchargée avant la fin de la vidéo courante ;
- crossfade court (~220 ms) entre les clips ;
- cache anticipé des clips pour réduire les coupures ;
- alternance automatique repos/parole.

Audio :
- les éléments vidéo sont forcés en muted ;
- seul le fichier audio choisi dans la page est audible.

Important :
les fichiers vidéo eux-mêmes ne sont pas modifiés pour retirer ou masquer leur filigrane.
Pour un rendu sans filigrane, remplacer les MP4 par des exports autorisés sans watermark
en conservant les mêmes noms clip1.mp4 ... clip7.mp4.

GitHub Pages :
téléverser index.html, app.js, manifest.json, README.txt, tony-cover.png
ET le dossier videos/ complet.
