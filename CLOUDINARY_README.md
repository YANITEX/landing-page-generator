# Configuration Cloudinary - Étapes rapides

## ✅ Ce qui a été fait

1. **Package installé** : `cloudinary` ajouté aux dépendances
2. **Service créé** : `src/lib/cloudinary.ts` avec fonctions d'upload
3. **APIs modifiées** :
   - `/api/ai/generate-section-image` : Images générées uploadées vers Cloudinary
   - `/api/upload` : Images produit uploadées vers Cloudinary
4. **Configuration** : Variables d'environnement ajoutées à `.env.example`
5. **Documentation** : Guide complet dans `CLOUDINARY_SETUP.md`

## 🚀 Configuration requise (5 minutes)

### 1. Créer un compte Cloudinary (gratuit)

Allez sur : https://cloudinary.com/users/register/free

### 2. Obtenir vos identifiants

1. Connectez-vous à votre Dashboard : https://console.cloudinary.com/
2. Copiez vos identifiants :
   - **Cloud Name**
   - **API Key**  
   - **API Secret** (cliquez sur l'œil pour le voir)

### 3. Ajouter au fichier .env

Créez ou modifiez votre fichier `.env` à la racine du projet :

```env
# Vos autres variables existantes...
GEMINI_API_KEY=votre_gemini_key
DATABASE_URL=votre_database_url

# Nouvelles variables Cloudinary
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

### 4. Redémarrer le serveur

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez
npm run dev
```

## ✨ Avantages

- 🌐 **CDN Global** : Images chargées rapidement partout
- 💾 **25 GB gratuits** : Stockage + bande passante
- 🔒 **Sécurisé** : URLs HTTPS automatiques
- 🎨 **Optimisation auto** : Compression et formats optimaux
- 📊 **Dashboard** : Gérez toutes vos images visuellement

## 📁 Organisation des images

```
Cloudinary/
├── products/              # Images de produits uploadées
└── landing-pages/sectors/ # Images générées par l'IA
```

## 🔍 Vérifier que ça fonctionne

1. Uploadez une image de produit
2. Créez une landing page
3. Les images générées auront des URLs Cloudinary :
   ```
   https://res.cloudinary.com/votre_cloud_name/image/upload/...
   ```

## 📚 Documentation complète

Voir `CLOUDINARY_SETUP.md` pour plus de détails sur :
- Transformations d'images
- Suppression d'images
- Migration d'images existantes
- Dépannage

## ❓ Besoin d'aide ?

- Dashboard Cloudinary : https://console.cloudinary.com/
- Documentation : https://cloudinary.com/documentation
- Support : https://support.cloudinary.com/
