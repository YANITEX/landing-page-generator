# Configuration Cloudinary

Ce projet utilise Cloudinary pour le stockage et la gestion des images.

## Pourquoi Cloudinary ?

- ✅ **Gratuit** : 25 GB de stockage et 25 GB de bande passante par mois
- ✅ **CDN Global** : Images servies rapidement partout dans le monde
- ✅ **Optimisation automatique** : Compression et conversion automatique des formats
- ✅ **Transformations** : Redimensionnement, recadrage, filtres à la volée
- ✅ **Sécurisé** : URLs HTTPS et gestion des permissions

## Configuration

### 1. Créer un compte Cloudinary

1. Allez sur [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Créez un compte gratuit
3. Confirmez votre email

### 2. Obtenir vos identifiants

1. Connectez-vous à votre [Dashboard Cloudinary](https://console.cloudinary.com/)
2. Dans la section "Product Environment Credentials", notez :
   - **Cloud Name** (nom de votre cloud)
   - **API Key** (clé API)
   - **API Secret** (secret API - cliquez sur l'œil pour le révéler)

### 3. Configurer les variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

## Structure des dossiers Cloudinary

Les images sont organisées automatiquement :

```
cloudinary/
├── products/           # Images de produits uploadées
└── landing-pages/      # Images générées par l'IA
    └── sections/       # Images des sections de landing page
        └── {sectionId}/
```

## Utilisation dans le code

### Uploader une image base64 (images générées par IA)

```typescript
import { uploadBase64ToCloudinary } from '@/lib/cloudinary';

const cloudinaryUrl = await uploadBase64ToCloudinary(
  base64Image,
  'landing-pages/sections'
);
```

### Uploader un fichier buffer (images uploadées par l'utilisateur)

```typescript
import { uploadBufferToCloudinary } from '@/lib/cloudinary';

const cloudinaryUrl = await uploadBufferToCloudinary(
  buffer,
  filename,
  'products'
);
```

### Supprimer une image

```typescript
import { deleteFromCloudinary, extractPublicId } from '@/lib/cloudinary';

const publicId = extractPublicId(cloudinaryUrl);
if (publicId) {
  await deleteFromCloudinary(publicId);
}
```

## Migration des images existantes

Si vous avez déjà des images stockées localement dans `/public/uploads/` :

1. Les nouvelles images seront automatiquement uploadées vers Cloudinary
2. Les anciennes images locales continueront à fonctionner
3. Pour migrer les anciennes images, vous devrez créer un script de migration

## Transformations d'images

Cloudinary permet des transformations d'images directement dans l'URL :

```
# Image originale
https://res.cloudinary.com/demo/image/upload/sample.jpg

# Redimensionnée à 300px de large
https://res.cloudinary.com/demo/image/upload/w_300/sample.jpg

# Optimisée automatiquement
https://res.cloudinary.com/demo/image/upload/q_auto,f_auto/sample.jpg
```

## Limites du plan gratuit

- **Stockage** : 25 GB
- **Bande passante** : 25 GB/mois
- **Transformations** : 25 crédits/mois (1 crédit = environ 1000 transformations)
- **Vidéos** : 0.5 GB de stockage, 1 GB de bande passante

Pour plus d'informations : [Pricing Cloudinary](https://cloudinary.com/pricing)

## Dépannage

### Erreur : "Invalid API Key"
- Vérifiez que vos variables d'environnement sont correctement définies
- Redémarrez votre serveur Next.js après modification du `.env`

### Erreur : "Upload failed"
- Vérifiez votre connexion internet
- Assurez-vous que vous n'avez pas dépassé les limites du plan gratuit
- Vérifiez que l'image est valide et pas trop grande

### Les images ne s'affichent pas
- Vérifiez que l'URL Cloudinary est correcte et accessible
- Assurez-vous que les images ne sont pas privées dans votre dashboard Cloudinary
