# CRUD Produits - Améliorations et Documentation

## Vue d'ensemble

Le système CRUD des produits a été entièrement amélioré et est maintenant complet avec:
- ✅ **Create** - Création de produits avec 4 étapes
- ✅ **Read** - Affichage et détails des produits
- ✅ **Update** - Édition complète des produits
- ✅ **Delete** - Suppression des produits

---

## 1. Routes API

### `POST /api/products` - Créer un produit
**Description**: Crée un nouveau produit avec validation

**Validation**:
- ❌ Nom vide → Error 400
- ❌ Aucune image → Error 400
- ❌ Plus de 5 images → Error 400

**Requête**:
```json
{
  "name": "Nom du produit",
  "description": "Description optionnelle",
  "images": ["data:image/png;base64,...", "..."]
}
```

**Réponse** (201):
```json
{
  "id": "cuid...",
  "name": "Nom du produit",
  "description": "Description",
  "createdAt": "2024-01-31T...",
  "updatedAt": "2024-01-31T...",
  "images": [...],
  "landingPages": [...]
}
```

---

### `GET /api/products` - Lister tous les produits
**Description**: Récupère la liste complète des produits avec images et landing pages

**Réponse** (200):
```json
[
  {
    "id": "cuid...",
    "name": "Produit 1",
    "description": "...",
    "images": [...],
    "landingPages": [...]
  }
]
```

---

### `GET /api/products/[id]` - Récupérer un produit
**Description**: Récupère les détails d'un produit spécifique

**Réponse** (200):
```json
{
  "id": "cuid...",
  "name": "Produit",
  "description": "...",
  "images": [...],
  "landingPages": [...]
}
```

**Erreurs**:
- 404: Produit non trouvé

---

### `PUT /api/products/[id]` - Mettre à jour un produit
**Description**: Met à jour le nom, la description et/ou les images

**Validation**:
- ❌ Aucune image fournie ET images existantes effacées → Error 400
- ❌ Plus de 5 images → Error 400

**Requête**:
```json
{
  "name": "Nouveau nom",
  "description": "Nouvelle description",
  "images": ["data:image/png;base64,..."]  // Optionnel
}
```

**Réponse** (200): Produit mise à jour

**Erreurs**:
- 404: Produit non trouvé
- 400: Validation échouée

---

### `DELETE /api/products/[id]` - Supprimer un produit
**Description**: Supprime un produit (cascade: images + landing pages)

**Réponse** (200): Succès

**Erreurs**:
- 404: Produit non trouvé

---

## 2. Pages Utilisateur

### `/products` - Liste des produits
**Composant**: `src/app/products/page.tsx`

**Fonctionnalités**:
- 📋 Affichage en grille (3 colonnes sur desktop)
- 🖼️ Aperçu de la première image
- 📊 Statistiques (nombre images, landing pages)
- ➕ Bouton "Nouveau Produit" → `/products/create`
- 🔗 Clic sur la carte → Page de détail `/products/[id]`
- ✏️ Bouton "Éditer" → `/products/[id]/edit`
- 🗑️ Bouton "Supprimer" avec confirmation

**État vide**: Message + lien vers création

---

### `/products/create` - Créer un produit
**Composant**: `src/app/products/create/page.tsx`

**4 Étapes**:

1. **Étape 1: Images** (Obligatoire)
   - Drag & drop zone
   - Sélecteur fichiers
   - Aperçu en grille
   - Compteur (X/5)
   - Boutons suppression par image

2. **Étape 2: Informations**
   - Nom du produit
   - Accroche marketing (100 car max)
   - Description
   - Devise (DA, EUR, USD)
   - Ancien prix (optionnel)
   - Nouveau prix (optionnel)

3. **Étape 3: Bénéfices**
   - Jusqu'à 6 bénéfices
   - Titre (50 car max)
   - Description (150 car max)
   - Bouton "Ajouter"

4. **Étape 4: Contact & CTA**
   - Texte du bouton CTA
   - Numéro téléphone
   - WhatsApp
   - Infos livraison

**Navigation**:
- Bouton "Précédent" (désactivé étape 1)
- Bouton "Suivant" (validation images étape 1)
- Bouton "Enregistrer" (étape 4, désactivé sans images)

---

### `/products/[id]` - Détails du produit
**Composant**: `src/app/products/[id]/page.tsx`

**Fonctionnalités**:
- 🖼️ Carousel d'images (flèches gauche/droite)
- 📸 Miniatures (clic pour changer)
- 📊 Stats (images, landing pages)
- ℹ️ Informations produit (ID, dates)
- ✏️ Bouton "Éditer" → `/products/[id]/edit`
- 🗑️ Bouton "Supprimer" avec modal de confirmation
- 🔗 Grille complète de toutes les images

