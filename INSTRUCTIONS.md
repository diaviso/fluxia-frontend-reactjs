# 🚀 Instructions de démarrage

## Configuration Google Cloud Console

### Origines JavaScript autorisées
```
http://localhost:3000
http://localhost:5173
http://localhost:5174
```

### URI de redirection autorisés
```
http://localhost:3000/auth/google/callback
```

## Démarrage de l'application

### 1. Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Le backend démarre sur `http://localhost:3000`

### 2. Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
Le frontend démarre sur `http://localhost:5173`

## Test de l'authentification

1. Ouvrez votre navigateur sur `http://localhost:5173`
2. Vous serez redirigé vers la page de login
3. Cliquez sur "Se connecter avec Google"
4. Authentifiez-vous avec votre compte Google
5. Vous serez redirigé vers le dashboard avec vos informations

## Structure du projet

```
frontend/
├── src/
│   ├── components/
│   │   └── ProtectedRoute.tsx    # Protection des routes
│   ├── contexts/
│   │   └── AuthContext.tsx       # Contexte d'authentification
│   ├── pages/
│   │   ├── Login.tsx             # Page de connexion
│   │   ├── AuthCallback.tsx      # Callback OAuth
│   │   └── Dashboard.tsx         # Tableau de bord
│   ├── services/
│   │   ├── api.ts                # Configuration Axios
│   │   └── auth.service.ts       # Service d'authentification
│   ├── App.tsx                   # Routes principales
│   └── index.css                 # Styles globaux
├── .env                          # Variables d'environnement
└── package.json
```

## Fonctionnalités implémentées

✅ Authentification Google OAuth 2.0
✅ Gestion du token JWT
✅ Routes protégées
✅ Contexte React pour l'état utilisateur
✅ Intercepteurs Axios pour les requêtes API
✅ Redirection automatique après login
✅ Déconnexion
✅ Affichage du profil utilisateur
✅ Gestion des rôles (AGENT, VALIDATEUR, ADMIN)

## Prochaines étapes

Vous pouvez maintenant implémenter :
- Création d'expressions de besoin
- Liste des expressions de besoin
- Validation des demandes (pour VALIDATEUR/ADMIN)
- Gestion des utilisateurs (pour ADMIN)
- Gestion des matières
