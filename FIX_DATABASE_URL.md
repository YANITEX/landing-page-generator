# Correction de l'erreur de connexion SQL Server

## 🐛 Erreur actuelle

```
Error: P1013: Couldn't convert data to a boolean in database URL
```

Cette erreur signifie que votre chaîne de connexion `DATABASE_URL` dans `.env` a un problème de format.

## ✅ Solutions

### Solution 1 : Format correct de la chaîne de connexion

Votre fichier `.env` doit avoir **exactement** ce format :

```env
DATABASE_URL="sqlserver://HOST:1433;database=DBNAME;user=USERNAME;password=PASSWORD;encrypt=true;trustServerCertificate=false"
```

**Points importants** :
- ✅ Utilisez `encrypt=true` (pas `Encrypt=True`)
- ✅ Utilisez `trustServerCertificate=false` (tout en minuscules)
- ✅ Pas d'espaces autour des `=`
- ✅ Point-virgule `;` entre les paramètres
- ✅ Les guillemets autour de toute la chaîne

### Solution 2 : Caractères spéciaux dans le mot de passe

Si votre mot de passe contient des caractères spéciaux (`@`, `#`, `;`, `=`, etc.), vous devez les encoder :

**Caractères à encoder** :

| Caractère | Code URL |
|-----------|----------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `=` | `%3D` |
| `;` | `%3B` |
| `/` | `%2F` |
| `?` | `%3F` |
| `:` | `%3A` |

**Exemple** :
- Mot de passe original : `MyPass@123!`
- Encodé : `MyPass%40123!`

### Solution 3 : Format simplifié pour tests

Pour tester la connexion, utilisez d'abord cette version simplifiée :

```env
DATABASE_URL="sqlserver://votre-server.database.windows.net:1433;database=landing-generator;user=sqladmin;password=votremotdepasse;encrypt=true"
```

Notez : On enlève `trustServerCertificate` pour simplifier.

## 🔍 Exemples concrets

### ✅ Exemple CORRECT

```env
DATABASE_URL="sqlserver://myserver.database.windows.net:1433;database=landing-generator;user=sqladmin;password=MySecurePass123;encrypt=true;trustServerCertificate=false"
```

### ❌ Exemples INCORRECTS

```env
# MAUVAIS : Format ADO.NET (pas Prisma)
DATABASE_URL="Server=tcp:myserver.database.windows.net,1433;Initial Catalog=landing-generator;User ID=sqladmin;Password=pass;Encrypt=True"

# MAUVAIS : Espaces et majuscules incorrectes
DATABASE_URL="sqlserver://myserver.database.windows.net:1433; database = landing-generator; Encrypt = True"

# MAUVAIS : Guillemets manquants
DATABASE_URL=sqlserver://myserver.database.windows.net:1433;database=landing-generator;user=sqladmin;password=pass
```

## 📝 Étapes de correction

1. **Ouvrez votre fichier `.env`** à la racine du projet

2. **Trouvez la ligne `DATABASE_URL=`**

3. **Remplacez-la** par le format correct :

```env
DATABASE_URL="sqlserver://VOTRE-SERVER.database.windows.net:1433;database=landing-generator;user=VOTRE-USER;password=VOTRE-PASSWORD;encrypt=true;trustServerCertificate=false"
```

4. **Remplacez les valeurs** :
   - `VOTRE-SERVER` : Nom de votre serveur Azure SQL
   - `VOTRE-USER` : Nom d'utilisateur (ex: `sqladmin`)
   - `VOTRE-PASSWORD` : Mot de passe (encodez les caractères spéciaux si nécessaire)

5. **Sauvegardez le fichier**

6. **Testez** :
```bash
npx prisma db push
```

## 🔧 Alternative : Retour temporaire à SQLite

Si vous voulez d'abord faire fonctionner l'application avant de configurer Azure :

1. **Modifiez `prisma/schema.prisma`** (ligne 9) :
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

2. **Modifiez `.env`** :
```env
DATABASE_URL="file:./dev.db"
```

3. **Testez** :
```bash
npx prisma generate
npx prisma db push
npm run dev
```

## 🆘 Toujours bloqué ?

Partagez votre chaîne de connexion (en masquant le mot de passe) :

```env
DATABASE_URL="sqlserver://myserver.database.windows.net:1433;database=landing-generator;user=sqladmin;password=***MASQUÉ***;encrypt=true;trustServerCertificate=false"
```

Et on pourra voir exactement où est le problème du format.

## 📚 Références

- [Prisma SQL Server Connector](https://www.prisma.io/docs/concepts/database-connectors/sql-server)
- [URL Encoding Reference](https://www.w3schools.com/tags/ref_urlencode.asp)
