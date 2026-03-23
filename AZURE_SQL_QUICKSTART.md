# Migration vers Azure SQL Database - Guide Rapide

## ✅ Ce qui a été fait

1. **Schema Prisma modifié** : Provider changé de `sqlite` à `sqlserver`
2. **Configuration mise à jour** : `.env.example` avec format Azure SQL
3. **Documentation complète** : Guide détaillé dans `AZURE_SQL_SETUP.md`

## 🚀 Configuration rapide (15 minutes)

### 1. Créer la base de données Azure

**Portail Azure** : https://portal.azure.com

1. **Create a resource** → **SQL Database**
2. **Database name** : `landing-generator`
3. **Server** : Créez un nouveau serveur
   - Name: `landing-generator-server` (unique)
   - Location: `West Europe` (ou proche de vous)
   - Admin: `sqladmin`
   - Password: Créez un mot de passe fort
4. **Compute + Storage** : Sélectionnez **Basic** (~5€/mois)
5. **Networking** :
   - ✅ Public endpoint
   - ✅ Allow Azure services
   - ✅ Add current client IP
6. **Create** et attendez 2-5 minutes

### 2. Obtenir la chaîne de connexion

1. Allez dans votre base de données
2. **Connection strings** → **ADO.NET**
3. Convertissez au format Prisma :

**Format Prisma** :
```env
DATABASE_URL="sqlserver://votre-server.database.windows.net:1433;database=landing-generator;user=sqladmin;password=VotreMotDePasse;encrypt=true;trustServerCertificate=false"
```

### 3. Configurer votre projet

#### A. Créer/modifier `.env`
```env
# Azure SQL Database
DATABASE_URL="sqlserver://votre-server.database.windows.net:1433;database=landing-generator;user=votre-user;password=votre-password;encrypt=true;trustServerCertificate=false"

# Gemini AI
GEMINI_API_KEY=votre_gemini_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

#### B. Générer le client Prisma
```bash
npx prisma generate
```

#### C. Créer les tables
```bash
npx prisma db push
```

#### D. Vérifier la connexion
```bash
npx prisma studio
```

### 4. Lancer l'application
```bash
npm run dev
```

## 💰 Coûts

**Plan Basic** (Recommandé) :
- ~5€/mois (environ 400 DA)
- 2 GB stockage
- Suffisant pour commencer

**Crédits gratuits** :
- 200$ offerts pendant 30 jours pour les nouveaux comptes Azure

## 🔒 Sécurité importante

⚠️ **Ne jamais commiter le fichier `.env`** dans Git !

Le fichier `.gitignore` doit contenir :
```
.env
.env.local
.env.production
```

## 🐛 Problèmes courants

### Cannot connect to database
- Vérifiez que votre IP est dans le firewall Azure
- Le port 1433 doit être accessible

### Login failed
- Vérifiez username et password dans DATABASE_URL
- Pas d'espaces avant/après le mot de passe

### Timeout
- Vérifiez votre connexion internet
- Vérifiez les règles du firewall Azure

## 📚 Documentation complète

Consultez `AZURE_SQL_SETUP.md` pour :
- Guide détaillé étape par étape avec captures d'écran
- Configuration avancée
- Dépannage complet
- Optimisations

## 🆚 Comparaison avec SQLite

| Aspect | SQLite (Avant) | Azure SQL (Maintenant) |
|--------|---------------|------------------------|
| Hébergement | Fichier local | Cloud Azure |
| Concurrent users | Limité | Illimité |
| Backup | Manuel | Automatique (7j) |
| Scalabilité | Aucune | Ajustable |
| Coût | Gratuit | ~5€/mois |
| Production | ❌ Non recommandé | ✅ Production ready |

## ✅ Checklist

- [ ] Compte Azure créé
- [ ] Base de données créée sur Azure
- [ ] Firewall configuré (IP ajoutée)
- [ ] `.env` configuré avec DATABASE_URL
- [ ] `npx prisma generate` exécuté ✓
- [ ] `npx prisma db push` exécuté ✓
- [ ] `npx prisma studio` fonctionne ✓
- [ ] Application démarre avec `npm run dev` ✓

## 🎯 Prochaines étapes

Une fois que tout fonctionne :

1. **Backup régulier** : Azure le fait automatiquement
2. **Monitoring** : Utilisez Azure Portal pour surveiller
3. **Scaling** : Augmentez les DTUs si nécessaire
4. **Production** : Déployez sur Vercel/Railway avec la même DATABASE_URL

---

**Besoin d'aide ?**
- Guide complet : `AZURE_SQL_SETUP.md`
- Azure Portal : https://portal.azure.com
- Documentation Prisma : https://www.prisma.io/docs
