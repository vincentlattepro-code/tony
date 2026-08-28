TONY HOME CORE — v0.2

CE QUI FONCTIONNE DANS CE PROTOTYPE
- Interface plein écran réutilisant le visuel validé.
- Effet de respiration/présence visuelle.
- Synthèse vocale du navigateur.
- Reconnaissance vocale si le navigateur Android l'autorise.
- Démonstration alarme / portail / scénario « je vais me coucher ».
- Mémoire locale de démonstration via localStorage.
- PWA installable lorsque le site est servi en HTTPS.

CE QUI EST PRÉPARÉ MAIS PAS ENCORE RÉEL
- Connexion Home Assistant.
- Identification de la personne par sa voix.
- Modèle facial 3D avec clignement des yeux, lèvres, regard et expressions.
- IA conversationnelle et mémoire serveur.
- Agenda, mails, énergie et propositions contextuelles.

ARCHITECTURE CIBLE
Tablette/PWA -> micro + interface/avatar
               -> backend Tony (secrets, profils, mémoire, IA)
               -> Home Assistant (états + services)
               -> calendrier / services autorisés

IMPORTANT
Une image 2D ne devient pas magiquement un vrai personnage 3D articulé. La v0.2 simule une présence visuelle.
Pour les vrais yeux/lèvres/expressions, il faudra ajouter un avatar/modèle animé ou une couche vidéo/animation dédiée.

TEST GRATUIT
1. Décompresser le dossier.
2. Créer un dépôt GitHub.
3. Envoyer tous les fichiers à la racine du dépôt.
4. Settings > Pages > Deploy from a branch > main / root.
5. Ouvrir l'URL GitHub Pages sur la tablette Android.
6. Ajouter à l'écran d'accueil / utiliser le mode plein écran si proposé.

SÉCURITÉ
Ne jamais mettre un token Home Assistant ou une clé d'API IA directement dans app.js/config.json sur GitHub Pages.
La connexion réelle passera par un backend/proxy sécurisé.
