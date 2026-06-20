/* =====================================================================
   Portail prive Dessin-Provence
   - Sert les pages statiques du dossier public/
   - Expose une petite API de stockage durable des donnees des modules :
       GET  /api/data/:cle   -> { value: <donnees ou null> }
       PUT  /api/data/:cle   -> { value: <donnees> }  enregistre, repond { ok:true }
   - Les donnees sont ecrites en fichiers JSON dans DATA_DIR (volume persistant).

   IMPORTANT : DATA_DIR doit pointer vers un VOLUME PERSISTANT (Coolify),
   sinon les donnees seraient perdues a chaque redeploiement.
   ===================================================================== */
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 80;
const DATA_DIR = process.env.DATA_DIR || '/data';
const PUBLIC_DIR = path.join(__dirname, 'public');

try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) { console.error('DATA_DIR', e.message); }

app.use(express.json({ limit: '8mb' }));

// Nettoie la cle pour en faire un nom de fichier sur (pas de remontee de dossier)
function fichierPour(cle) {
  const safe = String(cle).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
  return path.join(DATA_DIR, safe + '.json');
}

app.get('/api/data/:cle', (req, res) => {
  const f = fichierPour(req.params.cle);
  fs.readFile(f, 'utf8', (err, data) => {
    if (err) return res.json({ value: null });
    try { res.json({ value: JSON.parse(data) }); }
    catch (e) { res.json({ value: null }); }
  });
});

app.put('/api/data/:cle', (req, res) => {
  const f = fichierPour(req.params.cle);
  const value = req.body ? req.body.value : undefined;
  fs.writeFile(f, JSON.stringify(value), 'utf8', (err) => {
    if (err) { console.error('write', err.message); return res.status(500).json({ ok: false }); }
    res.json({ ok: true });
  });
});

// Pages statiques (hub maitre, hubs eleves, modules)
app.use(express.static(PUBLIC_DIR));

app.listen(PORT, () => console.log('Portail Dessin-Provence en ecoute sur le port ' + PORT));
