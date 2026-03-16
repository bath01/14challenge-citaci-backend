# CitaCI Backend

API REST pour le générateur de citations africaines — **CitaCI**.

Construite avec **Node.js**, **TypeScript**, **Express**, **Prisma** et **PostgreSQL**.

---

## Prérequis

- Node.js >= 20
- npm >= 10
- PostgreSQL >= 14 (local ou cloud)
- Docker (optionnel, pour le déploiement)

---

## Installation locale

```bash
# 1. Cloner le dépôt
git clone https://github.com/bath01/14challenge-citaci-backend.git
cd 14challenge-citaci-backend

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Editer .env avec vos credentials PostgreSQL

# 4. Appliquer le schéma Prisma
npm run db:migrate

# 5. Insérer les citations de démo (57 citations africaines)
npm run db:seed

# 6. Démarrer le serveur en développement
npm run dev
```

Le serveur tourne sur `http://localhost:3000`.

---

## Variables d'environnement

| Variable | Description | Exemple |
|---|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:pass@localhost:5432/citaci_db` |
| `PORT` | Port du serveur | `3000` |
| `NODE_ENV` | Environnement | `development` \| `production` |

---

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Démarrage en mode développement (hot-reload) |
| `npm run build` | Compilation TypeScript → `dist/` |
| `npm start` | Démarrage en production (après build) |
| `npm run db:migrate` | Appliquer les migrations Prisma |
| `npm run db:seed` | Insérer les citations de démo |
| `npm run db:studio` | Ouvrir Prisma Studio (interface DB) |
| `npm run db:reset` | Réinitialiser la BDD et re-seeder |

---

## Modèle de données

### Citation

| Champ | Type | Description |
|---|---|---|
| `id` | `string` (cuid) | Identifiant unique |
| `text` | `string` | Texte de la citation |
| `author` | `string` | Nom de l'auteur |
| `authorDescription` | `string` | Description courte de l'auteur |
| `category` | `string` | Catégorie de la citation |
| `createdAt` | `DateTime` | Date de création |
| `updatedAt` | `DateTime` | Date de dernière modification |

### Catégories

| Valeur | Description |
|---|---|
| `toutes` | Toutes les catégories (filtre désactivé) |
| `sagesse` | Sagesse & philosophie africaine |
| `proverbe-ci` | Proverbes ivoiriens |
| `motivation` | Citations de motivation |
| `leadership` | Citations sur le leadership |

---

## Endpoints API

Base URL : `http://localhost:3000/api`

### Santé

```
GET /health
```

Réponse :
```json
{ "status": "ok", "timestamp": "2026-03-16T10:00:00.000Z" }
```

---

### Citations

#### Obtenir une citation aléatoire

```
GET /api/citations/random?category={category}
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `category` | query | Non | Filtre par catégorie (`toutes`, `sagesse`, `proverbe-ci`, `motivation`, `leadership`) |

Réponse :
```json
{
  "data": {
    "id": "clxyz123",
    "text": "Un vieillard qui meurt, c'est une bibliothèque qui brûle.",
    "author": "Amadou Hampâté Bâ",
    "authorDescription": "Écrivain, ethnologue & diplomate malien",
    "category": "sagesse",
    "createdAt": "2026-03-16T10:00:00.000Z",
    "updatedAt": "2026-03-16T10:00:00.000Z"
  }
}
```

#### Lister toutes les citations (non paginé)

```
GET /api/citations?category={category}
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `category` | query | Non | Filtre par catégorie |

Réponse :
```json
{
  "data": [ ...citations ],
  "total": 57
}
```

#### Obtenir une citation par ID

```
GET /api/citations/:id
```

#### Créer une citation

```
POST /api/citations
Content-Type: application/json
```

Body :
```json
{
  "text": "La liberté ne se donne pas, elle se conquiert.",
  "author": "Thomas Sankara",
  "authorDescription": "Révolutionnaire, officier & président du Burkina Faso",
  "category": "motivation"
}
```

#### Créer plusieurs citations (bulk)

```
POST /api/citations/bulk
Content-Type: application/json
```

Body :
```json
{
  "citations": [
    {
      "text": "...",
      "author": "...",
      "authorDescription": "...",
      "category": "sagesse"
    },
    { "...": "..." }
  ]
}
```

Réponse :
```json
{ "message": "3 citation(s) créée(s) avec succès.", "count": 3 }
```

#### Modifier une citation

```
PUT /api/citations/:id
Content-Type: application/json
```

Body (tous les champs sont optionnels) :
```json
{
  "text": "Nouveau texte",
  "category": "leadership"
}
```

#### Supprimer une citation

```
DELETE /api/citations/:id
```

#### Supprimer plusieurs citations (bulk)

```
DELETE /api/citations/bulk
Content-Type: application/json
```

Body :
```json
{
  "ids": ["clxyz001", "clxyz002", "clxyz003"]
}
```

---

### Statistiques

```
GET /api/stats
```

Réponse :
```json
{
  "data": {
    "totalCitations": 57,
    "totalCategories": 4,
    "categories": [
      { "category": "sagesse", "count": 15 },
      { "category": "proverbe-ci", "count": 15 },
      { "category": "motivation", "count": 12 },
      { "category": "leadership", "count": 15 }
    ],
    "mostPopularCategory": {
      "name": "sagesse",
      "count": 15
    }
  }
}
```

---

## Format des erreurs

Toutes les erreurs suivent ce format :

```json
{
  "error": "Description de l'erreur.",
  "details": { }
}
```

| Code HTTP | Signification |
|---|---|
| `400` | Données invalides (validation Zod) |
| `404` | Ressource introuvable |
| `500` | Erreur interne du serveur |

---

## Déploiement Docker

### Build de l'image

```bash
docker build -t citaci-backend .
```

### Lancer le conteneur

```bash
docker run -d \
  --name citaci-backend \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/citaci_db" \
  -e NODE_ENV=production \
  citaci-backend
```
---

## Structure du projet

```
├── prisma/
│   ├── schema.prisma        # Schéma Prisma (modèle Citation)
│   └── seed.ts              # 57 citations africaines de démo
├── src/
│   ├── index.ts             # Point d'entrée Express
│   ├── lib/
│   │   └── prisma.ts        # Singleton PrismaClient
│   ├── types/
│   │   └── index.ts         # Types et constantes
│   ├── controllers/
│   │   ├── citationsController.ts
│   │   └── statsController.ts
│   ├── routes/
│   │   ├── citations.ts
│   │   └── stats.ts
│   └── middleware/
│       └── errorHandler.ts
├── Dockerfile
├── .dockerignore
├── .env.example
├── package.json
└── tsconfig.json
```
