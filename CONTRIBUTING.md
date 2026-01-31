# 🤝 Guide de Contribution

Merci de votre intérêt pour contribuer au Landing Page Generator!

## 📋 Comment Contribuer

### 1. Signaler un Bug 🐛

Si vous trouvez un bug:
1. Vérifiez qu'il n'a pas déjà été signalé dans les Issues
2. Créez une nouvelle Issue avec:
   - Titre descriptif
   - Description détaillée du problème
   - Étapes pour reproduire
   - Comportement attendu vs observé
   - Screenshots si applicable
   - Environnement (OS, Node version, etc.)

### 2. Proposer une Nouvelle Fonctionnalité 💡

Pour suggérer une fonctionnalité:
1. Créez une Issue avec le tag "enhancement"
2. Décrivez le besoin et la solution proposée
3. Expliquez pourquoi c'est utile
4. Ajoutez des mockups si possible

### 3. Contribuer au Code 👨‍💻

#### Setup de Développement

```bash
# Fork le projet
git clone https://github.com/votre-username/landing-page-generator.git
cd landing-page-generator

# Installer les dépendances
npm install

# Copier .env.example vers .env et configurer
cp .env.example .env

# Générer Prisma client
npm run prisma:generate

# Lancer en dev
npm run dev
```

#### Processus de Contribution

1. **Créez une branche**
```bash
git checkout -b feature/ma-fonctionnalité
# ou
git checkout -b fix/mon-bug
```

2. **Faites vos modifications**
   - Suivez les conventions de code existantes
   - Écrivez du code clair et commenté
   - Testez vos changements

3. **Committez vos changements**
```bash
git add .
git commit -m "feat: description de la fonctionnalité"
# ou
git commit -m "fix: description du bug corrigé"
```

Utilisez les préfixes de commit:
- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `docs:` documentation
- `style:` formatage
- `refactor:` refactorisation
- `test:` ajout de tests
- `chore:` tâches diverses

4. **Poussez vers votre fork**
```bash
git push origin feature/ma-fonctionnalité
```

5. **Créez une Pull Request**
   - Description claire des changements
   - Référencez les Issues liées
   - Ajoutez des screenshots si UI changes

## 🎨 Standards de Code

### TypeScript
- Utilisez TypeScript strict
- Typez toutes les fonctions et variables
- Évitez `any` autant que possible

### React/Next.js
- Préférez les Server Components quand possible
- Utilisez les Client Components seulement quand nécessaire
- Suivez les hooks rules

### Styling
- Utilisez Tailwind CSS
- Restez cohérent avec le design existant
- Responsive-first approach

### Structure
```
src/
├── app/              # Routes et pages
├── components/       # Composants réutilisables
├── lib/             # Utilitaires et helpers
└── types/           # Types TypeScript
```

## 🧪 Tests

Avant de soumettre une PR:
1. Testez manuellement toutes les modifications
2. Vérifiez que le build fonctionne: `npm run build`
3. Vérifiez le linting: `npm run lint`
4. Testez sur différents navigateurs si applicable

## 📝 Documentation

Si vous ajoutez une fonctionnalité:
- Mettez à jour le README.md
- Ajoutez des commentaires dans le code
- Créez/mettez à jour la documentation technique

## 🚀 Idées de Contributions

Voici des domaines où vous pouvez contribuer:

### Features
- [ ] Export de landing page en HTML
- [ ] Templates prédéfinis
- [ ] A/B Testing intégré
- [ ] Analytics dashboard
- [ ] Multi-langue
- [ ] SEO optimizer
- [ ] Email marketing integration
- [ ] Custom domain support

### Améliorations
- [ ] Tests unitaires et E2E
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Mobile app
- [ ] CLI tool
- [ ] API documentation

### Design
- [ ] Plus de sections prédéfinies
- [ ] Bibliothèque d'icônes
- [ ] Animations avancées
- [ ] Thèmes personnalisables
- [ ] Dark/Light mode toggle

## ❓ Questions

Si vous avez des questions:
- Ouvrez une Discussion sur GitHub
- Consultez la documentation
- Regardez les Issues existantes

## 📜 Code of Conduct

- Soyez respectueux et professionnel
- Acceptez les critiques constructives
- Focusez sur ce qui est le mieux pour le projet
- Aidez les autres contributeurs

## 🎉 Reconnaissance

Tous les contributeurs seront ajoutés au fichier CONTRIBUTORS.md

Merci pour votre contribution! 🙏
