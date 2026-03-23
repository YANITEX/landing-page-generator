# ⚠️ IMPORTANT : Configuration DATABASE_URL

## 🎯 Action requise maintenant

Le schéma Prisma a été mis à jour pour utiliser **Azure SQL Server** au lieu de SQLite.

Vous devez maintenant **mettre à jour votre fichier `.env`** avec la chaîne de connexion Azure SQL.

## 📝 Deux options

### Option A : Configuration Azure SQL (Recommandé - Production)

1. **Suivez le guide complet** : `AZURE_SQL_SETUP.md`
2. **Ou guide rapide** : `AZURE_SQL_QUICKSTART.md`

3. **Mettez à jour `.env`** :
```env
DATABASE_URL="sqlserver://votre-server.database.windows.net:1433;database=landing-generator;user=votre-user;password=votre-password;encrypt=true;trustServerCertificate=false"
```

4. **Appliquez les migrations** :
```bash
npx prisma generate
npx prisma db push
```

### Option B : Revenir temporairement à SQLite (Développement local)

Si vous voulez tester d'abord en local avant de configurer Azure :

1. **Modifiez `prisma/schema.prisma`** (ligne 9) :
```prisma
datasource db {
  provider = "sqlite"  // Changez "sqlserver" en "sqlite"
  url      = env("DATABASE_URL")
}
```

2. **Mettez à jour `.env`** :
```env
DATABASE_URL="file:./dev.db"
```

3. **Appliquez** :
```bash
npx prisma generate
npx prisma db push
```

⚠️ **Note** : SQLite n'est pas recommandé pour la production !

## 🔄 État actuel

- ✅ Schema Prisma mis à jour pour SQL Server
- ✅ Configuration `.env.example` mise à jour
- ✅ Documentation créée
- ❌ **Votre fichier `.env` local doit être mis à jour**

## 🚀 Pour continuer

1. **Choisissez une option** (A ou B ci-dessus)
2. **Suivez les étapes**
3. **Relancez l'application** : `npm run dev`

## 📚 Ressources

- **Guide complet Azure** : [AZURE_SQL_SETUP.md](AZURE_SQL_SETUP.md)
- **Guide rapide** : [AZURE_SQL_QUICKSTART.md](AZURE_SQL_QUICKSTART.md)
- **Azure Portal** : https://portal.azure.com
