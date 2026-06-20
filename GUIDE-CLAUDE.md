# Guide pour créer des fichiers conformes (à l'usage de Claude)

Ce document fixe les conventions du portail privé Dessin-Provence. Claude doit le lire avant de créer ou modifier un élève ou un module, afin que tout reste cohérent et qu'aucune donnée ne soit perdue. La vue d'ensemble du système est dans `RECAP-SYSTEME.md`.

## Principes

Un élève égale un dossier sous `public/`. Un module égale un sous-dossier à l'intérieur du dossier de l'élève. Le hub maître `public/index.html` liste les élèves ; le hub d'un élève `public/<eleve>/index.html` liste ses modules ; un module est `public/<eleve>/<module>/index.html`.

Tout ce qui doit être servi sur le web va sous `public/`. Tout le reste (serveur, modèles, documentation) reste à la racine du dépôt et n'est pas publié.

## Conventions de nommage

Les noms de dossiers (les « slugs ») sont en minuscules, sans accent ni espace, avec des traits d'union si besoin. Par exemple : `julindien`, `marine`, `carnet-de-croquis`. Le slug de l'élève sert d'identifiant dans toutes les URL et dans la clé de stockage. Une fois choisi, on ne le change plus.

## Règle d'or du stockage (pour ne rien perdre)

Chaque module qui enregistre des données utilise une variable `CLE` de la forme `"<eleve>.<module>"`, par exemple `"julindien.flash-generateur"`. Cette clé doit être unique dans tout le portail et ne doit JAMAIS être modifiée après coup : c'est elle qui permet de retrouver les données déjà saisies. Mettre à jour le code d'un module est sans danger tant que la `CLE` reste identique. Le stockage passe toujours par `/assets/store.js` (fonctions `DPStore.load` et `DPStore.save`), qui écrit sur le serveur avec un repli automatique dans le navigateur.

## Recette : ajouter un élève

D'abord, créer le dossier et le hub de l'élève en copiant `_modeles/modele-hub-eleve.html` vers `public/<eleve>/index.html`. Dans ce nouveau fichier, remplacer `{{PRENOM}}` par le prénom (aux deux endroits) et `{{ELEVE}}` par le slug, puis remplir le tableau `MODULES` au fur et à mesure que des modules sont ajoutés.

Ensuite, inscrire l'élève dans le hub maître `public/index.html` : ajouter une entrée au tableau `STUDENTS`, par exemple :

```js
{ titre: "Hub de Marine", badge: "Actif", description: "Applications et exercices de Marine.", url: "/marine/", disponible: true },
```

Mettre `disponible: false` si le hub n'est pas encore prêt (la carte s'affiche alors grisée, non cliquable).

## Recette : ajouter un module à un élève

D'abord, créer le module en copiant `_modeles/modele-module.html` vers `public/<eleve>/<module>/index.html`. Dans ce fichier, définir la `CLE` à `"<eleve>.<module>"`, vérifier que le bouton retour pointe vers `/<eleve>/`, adapter le titre et la logique du module.

Ensuite, inscrire le module dans le hub de l'élève `public/<eleve>/index.html` : ajouter une entrée au tableau `MODULES`, par exemple :

```js
{ titre: "Carnet de croquis", badge: "Aquarelle", description: "Exercices guidés.", url: "/marine/carnet-de-croquis/" },
```

Les `url` commencent et se terminent toujours par une barre oblique.

## Recette : mettre à jour un module existant

Modifier le contenu du fichier `public/<eleve>/<module>/index.html` autant que nécessaire, sans jamais changer sa `CLE`. Comme les données sont identifiées par cette clé et stockées côté serveur, elles restent intactes après le redéploiement. GitHub conserve par ailleurs l'historique de toutes les versions du fichier.

## À ne jamais faire

Ne pas réutiliser une `CLE` déjà attribuée à un autre module. Ne pas renommer le slug d'un élève ou d'un module une fois en service (cela couperait l'accès aux données existantes). Ne pas supprimer ni déplacer les dossiers des autres élèves lors d'une intervention sur un élève donné. Ne pas placer de fichiers de travail ou de documentation sous `public/` (ils deviendraient publics) : ils vont à la racine du dépôt.

## Stockage : comment l'utiliser dans un module

Le module charge ses données à l'initialisation et les enregistre à chaque changement :

```js
const CLE = "eleve.module";              // unique, jamais modifiée ensuite
let data = await DPStore.load(CLE, valeurParDefaut);   // lecture (serveur, sinon navigateur)
DPStore.save(CLE, data);                 // ecriture (serveur + repli navigateur)
```

La valeur stockée peut être n'importe quelle donnée JSON (tableau, objet). Le serveur la conserve telle quelle.

## Déploiement

Après modification, envoyer les fichiers sur GitHub (dépôt `MrROUXEL/flash-generateur`), puis cliquer sur « Deploy » dans Coolify. Rappel : l'application a besoin d'un volume persistant monté sur `/data` dans Coolify pour conserver durablement les données (réglage unique, décrit dans `RECAP-SYSTEME.md`).

## Vérifications avant de conclure

Vérifier que la nouvelle page est bien sous `public/`, que les liens (`url` dans les tableaux, `href` du bouton retour) sont corrects et terminés par une barre oblique, que la `CLE` du module est unique et cohérente avec le chemin, et que l'élève ou le module a bien été inscrit dans le tableau du niveau supérieur (`STUDENTS` pour un élève, `MODULES` pour un module). Contrôler enfin que le HTML est valide (balises équilibrées).