**État de chargement**: Spinner + texte

**Gestion erreurs**: AlertCircle + message

---

### `/products/[id]/edit` - Éditer un produit
**Composant**: `src/app/products/[id]/edit/page.tsx`

**Identique au Create mais**:
- Charge les données existantes
- Images affichées mais peuvent être remplacées
- Bouton final: "Enregistrer les modifications"
- En-tête "Éditer le Produit"

**Fonctionnalités**:
- Navigation par onglets (clic = changement étape)
- Même validation que Create
- Retour à `/products` après succès
- Bouton "Retour" en haut

---

## 3. Améliorations API

### Validations Renforcées

#### Create (POST)
```typescript
✓ Validation du nom (non-vide)
✓ Validation des images (min 1, max 5)
✓ Logging détaillé: nom et nombre d'images
✓ Message d'erreur clair en français
```

#### Update (PUT)
```typescript
✓ Existence du produit vérifiée
✓ Validation des images si modifiées
✓ Support de mises à jour partielles
✓ Logging du nombre d'images modifiées
✓ Gestion prpe de la suppression/création
```

#### Delete (DELETE)
```typescript
✓ Existence vérifiée
✓ Logging détaillé des dépendances
✓ Cascade automatique (images + landing pages)
✓ Confirmation dans les logs
```

### Logging Amélioré

**Format**:
```
POST /api/products - Body: {...}
Creating product "iPhone 15" with 3 image(s)
✓ Product created: cuid_123...
```

```
PUT /api/products/cuid_123 - Updating product
Updating 2 images
✓ Product cuid_123 updated
```

```
DELETE /api/products/cuid_123
Deleting product cuid_123 with 3 images and 1 landing pages
✓ Product cuid_123 deleted
```

---

## 4. Flux de Travail Utilisateur

### Créer un produit
1. Clic "Nouveau Produit" → `/products/create`
2. Upload 1-5 images (drag & drop ou clic)
3. Remplir étape 2 (infos)
4. Remplir étape 3 (bénéfices)
5. Remplir étape 4 (contact)
6. Clic "Enregistrer" → `/products`

### Consulter un produit
1. Clic sur carte produit → `/products/[id]`
2. Voir images, info, stats
3. Voir toutes les images en bas

### Éditer un produit
1. **Depuis liste**: Clic "Éditer" → `/products/[id]/edit`
2. **Depuis détail**: Clic "Éditer" → `/products/[id]/edit`
3. Modifier images/info/bénéfices/contact
4. Clic "Enregistrer les modifications"

### Supprimer un produit
1. Clic 🗑️ → Modal de confirmation
2. Confirmer → Suppression avec cascade

---

## 5. Structure de Base de Données

### Model: Product
```prisma
id          String   @id @default(cuid())
name        String
description String?
createdAt   DateTime @default(now())
updatedAt   DateTime @updatedAt

images       ProductImage[]
landingPages LandingPage[]
```

### Model: ProductImage
```prisma
id        String   @id @default(cuid())
url       String
isPrimary Boolean  @default(false)
order     Int      @default(0)
productId String
product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
createdAt DateTime @default(now())
```

---

## 6. Gestion des Erreurs

### Client-Side
```typescript
try {
  const response = await fetch(...)
  if (!response.ok) {
    const errorData = await response.json()
    setError(errorData.error) // Message du serveur
  }
} catch (err) {
  setError(err instanceof Error ? err.message : 'Erreur inconnue')
}
```

### Server-Side
```typescript
return NextResponse.json(
  { 
    error: 'Message français clair',
    message: error.message
  },
  { status: 400 }
)
```

---

## 7. Prochaines Étapes

- [ ] Implémenter vrai stockage d'images (S3, Cloudinary)
- [ ] Ajouter compression/validation d'images
- [ ] Créer landing pages à partir des produits
- [ ] Ajouter analytics/statistiques
- [ ] Implémenter pagination
- [ ] Ajouter recherche/filtres
- [ ] Valider dimensions images

---

## 8. Tests Manuel

### Créer un produit
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test",
    "images": ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="]
  }'
```

### Lister les produits
```bash
curl http://localhost:3000/api/products
```

### Récupérer un produit
```bash
curl http://localhost:3000/api/products/cuid_123
```

### Mettre à jour
```bash
curl -X PUT http://localhost:3000/api/products/cuid_123 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "description": "Updated description"
  }'
```

### Supprimer
```bash
curl -X DELETE http://localhost:3000/api/products/cuid_123
```

---

**Version**: 1.0.0
**Date**: 31 Janvier 2026
**Statut**: ✅ Complet et testé
