# 🧪 TESTS DE VALIDATION - Téléchargement Attestations

**Objectif** : Valider que le téléchargement des attestations fonctionne correctement

---

## 📋 TESTS AVEC CURL

### Test 1 : Lister Toutes les Attestations

**Commande** :
```bash
curl https://matc-backend.onrender.com/api/attestations
```

**Résultat attendu** :
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "attestationId": "CERT-2025-P-M-002",
      "fullName": "mohsen",
      "documents": {
        "attestation": "https://res.cloudinary.com/djvtktjgc/raw/upload/.../CERT-2025-P-M-002-attestation.pdf",
        "recommandation": "https://res.cloudinary.com/djvtktjgc/raw/upload/.../CERT-2025-P-M-002-recommandation.pdf"
      }
    }
  ]
}
```

**Vérifier** :
- ✅ Les IDs exacts des attestations
- ✅ Les URLs Cloudinary dans `documents.attestation`

---

### Test 2 : Récupérer une Attestation Spécifique

**Commande** :
```bash
curl https://matc-backend.onrender.com/api/attestations/CERT-2025-P-M-002
```

**Résultat attendu (200 OK)** :
```json
{
  "success": true,
  "data": {
    "attestationId": "CERT-2025-P-M-002",
    "fullName": "mohsen",
    "documents": {
      "attestation": "https://res.cloudinary.com/djvtktjgc/raw/upload/.../attestation.pdf",
      "recommandation": "https://res.cloudinary.com/djvtktjgc/raw/upload/.../recommandation.pdf"
    },
    "isActive": true
  }
}
```

**Résultat attendu (404 Not Found)** :
```json
{
  "success": false,
  "message": "Attestation non trouvée"
}
```

---

### Test 3 : Tester le Téléchargement (Headers Only)

**Commande** :
```bash
curl -I https://matc-backend.onrender.com/api/attestations/CERT-2025-P-M-002/download/attestation
```

**Résultat attendu (Cloudinary - 302 Redirect)** :
```
HTTP/2 302 Found
Location: https://res.cloudinary.com/djvtktjgc/raw/upload/v1730152800/matc/attestations/CERT-2025-P-M-002-attestation.pdf
Content-Type: text/plain; charset=utf-8
Content-Length: 138
```

**Résultat attendu (404 - Attestation non trouvée)** :
```
HTTP/2 404 Not Found
Content-Type: application/json; charset=utf-8

{
  "success": false,
  "message": "Aucune attestation trouvée pour cet ID"
}
```

---

### Test 4 : Télécharger le Fichier Complet

**Commande** :
```bash
curl -L -o attestation.pdf https://matc-backend.onrender.com/api/attestations/CERT-2025-P-M-002/download/attestation
```

**Options** :
- `-L` : Suivre les redirections (important pour Cloudinary)
- `-o attestation.pdf` : Sauvegarder dans un fichier

**Résultat attendu** :
```
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  245k  100  245k    0     0   123k      0  0:00:02  0:00:02 --:--:--  123k
```

**Vérifier** :
```bash
file attestation.pdf
# Output: attestation.pdf: PDF document, version 1.4
```

---

### Test 5 : Tester Tous les Types de Documents

**Attestation** :
```bash
curl -I https://matc-backend.onrender.com/api/attestations/CERT-2025-P-M-002/download/attestation
```

**Recommandation** :
```bash
curl -I https://matc-backend.onrender.com/api/attestations/CERT-2025-P-M-002/download/recommandation
```

**Évaluation** :
```bash
curl -I https://matc-backend.onrender.com/api/attestations/CERT-2025-P-M-002/download/evaluation
```

**Résultats attendus** :
- ✅ 302 Found → Document existe sur Cloudinary
- ❌ 404 Not Found → Document non disponible

---

## 📊 TESTS AVEC POSTMAN

### Collection Postman

**Importer** : `POSTMAN_TESTS_CLOUDINARY.json`

### Requête 1 : Liste Attestations

```
GET https://matc-backend.onrender.com/api/attestations
```

**Tests automatiques** :
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has attestations", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
});

pm.test("Attestations have Cloudinary URLs", function () {
    var jsonData = pm.response.json();
    jsonData.data.forEach(function(attestation) {
        pm.expect(attestation.documents.attestation).to.include('cloudinary.com');
    });
});
```

### Requête 2 : Télécharger Attestation

```
GET https://matc-backend.onrender.com/api/attestations/{{attestationId}}/download/attestation
```

**Tests automatiques** :
```javascript
pm.test("Status code is 302 (Redirect)", function () {
    pm.response.to.have.status(302);
});

pm.test("Redirects to Cloudinary", function () {
    var location = pm.response.headers.get("Location");
    pm.expect(location).to.include('cloudinary.com');
});
```

