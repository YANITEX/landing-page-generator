# 🤖 Configuration Flexible des Modèles AI

## 📋 Vue d'ensemble

Système de configuration centralisé permettant de modifier dynamiquement les modèles AI utilisés pour chaque endpoint API, sans redémarrage de l'application.

## ✨ Fonctionnalités

- ✅ **Configuration par endpoint** : Chaque API AI peut utiliser un modèle différent
- ✅ **Hot reload** : Les changements prennent effet immédiatement (cache de 5 secondes)
- ✅ **Liste blanche** : Seuls les modèles autorisés peuvent être utilisés
- ✅ **Interface admin** : Page web pour gérer toutes les configurations
- ✅ **Base de données** : Configurations persistantes dans SQLite/Prisma
- ✅ **Fallback automatique** : Retour aux valeurs par défaut en cas d'erreur

## 🎯 Endpoints Configurables

| Endpoint | Description | Modèle par défaut |
|----------|-------------|-------------------|
| `benefits` | Génération des bénéfices produit | gemini-3-flash-preview |
| `headline` | Génération des accroches marketing | gemini-3-flash-preview |
| `adCopies` | Génération des ad copies | gemini-3-flash-preview |
| `suggest` | Suggestions (personas, angles) | gemini-3-flash-preview |
| `generateAll` | Génération complète depuis image | gemini-3-flash-preview |
| `images` | Génération d'images de sections | gemini-3-pro-image-preview |
| `palette` | Extraction de palette de couleurs | gemini-2.5-flash |

## 🚀 Utilisation

### Accéder à la page admin

```
http://localhost:3000/admin/ai-settings
```

Ou cliquez sur **"Config AI"** dans le sidebar.

### Modifier un modèle

1. Sélectionnez le modèle dans la liste déroulante
2. La modification est **sauvegardée automatiquement**
3. Le changement prend effet **immédiatement** (cache de 5s)

### Activer/Désactiver un endpoint

- Cochez/décochez la case "Actif"
- Si désactivé, le système utilise la configuration par défaut

### Réinitialiser tout

- Cliquez sur "🔄 Réinitialiser tout"
- Toutes les configurations reviennent aux valeurs par défaut

## 📚 Architecture

### Structure des fichiers

```
src/
├── lib/
│   ├── ai-config.ts           # Liste blanche et configs par défaut
│   ├── ai-config-service.ts   # Service centralisé avec cache
│   └── prisma.ts
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   └── ai-config/
│   │   │       └── route.ts   # API CRUD pour les configs
│   │   └── ai/
│   │       ├── generate-benefits/route.ts    # Utilise getAIModel()
│   │       ├── generate-headline/route.ts    # Utilise getAIModel()
│   │       ├── generate-ad-copies/route.ts   # Utilise getAIModel()
│   │       ├── suggest/route.ts              # Utilise getAIModel()
│   │       ├── generate-all-from-image/route.ts  # Utilise getAIModel()
│   │       ├── generate-section-image/route.ts   # Utilise getAIModel()
│   │       └── extract-palette/route.ts      # Utilise getAIModel()
│   └── admin/
│       └── ai-settings/
│           └── page.tsx       # Interface admin
└── prisma/
    └── schema.prisma          # Table AIConfiguration

init-ai-config.ts              # Script d'initialisation
```

### Modèle Prisma

```prisma
model AIConfiguration {
  id          String   @id @default(cuid())
  endpoint    String   @unique
  modelName   String
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 🔧 Développement

### Ajouter un nouvel endpoint

1. **Ajouter dans `ai-config.ts`** :

```typescript
export const DEFAULT_AI_CONFIG = {
  // ... configs existantes
  myNewEndpoint: {
    endpoint: 'myNewEndpoint',
    modelName: 'gemini-3-flash-preview',
    description: 'Description de mon endpoint',
  },
} as const;
```

2. **Utiliser dans votre route API** :

```typescript
import { getAIModel } from '@/lib/ai-config-service';

