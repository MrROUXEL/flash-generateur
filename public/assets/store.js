/* =====================================================================
   DPStore : stockage durable des donnees d'un module.
   - Ecrit d'abord dans le navigateur (repli immediat, hors-ligne)
   - Puis enregistre sur le serveur (dossier persistant) via /api/data
   - A la lecture : tente le serveur, sinon retombe sur le navigateur

   Chaque module utilise une CLE unique : "<eleve>.<module>"
   ex : "julindien.flash-generateur"
   Ne jamais reutiliser la meme cle pour deux modules differents.
   ===================================================================== */
window.DPStore = {
  _url(cle){ return '/api/data/' + encodeURIComponent(cle); },
  _local(cle){ return 'dp:' + cle; },

  async load(cle, defaut){
    // 1) serveur
    try{
      const r = await fetch(this._url(cle), { cache: 'no-store' });
      if(r.ok){
        const j = await r.json();
        if(j && j.value !== null && j.value !== undefined){
          try{ localStorage.setItem(this._local(cle), JSON.stringify(j.value)); }catch(e){}
          return j.value;
        }
      }
    }catch(e){ /* serveur indisponible : on tente le navigateur */ }
    // 2) navigateur
    try{
      const s = localStorage.getItem(this._local(cle));
      if(s) return JSON.parse(s);
    }catch(e){}
    return defaut;
  },

  async save(cle, valeur){
    // repli navigateur immediat
    try{ localStorage.setItem(this._local(cle), JSON.stringify(valeur)); }catch(e){}
    // serveur
    try{
      const r = await fetch(this._url(cle), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: valeur })
      });
      return r.ok;
    }catch(e){ return false; }
  }
};
