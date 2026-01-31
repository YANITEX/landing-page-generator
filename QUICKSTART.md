# Guide de Démarrage Rapide

## 🎯 Objectif

Ce guide vous aide à lancer rapidement la plateforme Landing Page Generator.

## ⚡ Installation Express

1. **Cloner ou télécharger le projet**

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer la base de données**

La plateforme nécessite PostgreSQL. Options :

### Option A : PostgreSQL Local
```bash
# Téléchargez PostgreSQL depuis https://www.postgresql.org/download/
# Créez une base de données :
createdb landing_generator
```

### Option B : PostgreSQL Cloud (Supabase - Gratuit)
1. Allez sur https://supabase.com
2. Créez un compte gratuit
3. Créez un nouveau projet
4. Récupérez l'URL de connexion dans Settings > Database

### Option C : PostgreSQL Cloud (Neon - Gratuit)
1. Allez sur https://neon.tech
2. Créez un compte gratuit
3. Créez un projet
4. Récupérez l'URL de connexion

4. **Créer le fichier `.env`**
```bash
# Copiez le fichier d'exemple
cp .env.example .env

# Ou sur Windows PowerShell :
Copy-Item .env.example .env
```

Éditez `.env` et ajoutez vos informations :

```env
# Database - Remplacez par votre URL PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/landing_generator?schema=public"

# OpenAI - Obtenez une clé sur https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

5. **Initialiser la base de données**
```bash
npm run prisma:generate
npm run prisma:push
```

6. **Lancer l'application**
```bash
npm run dev
```

7. **Ouvrir votre navigateur**

Allez sur [http://localhost:3000](http://localhost:3000)

## 🎨 Premier Test

1. Cliquez sur "Créer une Landing Page"
2. Créez un nouveau produit (ex: "Montre Connectée")
3. Laissez l'IA générer une palette ou choisissez la vôtre
4. Uploadez 2-3 images de produit
5. Remplissez les informations (prix: 99€, ancien prix: 149€)
6. Cliquez sur "Générer avec l'IA" pour les bénéfices
7. Configurez votre CTA et téléphone
8. Activez les sections souhaitées
9. Laissez l'IA générer le contenu pour chaque section
10. Cliquez sur "Générer la Landing Page"

## 🚀 Fonctionnalités Principales

### 1. Wizard Intelligent
- 8 étapes guidées
- Validation en temps réel
- Sauvegarde automatique

### 2. IA Intégrée
- Génération de palette de couleurs
- Accroches marketing
- Bénéfices produit
- Contenu pour chaque section

### 3. Personnalisation
- Ajustement des couleurs (température, contraste)
- Réorganisation par drag & drop
- Prompts personnalisables
- Preview en temps réel

### 4. Sections Disponibles
- ✅ Hero Section (obligatoire)
- 📝 Problème
- ✨ Solution
- 🎯 Bénéfices
- 🔧 Comment ça marche
- 📊 Avant/Après
- ⭐ Preuves sociales
- 🚀 Call-to-Action

## 📱 Exemple d'Utilisation

### Cas d'usage : E-commerce
```
Produit : Casque Audio Bluetooth
Prix : 79.99€
Ancien Prix : 129.99€
Images : 3-4 photos du casque
Sections : Hero + Bénéfices + CTA
```

### Cas d'usage : Dropshipping
```
Produit : Lampe LED Intelligente
Prix : 49.99€
Images : 5 photos différents angles
Sections : Hero + Problème + Solution + Bénéfices + CTA
```

### Cas d'usage : Service
```
Produit : Coaching en Ligne
Prix : 199€
Images : Photos du coach + résultats
Sections : Hero + Problème + Solution + Témoignages + CTA
```

## 🔧 Commandes Utiles

```bash
# Développement
npm run dev

# Production
npm run build
npm start

# Base de données
npm run prisma:generate  # Générer le client Prisma
npm run prisma:push      # Pousser le schéma (dev)
npm run prisma:studio    # Interface graphique

# Linting
npm run lint
```

## ⚠️ Problèmes Courants

### "Cannot connect to database"
➡️ Vérifiez que PostgreSQL est démarré
➡️ Vérifiez l'URL dans `.env`

### "OpenAI API error"
➡️ Vérifiez votre clé API dans `.env`
➡️ Vérifiez vos crédits sur platform.openai.com

### "Images not uploading"
➡️ Vérifiez que le dossier `public/uploads/` existe
➡️ Vérifiez les permissions du dossier

### "Build error"
```bash
# Nettoyez et réinstallez
rm -rf node_modules .next
npm install
npm run build
```

## 💡 Astuces

1. **Utilisez des images de bonne qualité** (min 800x800px)
2. **Laissez l'IA travailler** pour la première génération
3. **Personnalisez ensuite** selon vos besoins
4. **Testez plusieurs palettes** avant de choisir
5. **Activez 5-7 sections maximum** pour éviter la surcharge

## 📞 Support

En cas de problème:
1. Consultez la [documentation complète](README.md)
2. Vérifiez les logs dans la console
3. Consultez les issues sur GitHub

## 🎯 Prochaines Étapes

Une fois votre première landing page créée :

1. ✅ Exportez-la en HTML
2. ✅ Intégrez-la à votre site
3. ✅ Connectez vos outils d'analytics
4. ✅ Testez différentes versions (A/B testing)
5. ✅ Optimisez selon les résultats

## 🌟 Fonctionnalités Avancées

### Intégration WhatsApp
```
Format : +33612345678 (avec indicatif)
Génère automatiquement le lien wa.me
```

### Countdown Timer
```
Active un sentiment d'urgence
Personnalisable dans les paramètres
```

### Multi-devises
```
Supporté : EUR, USD, GBP, MAD
Facile d'ajouter d'autres devises
```

---

**Bon lancement! 🚀**
