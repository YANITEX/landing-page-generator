# 🚀 Landing Page Generator

Plateforme SaaS de génération de landing pages professionnelles assistée par IA. Transformez vos images de produits en pages de vente complètes et optimisées en quelques minutes.

## ✨ Fonctionnalités

### 🎯 Wizard Guidé Multi-Étapes
- **Étape 1**: Sélection ou création de produit
- **Étape 2**: Génération de palette de couleurs par IA ou personnalisation manuelle
- **Étape 3**: Upload d'images avec drag & drop
- **Étape 4**: Configuration du produit (nom, prix, devise)
- **Étape 5**: Définition des bénéfices avec drag & drop
- **Étape 6**: Configuration du CTA et informations de contact
- **Étape 7**: Sélection et organisation des sections
- **Étape 8**: Personnalisation des prompts ou génération IA

### 🤖 Intelligence Artificielle
- Génération automatique de palettes de couleurs harmonieuses
- Création d'accroches marketing persuasives
- Génération de bénéfices orientés conversion
- Contenu pour chaque section (problème, solution, témoignages, etc.)
- Optimisation pour la conversion

### 🎨 Personnalisation Visuelle
- Ajustement de la température des couleurs (chaud/froid)
- Contrôle du contraste
- Thème dark professionnel
- Aperçu en temps réel

### 📱 Sections de Landing Page
- **Hero Section**: Image principale + accroche + prix + CTA
- **Problème**: Présentation des pain points
- **Solution**: Comment votre produit résout le problème
- **Bénéfices**: Liste des avantages clés
- **Comment ça marche**: Étapes d'utilisation
- **Avant/Après**: Transformation visuelle
- **Preuve sociale**: Témoignages et crédibilité
- **CTA Final**: Appel à l'action avec urgence

### 🔄 Génération Progressive
- Statut en temps réel de la génération
- Chaque section générée indépendamment
- Aperçu immédiat pendant la génération

## 🛠️ Stack Technique

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Base de données**: PostgreSQL + Prisma ORM
- **IA**: OpenAI GPT-4o
- **UI Components**: Radix UI, Lucide Icons
- **Drag & Drop**: @hello-pangea/dnd
- **Upload**: React Dropzone

## 📋 Prérequis

- Node.js 18+ 
- PostgreSQL
- Compte OpenAI avec clé API

## 🚀 Installation

1. **Cloner le projet** (ou le télécharger)

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**

Copiez `.env.example` vers `.env` et configurez:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/landing_generator?schema=public"

# OpenAI
OPENAI_API_KEY="votre_clé_openai_ici"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Initialiser la base de données**

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer les tables (push le schéma)
npm run prisma:push
```

5. **Lancer le serveur de développement**

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📖 Utilisation

### Créer une Landing Page

1. **Page d'accueil**: Cliquez sur "Créer une Landing Page"
2. **Produit**: Sélectionnez un produit existant ou créez-en un nouveau
3. **Palette**: Laissez l'IA générer ou personnalisez manuellement
4. **Images**: Uploadez 3-5 images de votre produit
5. **Informations**: Renseignez le prix, l'accroche, etc.
6. **Bénéfices**: Ajoutez les avantages clés (ou générez avec l'IA)
7. **CTA**: Configurez le bouton d'action et les contacts
8. **Sections**: Activez et réorganisez les sections souhaitées
9. **Prompts**: Personnalisez ou laissez l'IA générer le contenu
10. **Générer**: Cliquez sur "Générer la Landing Page"

### Aperçu en Temps Réel

- La génération se fait progressivement
- Chaque section apparaît au fur et à mesure
- Un indicateur montre l'état de génération

### Gestion des Produits

- Accédez à "Mes Produits" depuis la page d'accueil
- Créez de nouvelles landing pages pour vos produits existants
- Gérez votre bibliothèque de produits

## 🗄️ Structure du Projet

```
landing-page-generator/
├── src/
│   ├── app/
│   │   ├── api/                  # Routes API
│   │   │   ├── ai/              # Endpoints IA
│   │   │   ├── products/        # CRUD produits
│   │   │   ├── landing-pages/   # Génération landing pages
│   │   │   └── upload/          # Upload d'images
│   │   ├── landing-pages/       # Prévisualisation
│   │   ├── products/            # Liste produits
│   │   ├── wizard/              # Wizard de création
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── wizard/              # Composants wizard
│   │       ├── WizardLayout.tsx
│   │       └── steps/           # Étapes du wizard
│   └── lib/
│       ├── prisma.ts            # Client Prisma
│       └── utils.ts             # Utilitaires
├── prisma/
│   ├── schema.prisma            # Schéma base de données
│   └── prisma.config.ts         # Configuration Prisma
├── public/
│   └── uploads/                 # Images uploadées
├── .env.example
├── package.json
└── README.md
```

## 🎨 Personnalisation

### Modifier les Sections Disponibles

Éditez `src/app/wizard/page.tsx` et modifiez le tableau `sections`:

```typescript
sections: [
  { type: 'hero', title: 'Hero Section', isActive: true, order: 0 },
  { type: 'custom', title: 'Ma Section', isActive: false, order: 8 },
]
```

### Ajouter une Nouvelle Section

1. Ajoutez le type dans `src/app/wizard/page.tsx`
2. Créez le composant dans `src/app/landing-pages/[id]/page.tsx`
3. Ajoutez le prompt dans `src/app/api/ai/generate-section-content/route.ts`

### Personnaliser les Prompts IA

Modifiez `SECTION_PROMPTS` dans `src/app/api/ai/generate-section-content/route.ts`

## 📊 Base de Données

### Schéma Principal

- **Product**: Produits
- **ProductImage**: Images des produits
- **LandingPage**: Landing pages générées
- **Benefit**: Bénéfices du produit
- **Section**: Sections de la landing page

### Commandes Prisma

```bash
# Générer le client
npm run prisma:generate

# Pousser le schéma (dev)
npm run prisma:push

# Interface graphique
npm run prisma:studio
```

## 🔒 Sécurité

- Les images sont stockées localement dans `public/uploads/`
- Les clés API sont dans des variables d'environnement
- Validation des données côté serveur
- Protection CSRF avec Next.js

## 🚀 Déploiement

### Vercel (Recommandé)

1. Pushez votre code sur GitHub
2. Connectez votre repo à Vercel
3. Configurez les variables d'environnement
4. Déployez !

### Autres Plateformes

- Compatible avec Netlify, Railway, Render, etc.
- Assurez-vous de configurer PostgreSQL
- Ajoutez les variables d'environnement

## 🐛 Dépannage

### Erreur Prisma
```bash
npm run prisma:generate
npm run prisma:push
```

### Erreur OpenAI
- Vérifiez votre clé API dans `.env`
- Assurez-vous d'avoir des crédits OpenAI

### Images non affichées
- Vérifiez que le dossier `public/uploads/` existe
- Vérifiez les permissions du dossier

## 📝 Scripts Disponibles

```bash
npm run dev           # Mode développement
npm run build         # Build production
npm run start         # Serveur production
npm run lint          # Linter
npm run prisma:generate  # Générer client Prisma
npm run prisma:push      # Pousser schéma
npm run prisma:studio    # Interface Prisma
```

## 🤝 Contribution

Les contributions sont les bienvenues! N'hésitez pas à:
- Reporter des bugs
- Proposer de nouvelles fonctionnalités
- Améliorer la documentation

## 📄 Licence

ISC

## 🙏 Remerciements

- OpenAI pour GPT-4o
- Vercel pour Next.js
- L'équipe Prisma
- La communauté React

---

**Développé avec ❤️ et IA**
