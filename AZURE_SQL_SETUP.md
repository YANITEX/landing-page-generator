# Configuration Azure SQL Database

Guide complet pour héberger votre base de données sur Microsoft Azure SQL Database.

## 🌟 Pourquoi Azure SQL ?

- ✅ **Fiable** : Infrastructure Microsoft avec 99.99% d'uptime
- ✅ **Sécurisé** : Chiffrement automatique, firewall, détection de menaces
- ✅ **Scalable** : Ajustez les ressources selon vos besoins
- ✅ **Plan gratuit** : Option Basic suffisante pour commencer (5€/mois)
- ✅ **Backup automatique** : Sauvegardes quotidiennes incluses

## 📋 Prérequis

- Compte Microsoft Azure (gratuit : https://azure.microsoft.com/free/)
- Carte bancaire (nécessaire même pour le plan gratuit, mais pas débitée si vous restez gratuit)

## 🚀 Configuration (15 minutes)

### Étape 1 : Créer une base de données Azure SQL

#### 1.1 Accéder au portail Azure
- Allez sur https://portal.azure.com
- Connectez-vous avec votre compte Microsoft

#### 1.2 Créer une SQL Database
1. Cliquez sur **"Create a resource"** (Créer une ressource)
2. Recherchez **"SQL Database"**
3. Cliquez sur **"Create"**

#### 1.3 Configuration de base
Remplissez les informations :

**Project Details :**
- **Subscription** : Sélectionnez votre abonnement
- **Resource Group** : Créez-en un nouveau (ex: `rg-landing-generator`)

**Database Details :**
- **Database name** : `landing-generator`
- **Server** : Cliquez sur **"Create new"**

#### 1.4 Créer le serveur SQL
Dans la fenêtre de création du serveur :

- **Server name** : `landing-generator-server` (doit être unique globalement)
- **Location** : Choisissez la région la plus proche (ex: `West Europe`)
- **Authentication method** : "Use SQL authentication"
- **Server admin login** : `sqladmin` (ou votre choix)
- **Password** : Créez un mot de passe fort (minimum 8 caractères, majuscules, minuscules, chiffres, caractères spéciaux)
- ⚠️ **Notez bien ces identifiants !**

Cliquez sur **"OK"**

#### 1.5 Configuration Compute + Storage
1. Cliquez sur **"Configure database"**
2. Sélectionnez **"Basic"** (le moins cher, ~5€/mois)
   - 2 GB de stockage
   - 5 DTUs (Database Transaction Units)
   - Suffisant pour démarrer

3. Cliquez sur **"Apply"**

#### 1.6 Réseau
1. Allez dans l'onglet **"Networking"**
2. **Connectivity method** : "Public endpoint"
3. **Firewall rules** :
   - ✅ Cochez **"Allow Azure services and resources to access this server"**
   - ✅ Cochez **"Add current client IP address"** (votre IP)

#### 1.7 Finaliser
1. Cliquez sur **"Review + create"**
2. Vérifiez les informations
3. Cliquez sur **"Create"**
4. ⏱️ Attendez 2-5 minutes pour le déploiement

### Étape 2 : Obtenir la chaîne de connexion

#### 2.1 Accéder à votre base de données
1. Une fois le déploiement terminé, cliquez sur **"Go to resource"**
2. Ou recherchez votre base "landing-generator" dans la barre de recherche Azure

#### 2.2 Récupérer la chaîne de connexion
1. Dans le menu de gauche, cliquez sur **"Connection strings"**
2. Sélectionnez l'onglet **"ADO.NET (SQL authentication)"**
3. Copiez la chaîne de connexion

Elle ressemble à :
```
Server=tcp:landing-generator-server.database.windows.net,1433;Initial Catalog=landing-generator;Persist Security Info=False;User ID=sqladmin;Password={your_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

#### 2.3 Convertir pour Prisma
Transformez la chaîne Azure en format Prisma :

**Format Azure** :
```
Server=tcp:SERVER.database.windows.net,1433;Initial Catalog=DATABASE;User ID=USER;Password=PASSWORD;...
```

**Format Prisma** :
```
sqlserver://SERVER.database.windows.net:1433;database=DATABASE;user=USER;password=PASSWORD;encrypt=true;trustServerCertificate=false
```

**Exemple concret** :
```env
DATABASE_URL="sqlserver://landing-generator-server.database.windows.net:1433;database=landing-generator;user=sqladmin;password=VotreMotDePasse123!;encrypt=true;trustServerCertificate=false"
```

### Étape 3 : Configurer votre projet

#### 3.1 Mettre à jour .env
Créez ou modifiez `.env` à la racine du projet :

```env
# Azure SQL Database
DATABASE_URL="sqlserver://votre-server.database.windows.net:1433;database=landing-generator;user=votre-user;password=votre-password;encrypt=true;trustServerCertificate=false"

# Autres variables...
GEMINI_API_KEY=votre_gemini_key
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

#### 3.2 Générer le client Prisma
```bash
npx prisma generate
```

#### 3.3 Créer les tables
```bash
npx prisma db push
```

Cette commande va :
- Se connecter à Azure SQL
- Créer toutes les tables selon votre schéma
- Configurer les relations

#### 3.4 Vérifier la connexion
```bash
npx prisma studio
```

Cela ouvrira une interface web pour visualiser votre base de données.

### Étape 4 : Mise en production (Optionnel)

#### 4.1 Ajouter des IPs autorisées
Ajoutez les IPs de votre serveur de production au firewall Azure :

1. Portail Azure → Votre serveur SQL
2. **"Networking"** (Réseau)
3. **"Firewall rules"**
4. Ajoutez une règle avec l'IP de votre serveur

#### 4.2 Variables d'environnement en production
Configurez votre plateforme de déploiement (Vercel, Railway, etc.) avec la même `DATABASE_URL`

## 🔒 Sécurité

### Règles de firewall
- **Ne jamais** ouvrir la base à toutes les IPs (0.0.0.0 - 255.255.255.255)
- N'autorisez que les IPs nécessaires
- Utilisez **"Allow Azure services"** pour les services Azure

### Mot de passe
- Minimum 12 caractères
- Majuscules, minuscules, chiffres, caractères spéciaux
- Ne le partagez jamais dans le code source
- Utilisez des variables d'environnement

### Chiffrement
Azure SQL chiffre automatiquement :
- Les données au repos (TDE - Transparent Data Encryption)
- Les données en transit (SSL/TLS)

## 💰 Coûts

### Plan Basic (Recommandé pour débuter)
- **Prix** : ~5€/mois (environ 400 DA/mois)
- **Stockage** : 2 GB
- **DTUs** : 5 (performance)
- **Backup** : 7 jours de rétention

### Plan Standard (Pour croissance)
- **S0** : ~13€/mois
- **Stockage** : 250 GB
- **DTUs** : 10-100 (ajustable)

### Crédits gratuits Azure
Si vous êtes nouveau sur Azure :
- 200$ de crédits gratuits pendant 30 jours
- Pas de frais les 12 premiers mois pour certains services

Plus d'infos : https://azure.microsoft.com/pricing/free-services/

## 🛠️ Commandes utiles

### Synchroniser le schéma
Après modification du `schema.prisma` :
```bash
npx prisma db push
```

### Créer une migration
Pour garder un historique des changements :
```bash
npx prisma migrate dev --name nom_migration
```

### Visualiser les données
```bash
npx prisma studio
```

### Réinitialiser la base (⚠️ Attention : supprime toutes les données)
```bash
npx prisma db push --force-reset
```

## 🐛 Dépannage

### Erreur : "Cannot connect to database"
- Vérifiez que votre IP est dans le firewall Azure
- Vérifiez la chaîne de connexion (format Prisma)
- Vérifiez le mot de passe (pas d'espaces)

### Erreur : "Login failed for user"
- Vérifiez le nom d'utilisateur et mot de passe
- Format correct : `user=votreuser` (pas `User ID=`)

### Erreur : "Connection timeout"
- Vérifiez le firewall Azure
- Vérifiez votre connexion internet
- Le port 1433 doit être ouvert

### Base de données lente
- Passez au plan Standard (plus de DTUs)
- Optimisez vos requêtes
- Ajoutez des index si nécessaire

## 📚 Ressources

- **Documentation Azure SQL** : https://docs.microsoft.com/azure/azure-sql/
- **Prisma + SQL Server** : https://www.prisma.io/docs/concepts/database-connectors/sql-server
- **Portail Azure** : https://portal.azure.com
- **Pricing Calculator** : https://azure.microsoft.com/pricing/calculator/

## ✅ Checklist finale

- [ ] Compte Azure créé
- [ ] Base de données Azure SQL créée
- [ ] Serveur SQL configuré
- [ ] Firewall configuré (votre IP ajoutée)
- [ ] Chaîne de connexion copiée et convertie
- [ ] `.env` mis à jour avec DATABASE_URL
- [ ] `npx prisma generate` exécuté
- [ ] `npx prisma db push` exécuté
- [ ] `npx prisma studio` fonctionne
- [ ] Application teste avec succès

🎉 **Félicitations ! Votre base de données Azure SQL est prête !**
