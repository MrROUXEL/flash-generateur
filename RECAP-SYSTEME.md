# Portail privé Dessin-Provence : comment ça marche

Ce document décrit l'ensemble du système, en clair. Il est destiné à vous (Timothée). Pour les consignes techniques permettant de créer de nouveaux fichiers conformes, voir le document `GUIDE-CLAUDE.md`.

## À quoi sert ce portail

Le portail est accessible à l'adresse `https://prive.dessin-provence.com`. C'est votre espace privé pour mettre à disposition de vos élèves accompagnés des petits outils web (les « modules »), par exemple le Flash Générateur de Julien. Chaque élève a son propre espace (son « hub »), et vous gardez par-dessus un tableau de bord qui réunit tous les élèves.

## Les trois niveaux

Le système s'organise en trois étages, du plus général au plus précis.

Le premier niveau est le hub maître, à l'adresse racine `https://prive.dessin-provence.com`. Il liste vos élèves et il est protégé par un mot de passe : tant que le bon mot de passe n'est pas saisi, la page reste masquée. C'est votre point d'entrée.

Le deuxième niveau est le hub d'un élève, par exemple `https://prive.dessin-provence.com/julindien/` pour Julien. Il liste les modules de cet élève. Un hub d'élève n'est pas protégé par mot de passe : vous pouvez en donner le lien direct à l'élève concerné.

Le troisième niveau est le module lui-même, par exemple `https://prive.dessin-provence.com/julindien/flash-generateur/`. C'est l'outil que l'élève utilise.

## L'organisation des fichiers

Tout vit dans un seul dossier (le dépôt envoyé sur GitHub), organisé ainsi :

```
deploiement-flash-generateur/        (dépôt GitHub : MrROUXEL/flash-generateur)
  server.js            le serveur : il sert les pages et enregistre les données
  package.json         la liste des dépendances du serveur
  Dockerfile           la recette de construction pour Coolify
  .dockerignore        ce qui ne part pas dans l'application (docs, modèles)
  RECAP-SYSTEME.md     ce document
  GUIDE-CLAUDE.md      les conventions pour créer de nouveaux fichiers
  _modeles/            des modèles prêts à copier (non publiés)
    modele-hub-eleve.html
    modele-module.html
  public/              tout ce qui est réellement visible sur le web
    index.html         le HUB MAÎTRE (liste des élèves, mot de passe)
    assets/
      store.js         le petit utilitaire qui enregistre les données
    julindien/         le HUB de Julien
      index.html
      flash-generateur/
        index.html     le MODULE Flash Générateur
```

La règle est simple : un élève égale un dossier sous `public/`, et chaque module de cet élève égale un sous-dossier à l'intérieur. Ajouter un élève ou un module revient donc à créer un dossier, sans jamais toucher aux autres.

## Où sont stockées les données

Il faut distinguer deux choses, car ce sont deux mécanismes différents.

D'un côté, il y a vos fichiers (les pages et les modules que vous éditez). Ils sont versionnés sur GitHub : chaque modification y est enregistrée et toutes les versions précédentes restent récupérables. Rien n'est perdu de ce côté, et mettre à jour un élève ne modifie jamais les dossiers des autres.

De l'autre côté, il y a les données que les élèves saisissent dans un module (par exemple la liste de sujets personnalisée du Flash Générateur). Ces données sont désormais enregistrées sur le serveur, dans un dossier persistant. Le serveur les écrit sous forme de fichiers, un par module, identifiés par une clé unique de la forme `eleve.module` (par exemple `julindien.flash-generateur`). En complément, une copie de secours est conservée dans le navigateur de l'élève : si le serveur est momentanément indisponible, l'élève peut continuer à travailler et ses données seront renvoyées au serveur ensuite.

## Ce qui garantit que rien n'est perdu

Quatre protections se cumulent. Vos fichiers sont historisés sur GitHub, donc toujours récupérables. Les données des élèves sont sur un volume persistant du serveur, qui survit aux redéploiements. Une copie de secours existe dans le navigateur de chaque élève. Et comme chaque élève et chaque module ont leur propre dossier et leur propre clé de stockage, une mise à jour de l'un n'écrase jamais le contenu d'un autre.

## Comment se passe une mise en ligne

Le cheminement est toujours le même. Vous modifiez ou ajoutez des fichiers dans le dossier, vous les envoyez sur GitHub (interface web, par un commit), puis dans Coolify vous cliquez sur « Deploy ». Coolify reconstruit l'application et la publie. Le certificat HTTPS est géré automatiquement.

## Le réglage à faire une seule fois dans Coolify

Pour que les données des élèves survivent aux redéploiements, l'application a besoin d'un emplacement de stockage persistant. Dans la configuration Coolify de l'application, il faut ajouter un volume persistant (rubrique « Storage » ou « Persistent Storage ») monté sur le chemin `/data` à l'intérieur du conteneur. C'est un réglage unique. Sans lui, le serveur fonctionne quand même, mais les données enregistrées seraient remises à zéro à chaque déploiement (seule la copie navigateur des élèves subsisterait).

## Le mot de passe du hub maître

Le mot de passe qui protège la page d'accueil se trouve dans le fichier `public/index.html`, à la ligne `const MOT_DE_PASSE = "..."`. Pour le changer, il suffit de remplacer la valeur entre guillemets. À noter : il s'agit d'une protection légère, faite pour masquer la liste de vos élèves aux visiteurs de passage, pas d'un coffre-fort. Les hubs des élèves restent, eux, accessibles par lien direct.
