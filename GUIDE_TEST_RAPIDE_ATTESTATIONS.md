# ⚡ GUIDE TEST RAPIDE - Correction Attestations

**Objectif** : Valider que le téléchargement des attestations fonctionne avec le nouveau format d'ID

---

## 🚀 TESTS IMMÉDIATS (5 minutes)

### 1. Vérifier l'État des Attestations

```bash
cd backend
node scripts/verifyAttestations.js
```

**Résultat attendu** :
```
✅ Connecté à MongoDB
📊 STATISTIQUES GLOBALES
Total attestations: X
Attestations actives: X
```

### 2. Tester les Endpoints

```bash
node scripts/testDownloadEndpoints.js
```

**Résultat attendu** :
```
🧪 TEST DES ENDPOINTS DE TÉLÉCHARGEMENT
📄 Test: CERT-2025-M-M-001
   ✅ Disponible
```

### 3. Test API Direct (Postman ou cURL)

**Remplacer `CERT-2025-M-M-001` par un ID réel de votre base** :

```bash
# Test attestation
curl -I https://matc-backend.onrender.com/api/attestations/CERT-2025-M-M-001/download/attestation

# Test évaluation
curl -I https://matc-backend.onrender.com/api/attestations/CERT-2025-M-M-001/download/evaluation
```

**Réponse attendue** :
```
HTTP/2 200 OK
Content-Type: application/pdf
X-Attestation-ID: CERT-2025-M-M-001
```

OU (si Cloudinary) :
```
HTTP/2 302 Found
Location: https://res.cloudinary.com/...
```

---

## 🌐 TEST FRONTEND (Admin Panel)

### Étapes

1. **Ouvrir Admin Panel**
   ```
   https://admine-lake.vercel.app/attestations
   ```

2. **Sélectionner une attestation**
   - Cliquer sur une ligne du tableau

3. **Tester les boutons de téléchargement**
   - Cliquer "Attestation" → PDF doit se télécharger
   - Cliquer "Évaluation" → PDF doit se télécharger
   - Cliquer "Recommandation" → PDF doit se télécharger (si disponible)

4. **Vérifier la Console DevTools** (F12)
   - Onglet "Network"
   - Chercher requêtes vers `/api/attestations/.../download/...`
   - Status doit être `200` ou `302`

---

## 🔍 DEBUGGING SI ERREUR 404

### Étape 1 : Vérifier que l'attestation existe

```bash
# Connexion MongoDB ou via script
cd backend
node -e "
import('mongoose').then(async mongoose => {
  await mongoose.connect(process.env.MONGODB_URI);
  const Attestation = (await import('./models/Attestation.js')).default;
  const att = await Attestation.findOne({ attestationId: 'CERT-2025-M-M-001' });
  console.log('Attestation:', att ? 'TROUVÉE' : 'NON TROUVÉE');
  if (att) console.log('Documents:', Object.keys(att.documents).filter(k => att.documents[k]));
  process.exit(0);
});
"
```

### Étape 2 : Vérifier les logs Render

1. Aller sur https://dashboard.render.com
2. Sélectionner le service `matc-backend`
3. Onglet "Logs"
4. Chercher : `DOWNLOAD REQUEST`
5. Analyser les logs :
   ```
   ✅ Attestation found: CERT-2025-M-M-001
   ✅ Redirecting to Cloudinary URL: ...
   ```

### Étape 3 : Vérifier le format de l'ID

```javascript
// Dans la console DevTools du frontend
const id = "CERT-2025-M-M-001";
const regex = /^CERT-\d{4}-[A-Z]-[A-Z]-\d{3}$/i;
console.log('Format valide:', regex.test(id)); // Doit être true
```

---

## 📊 CHECKLIST DE VALIDATION

| Test | Statut | Notes |
|------|--------|-------|
| Script `verifyAttestations.js` exécuté | ⬜ | Nombre d'attestations : ___ |
| Script `testDownloadEndpoints.js` exécuté | ⬜ | URLs générées : ___ |
| Test cURL nouveau format (CERT-2025-M-M-001) | ⬜ | Status : ___ |
| Test cURL ancien format (CERT-ANNEE-001) | ⬜ | Status : ___ |
| Test Admin Panel - Attestation | ⬜ | PDF téléchargé : ⬜ |
| Test Admin Panel - Évaluation | ⬜ | PDF téléchargé : ⬜ |
| Logs Render vérifiés | ⬜ | Erreurs : ⬜ Oui ⬜ Non |
| Frontend sans erreur console | ⬜ | Erreurs : ⬜ Oui ⬜ Non |

---

## 🎯 CRITÈRES DE SUCCÈS

✅ **Tous les tests passent** :
- Scripts s'exécutent sans erreur
- cURL retourne 200 ou 302
- Admin Panel télécharge les PDFs
- Aucune erreur dans les logs

✅ **Compatibilité** :
- Nouveau format fonctionne
- Ancien format fonctionne
- Cloudinary et local fonctionnent

✅ **Messages clairs** :
- Erreurs 404 explicites
- Logs détaillés dans Render
- Frontend affiche erreurs compréhensibles

---

## 🚨 PROBLÈMES COURANTS

### Problème : "Attestation non trouvée"

**Cause** : L'ID n'existe pas en base

**Solution** :
1. Vérifier l'ID exact dans MongoDB
2. Créer une nouvelle attestation via Admin Panel
3. Utiliser un ID existant pour les tests

### Problème : "Fichier non trouvé"

**Cause** : Document non uploadé ou chemin invalide

**Solution** :
1. Vérifier `documents.attestation` dans MongoDB
2. Si vide, re-uploader le PDF
3. Si chemin local, vérifier que le fichier existe

### Problème : "CORS error"

**Cause** : Frontend non autorisé

**Solution** :
1. Vérifier `allowedOrigins` dans `backend/server.js`
2. Ajouter l'URL frontend si manquante
3. Redéployer backend

---

## 📞 AIDE RAPIDE

### Commandes Utiles

```bash
# Lister toutes les attestations
cd backend
node -e "
import('mongoose').then(async mongoose => {
  await mongoose.connect(process.env.MONGODB_URI);
  const Attestation = (await import('./models/Attestation.js')).default;
  const atts = await Attestation.find().select('attestationId fullName');
  console.log('Attestations:', atts.map(a => a.attestationId));
  process.exit(0);
});
"

# Vérifier une attestation spécifique
curl https://matc-backend.onrender.com/api/attestations/CERT-2025-M-M-001

# Tester health check
curl https://matc-backend.onrender.com/api/health
```

### URLs de Test

Remplacer `{ID}` par un ID réel :

```
# Backend
https://matc-backend.onrender.com/api/attestations/{ID}
https://matc-backend.onrender.com/api/attestations/{ID}/download/attestation
https://matc-backend.onrender.com/api/attestations/{ID}/download/evaluation

# Frontend
https://admine-lake.vercel.app/attestations
https://matrainingconsulting.vercel.app/
```

---

## ✅ VALIDATION FINALE

Une fois tous les tests passés :

1. ✅ Marquer tous les items de la checklist
2. ✅ Capturer screenshots des tests réussis
3. ✅ Documenter les IDs testés
4. ✅ Confirmer en production

**Temps estimé** : 5-10 minutes  
**Prérequis** : Backend déployé sur Render, MongoDB accessible

---

**Guide créé par Cascade AI - Windsurf IDE**  
**Date** : 28 octobre 2025