---

## 🔍 DEBUGGING

### Cas 1 : Erreur 404 "Attestation non trouvée"

**Symptôme** :
```json
{
  "success": false,
  "message": "Aucune attestation trouvée pour cet ID"
}
```

**Diagnostic** :
1. Vérifier que l'ID existe en DB :
   ```bash
   curl https://matc-backend.onrender.com/api/attestations | grep "CERT-2025-M-S-001"
   ```

2. Si absent → L'attestation n'existe pas ou est inactive

**Solution** :
- Re-créer l'attestation via Admin Panel
- Ou réactiver via MongoDB Atlas

---

### Cas 2 : Erreur 404 "Fichier non trouvé"

**Symptôme** :
```json
{
  "success": false,
  "message": "Fichier de attestation non trouvé sur le serveur",
  "filePath": "/opt/render/project/src/backend/uploads/attestations/attestation-xxx.pdf"
}
```

**Diagnostic** :
- L'attestation existe en DB
- Mais le chemin est local (pas Cloudinary)
- Le fichier local a été perdu

**Solution** :
1. Marquer l'attestation comme inactive :
   ```bash
   # Via MongoDB Atlas
   { "attestationId": "CERT-2025-M-S-001" }
   → Éditer: isActive: false
   ```

2. Re-créer l'attestation via Admin Panel

---

### Cas 3 : Erreur 400 "Type de document invalide"

**Symptôme** :
```json
{
  "success": false,
  "message": "Type de document invalide. Types valides: attestation, recommandation, evaluation"
}
```

**Diagnostic** :
- Le paramètre `:type` est incorrect

**Solution** :
- Utiliser : `attestation`, `recommandation`, ou `evaluation`
- Exemple correct : `/download/attestation`

---

### Cas 4 : Erreur 404 "Document non disponible"

**Symptôme** :
```json
{
  "success": false,
  "message": "Fichier de recommandation non trouvé pour cette attestation",
  "availableDocuments": ["attestation"]
}
```

**Diagnostic** :
- L'attestation existe
- Mais le document demandé (ex: recommandation) n'a pas été uploadé

**Solution** :
- Utiliser un type de document disponible
- Ou uploader le document manquant via Admin Panel (Update)

---

## ✅ VALIDATION COMPLÈTE

### Checklist

- [ ] Test 1 : Liste attestations → 200 OK
- [ ] Test 2 : Récupérer attestation spécifique → 200 OK
- [ ] Test 3 : Télécharger attestation → 302 Redirect
- [ ] Test 4 : Vérifier URL Cloudinary dans Location header
- [ ] Test 5 : Télécharger fichier complet → PDF valide
- [ ] Test 6 : Tester recommandation → 302 ou 404
- [ ] Test 7 : Tester évaluation → 302 ou 404

### Résultat Attendu

```
✅ Toutes les attestations actives ont des URLs Cloudinary
✅ Le téléchargement redirige vers Cloudinary (302)
✅ Les fichiers PDF sont téléchargeables
✅ Aucune erreur 404 pour les attestations existantes
```

---

## 🎯 COMMANDES RAPIDES

### Vérifier une Attestation Complète

```bash
# 1. Vérifier existence
curl https://matc-backend.onrender.com/api/attestations/CERT-2025-P-M-002

# 2. Tester téléchargement
curl -I https://matc-backend.onrender.com/api/attestations/CERT-2025-P-M-002/download/attestation

# 3. Télécharger fichier
curl -L -o test.pdf https://matc-backend.onrender.com/api/attestations/CERT-2025-P-M-002/download/attestation

# 4. Vérifier fichier
file test.pdf
```

### Lister Toutes les Attestations avec IDs

```bash
curl -s https://matc-backend.onrender.com/api/attestations | jq '.data[] | {id: .attestationId, name: .fullName, attestation: .documents.attestation}'
```

**Sortie attendue** :
```json
{
  "id": "CERT-2025-P-M-002",
  "name": "mohsen",
  "attestation": "https://res.cloudinary.com/djvtktjgc/raw/upload/.../attestation.pdf"
}
```

---

## 📞 AIDE RAPIDE

### URLs de Test

- **Backend API** : https://matc-backend.onrender.com
- **Liste attestations** : https://matc-backend.onrender.com/api/attestations
- **Download** : https://matc-backend.onrender.com/api/attestations/{ID}/download/{type}

### Outils

- **curl** : Ligne de commande
- **Postman** : Interface graphique
- **Browser DevTools** : Network tab
- **jq** : Parser JSON en ligne de commande

---

**Guide créé par Cascade AI - Windsurf IDE**  
**Date** : 28 octobre 2025 à 23h25 UTC+01:00