export async function POST(request: NextRequest) {
  const modelName = await getAIModel('myNewEndpoint');
  const model = genAI.getGenerativeModel({ model: modelName });
  // ... votre logique
}
```

3. **Réinitialiser la DB** :

```bash
npx tsx init-ai-config.ts
```

### Ajouter un nouveau modèle à la liste blanche

Dans `ai-config.ts` :

```typescript
export const ALLOWED_MODELS = {
  TEXT: [
    'gemini-3-flash-preview',
    'mon-nouveau-modele',  // ← Ajouter ici
  ],
  IMAGE: [
    'gemini-3-pro-image-preview',
  ],
} as const;
```

## 🎨 Modèles Disponibles

### Modèles de Texte
- `gemini-3-flash-preview` - Rapide, économique
- `gemini-2.5-flash` - Équilibré
- `gemini-2.0-flash-exp` - Expérimental
- `gemini-1.5-pro` - Plus puissant
- `gemini-1.5-flash` - Rapide

### Modèles d'Images
- `gemini-3-pro-image-preview` - Génération d'images avancée
- `gemini-2.5-flash-image` - Génération rapide
- `imagen-3.0-generate-001` - Imagen 3

## 🔒 Sécurité

- ✅ **Liste blanche stricte** : Seuls les modèles autorisés peuvent être utilisés
- ✅ **Validation serveur** : Les modèles sont validés avant sauvegarde
- ✅ **Fallback automatique** : Si un modèle invalide est configuré, le système utilise la valeur par défaut
- ✅ **Cache sécurisé** : Cache en mémoire avec TTL de 5 secondes

## 📊 Performance

- **Cache** : 5 secondes (hot reload rapide)
- **Invalidation** : Automatique après chaque modification
- **Fallback** : Instantané si la DB est inaccessible
- **Overhead** : < 5ms par requête (lecture cache)

## 🐛 Troubleshooting

### Les changements ne prennent pas effet

- Attendez 5 secondes (durée du cache)
- Vérifiez que le modèle est dans la liste blanche
- Consultez les logs console

### Modèle non autorisé

Erreur : `Model X is not allowed for endpoint Y`

→ Ajoutez le modèle à `ALLOWED_MODELS` dans `ai-config.ts`

### Configuration manquante

Si une config n'existe pas en DB :
1. Le système utilise la config par défaut
2. Exécutez `npx tsx init-ai-config.ts` pour créer toutes les configs

## 📝 API

### GET `/api/admin/ai-config`

Récupère toutes les configurations + modèles autorisés

**Response:**
```json
{
  "configs": [
    {
      "id": "...",
      "endpoint": "benefits",
      "modelName": "gemini-3-flash-preview",
      "description": "Génération des bénéfices",
      "isActive": true
    }
  ],
  "allowedModels": {
    "text": ["gemini-3-flash-preview", ...],
    "image": ["gemini-3-pro-image-preview", ...]
  }
}
```

### PUT `/api/admin/ai-config`

Met à jour une configuration

**Body:**
```json
{
  "id": "config-id",
  "endpoint": "benefits",
  "modelName": "gemini-2.5-flash",
  "description": "Nouvelle description",
  "isActive": true
}
```

### POST `/api/admin/ai-config`

Réinitialise toutes les configurations

**Body:**
```json
{
  "action": "reset"
}
```

## 🎯 Cas d'Usage

### Tester un nouveau modèle
1. Ajoutez-le à `ALLOWED_MODELS`
2. Changez dans l'interface admin
3. Testez l'API correspondante
4. Revenez en arrière si nécessaire

### Optimiser les coûts
1. Utilisez `gemini-3-flash-preview` pour les tâches simples
2. Utilisez `gemini-1.5-pro` uniquement pour les tâches complexes

### A/B Testing
1. Configurez modèle A
2. Testez pendant X temps
3. Configurez modèle B
4. Comparez les résultats

## 🚀 Future Améliorations

- [ ] Paramètres avancés (temperature, maxTokens, etc.)
- [ ] Historique des changements de configuration
- [ ] Métriques de performance par modèle
- [ ] Configuration par utilisateur/plan
- [ ] Rate limiting par endpoint
- [ ] Webhooks pour les changements de config

---

**📍 Accédez à la configuration :** [http://localhost:3000/admin/ai-settings](http://localhost:3000/admin/ai-settings)
