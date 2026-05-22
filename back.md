Laisse-moi d'abord analyser le frontend en profondeur.

Let me explore the frontend src directory recursively to get the full picture.

Now I have the full structure. Let me batch-read all the key files in parallel.

I have everything needed. Here's the comprehensive analysis:

---

## AfriFolio Frontend — Comprehensive Codebase Analysis

### 1. Pages & Routes

Defined in `App.tsx` using **Wouter** as the router:

| Route | Component | Protection |
|---|---|---|
| `/` | `Home` | Public |
| `/inscription` | `Register` | Public |
| `/connexion` | `Login` | Public |
| `/dashboard` | `Dashboard` | Auth required |
| `/dashboard/profil` | `ProfileEdit` | Auth required |
| `/dashboard/parrainage` | `Referral` | Auth required |
| `/dashboard/analytiques` | `Analytics` | Auth required |
| `/dashboard/abonnement` | `Subscription` | Auth required |
| `/portfolio/:username` | `PublicPortfolio` | Public |
| `/admin` | `AdminPanel` | Auth required (adminOnly flag, not enforced client-side) |
| `*` | `NotFound` | Public |

Routes are in French (e.g. `/inscription`, `/connexion`, `/parrainage`).

---

### 2. API Calls

All API calls go through a generated client package `@workspace/api-client-react` using **TanStack React Query** hooks. No raw `fetch` or `axios` calls exist in the app code.

| Hook | HTTP Operation | Used In |
|---|---|---|
| `useLogin` | POST login | `login.tsx` |
| `useRegister` | POST register | `register.tsx` |
| `useGetDashboardSummary` | GET dashboard summary | `dashboard/index.tsx` |
| `useGetProfile` | GET current user profile | `dashboard/profile.tsx` |
| `useUpdateProfile` | PUT/PATCH profile | `dashboard/profile.tsx` |
| `useGetAnalyticsStats` | GET analytics | `dashboard/analytics.tsx` |
| `useGetReferralStats` | GET referral stats | `dashboard/referral.tsx` |
| `useGetCommissions` | GET commission history | `dashboard/referral.tsx` |
| `useRequestWithdrawal` | POST withdrawal request | `dashboard/referral.tsx` |
| `useInitiatePayment` | POST payment initiation | `dashboard/subscription.tsx` |
| `useGetPublicPortfolio` | GET public portfolio by username | `portfolio/public.tsx` |
| `useRecordView` | POST record portfolio view | `portfolio/public.tsx` |
| `useGetAdminStats` | GET admin platform stats | `admin/index.tsx` |
| `useGetAdminUsers` | GET all users list | `admin/index.tsx` |
| `useGetAdminWithdrawals` | GET all withdrawal requests | `admin/index.tsx` |
| `useUpdateWithdrawal` | PATCH withdrawal status | `admin/index.tsx` |

All queries use `placeholderData` with mock objects as fallback while real data loads — the app is fully functional even without a backend.

---

### 3. Data Models / Types / Interfaces

**Auth context (`contexts/auth.tsx`):**
```ts
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}
// User type imported from @workspace/api-client-react
// user.plan: 'free' | 'premium'
```

**Profile (`dashboard/profile.tsx` — Zod schema):**
```ts
{
  fullName, title, tagline, bio,
  photoUrl, logoUrl,
  skills: string[],
  services,
  whatsapp, emailContact,
  linkedin, twitter, github, website,
  country, city,
  styleTheme: "minimalist" | "modern" | "classic" | "bold" | "elegant",
  primaryColor, fontFamily,
  yearsExperience, completedProjects, satisfiedClients,
  availableForWork: boolean
}
```

**Dashboard Summary (mock shape):**
```ts
{ plan, portfolioUrl, totalViews, viewsThisMonth, activeReferrals, walletBalance, profileComplete, subscriptionExpiresAt }
```

**Analytics Stats:**
```ts
{ totalViews, viewsThisMonth, viewsByCountry: [{country, count}], viewsByDay: [{date, count}] }
```

**Referral Stats:**
```ts
{ referralCode, referralLink, totalReferrals, activeReferrals, walletBalance, totalEarned, totalWithdrawn }
```

**Commission:**
```ts
{ id, refereeId, refereeUsername, amount, month, status: "paid" | "pending", createdAt }
```

**Public Portfolio:**
```ts
{ user: User, profile: Profile, projects: Project[] }
// Project: { id, userId, title, description, imageUrl, projectUrl, createdAt }
```

**Admin Stats:**
```ts
{ totalUsers, premiumUsers, totalRevenue, totalCommissionsPaid, pendingWithdrawals }
```

**Withdrawal:**
```ts
{ id, userId, amount, method, status: "pending" | "approved" | "rejected", requestedAt }
```

---

### 4. Authentication & Authorization

- **Storage**: JWT token + user object stored in `localStorage` under keys `portfolio_token` and `portfolio_user`.
- **Context**: `AuthProvider` in `contexts/auth.tsx` hydrates state from localStorage on mount, exposes `login()`, `logout()`, `isAuthenticated`, `isLoading`, `user`, `token`.
- **Route protection**: `ProtectedRoute` component in `App.tsx` — redirects unauthenticated users to `/connexion`. The `adminOnly` prop exists but is **not enforced client-side** (the comment in code acknowledges this); admin access relies on the API rejecting unauthorized requests.
- **No token refresh logic** — token is stored as-is, no expiry handling on the frontend.
- **Login flow**: `useLogin` mutation → on success, calls `auth.login(token, user)` → redirects to `/dashboard`.
- **Register flow**: `useRegister` mutation → same pattern, auto-logs in on success.

---

### 5. Forms & Their Fields

**Login form** (`/connexion`):
- `email` — required, email format
- `password` — required, min 6 chars

**Register form** (`/inscription`):
- `username` — min 3 chars, alphanumeric + `-_` only (becomes the portfolio URL slug)
- `email` — required, email format
- `password` — required, min 6 chars
- `referralCode` — optional, auto-populated from `?ref=` URL param

**Profile edit form** (`/dashboard/profil`) — 4 tabbed sections:
- **Identity tab**: `fullName`, `title`, `tagline`, `bio`, `photoUrl` (URL), `logoUrl` (URL), `yearsExperience`, `completedProjects`, `satisfiedClients`, `city`, `country`, `availableForWork` (toggle)
- **Skills & Services tab**: `skills` (tag input, add/remove), `services` (textarea)
- **Contact & Networks tab**: `emailContact`, `whatsapp`, `linkedin`, `github`, `twitter`, `website`
- **Appearance tab**: `styleTheme` (5 visual themes), `primaryColor` (6 presets + custom), `fontFamily` (6 options) — with live preview

**Withdrawal form** (`/dashboard/parrainage` — dialog):
- `amount` — number, min 500 FCFA
- `method` — select: `mobile_money` | `subscription_credit`
- `phoneNumber` — conditional, required when method is `mobile_money`

**Payment form** (`/dashboard/abonnement`):
- `operator` — select: `mtn` | `moov` | `wave`
- `phoneNumber` — required

All forms use **react-hook-form** + **Zod** for validation.

---

### 6. Key Features & Functionality

**Public-facing:**
- Landing page with pricing tiers (Découverte: 0 FCFA, Pro: 360 FCFA/month)
- Public portfolio pages at `/portfolio/:username` — fully themed, no login required
- Portfolio view tracking (fires `useRecordView` on load, once per visit)

**Portfolio theming system:**
- 5 themes: Minimalist, Modern (dark/glassmorphism), Classic (serif), Bold (full-bleed typography), Elegant (warm tones)
- Per-user primary color (6 presets + custom hex)
- Per-user font family (6 options including Playfair Display, Space Grotesk, Syne)
- Live preview in the profile editor

**Dashboard:**
- Overview cards: views this month, active referrals, wallet balance, current plan
- Profile completion prompt if profile is incomplete
- Link to view live portfolio

**Referral / Affiliate system:**
- Unique referral code + shareable link per user
- Commission tracking per referred user per month
- Wallet balance accumulation
- Withdrawal requests: Mobile Money (with phone number) or subscription credit
- Minimum withdrawal: 500 FCFA

**Subscription / Payments:**
- Mobile Money payment via MTN, Moov, or Wave operators
- 360 FCFA/month for Pro plan
- Payment initiation returns a `paymentUrl` for redirect, or triggers phone confirmation

**Analytics:**
- Line chart: daily views over 14 days (Recharts)
- Bar chart: views by country
- Total views + monthly views KPIs

**Admin panel:**
- Platform-wide stats: total users, premium users, total revenue, commissions paid, pending withdrawals
- Withdrawal approval/rejection workflow
- Last 10 registered users table with plan badges and portfolio view counts

**Tech stack summary:**
- React 18 + TypeScript
- Wouter (routing)
- TanStack React Query v5 (server state)
- react-hook-form + Zod (forms/validation)
- Radix UI primitives + shadcn/ui component library
- Recharts (charts)
- Tailwind CSS v4
- Lucide React (icons)
- Vite (build tool)

J'ai maintenant une analyse complète du frontend. Voici le plan détaillé pour implémenter le backend.

---

# Plan Backend — AfriFolio (Node.js + MySQL)

## Vue d'ensemble de l'architecture

```
backend/
├── src/
│   ├── config/          # DB, env, constantes
│   ├── middleware/       # auth JWT, admin, error handler
│   ├── routes/          # déclaration des routes
│   ├── controllers/     # logique métier par domaine
│   ├── models/          # requêtes SQL (pas d'ORM)
│   ├── services/        # logique complexe (paiement, commissions)
│   └── app.js           # Express app
├── migrations/          # scripts SQL de création des tables
├── .env
└── package.json
```

Stack : **Express.js**, **mysql2**, **jsonwebtoken**, **bcryptjs**. Pas d'ORM — requêtes SQL directes avec `mysql2/promise`.

---

## Schéma de base de données (6 tables)

```sql
-- 1. Utilisateurs
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  plan          ENUM('free', 'premium') DEFAULT 'free',
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  referred_by   INT REFERENCES users(id),
  is_admin      BOOLEAN DEFAULT FALSE,
  created_at    DATETIME DEFAULT NOW()
);

-- 2. Profils portfolio
CREATE TABLE profiles (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNIQUE NOT NULL REFERENCES users(id),
  full_name           VARCHAR(100),
  title               VARCHAR(150),
  tagline             VARCHAR(255),
  bio                 TEXT,
  photo_url           VARCHAR(500),
  logo_url            VARCHAR(500),
  skills              JSON,           -- tableau de strings
  services            TEXT,
  whatsapp            VARCHAR(30),
  email_contact       VARCHAR(255),
  linkedin            VARCHAR(500),
  twitter             VARCHAR(500),
  github              VARCHAR(500),
  website             VARCHAR(500),
  country             VARCHAR(100),
  city                VARCHAR(100),
  style_theme         ENUM('minimalist','modern','classic','bold','elegant') DEFAULT 'modern',
  primary_color       VARCHAR(10),
  font_family         VARCHAR(100),
  years_experience    INT,
  completed_projects  INT,
  satisfied_clients   INT,
  available_for_work  BOOLEAN DEFAULT TRUE,
  updated_at          DATETIME DEFAULT NOW() ON UPDATE NOW()
);

-- 3. Projets portfolio
CREATE TABLE projects (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id),
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  image_url   VARCHAR(500),
  project_url VARCHAR(500),
  created_at  DATETIME DEFAULT NOW()
);

-- 4. Vues portfolio (analytics)
CREATE TABLE portfolio_views (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  portfolio_username VARCHAR(50) NOT NULL,
  viewer_ip          VARCHAR(45),
  viewer_country     VARCHAR(100),
  viewed_at          DATETIME DEFAULT NOW()
);

-- 5. Commissions de parrainage
CREATE TABLE commissions (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  referrer_id     INT NOT NULL REFERENCES users(id),
  referee_id      INT NOT NULL REFERENCES users(id),
  amount          INT NOT NULL,       -- en FCFA
  month           VARCHAR(7) NOT NULL, -- ex: "2025-05"
  status          ENUM('pending','paid') DEFAULT 'pending',
  created_at      DATETIME DEFAULT NOW()
);

-- 6. Demandes de retrait
CREATE TABLE withdrawals (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL REFERENCES users(id),
  amount        INT NOT NULL,
  method        ENUM('mobile_money','subscription_credit') NOT NULL,
  phone_number  VARCHAR(30),
  status        ENUM('pending','approved','rejected') DEFAULT 'pending',
  requested_at  DATETIME DEFAULT NOW(),
  processed_at  DATETIME
);

-- 7. Abonnements / paiements
CREATE TABLE subscriptions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users(id),
  operator     ENUM('mtn','moov','wave') NOT NULL,
  phone_number VARCHAR(30) NOT NULL,
  amount       INT DEFAULT 360,
  status       ENUM('pending','success','failed') DEFAULT 'pending',
  expires_at   DATETIME,
  created_at   DATETIME DEFAULT NOW()
);
```

---

## Endpoints API (16 routes)

### Auth — `/api/auth`
| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/auth/register` | Inscription + génération referral_code + JWT |
| `POST` | `/api/auth/login` | Connexion + JWT |

**Register** reçoit `{ username, email, password, referralCode? }`, génère un `referral_code` unique (ex: `REF-XXXX`), lie le parrain si `referralCode` valide, retourne `{ token, user }`.

**Login** reçoit `{ email, password }`, vérifie bcrypt, retourne `{ token, user }`.

---

### Profil — `/api/profile` (JWT requis)
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/profile` | Récupère le profil de l'utilisateur connecté |
| `PUT` | `/api/profile` | Met à jour le profil (30+ champs) |

---

### Portfolio public — `/api/portfolio`
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/portfolio/:username` | Retourne `{ user, profile, projects }` |
| `POST` | `/api/portfolio/view` | Enregistre une vue `{ portfolioUsername }` |

---

### Dashboard — `/api/dashboard` (JWT requis)
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/dashboard/summary` | Résumé : plan, vues, filleuls, solde, expiration |

---

### Analytics — `/api/analytics` (JWT requis)
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/analytics` | `{ totalViews, viewsThisMonth, viewsByDay[14j], viewsByCountry }` |

---

### Parrainage — `/api/referral` (JWT requis)
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/referral/stats` | Code, lien, totaux, solde wallet |
| `GET` | `/api/referral/commissions` | Historique des commissions |
| `POST` | `/api/referral/withdraw` | Demande de retrait `{ amount, method, phoneNumber? }` |

---

### Abonnement — `/api/subscription` (JWT requis)
| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/subscription/initiate` | Initie paiement Mobile Money `{ operator, phoneNumber }` |
| `POST` | `/api/subscription/webhook` | Callback du provider de paiement (public) |

---

### Admin — `/api/admin` (JWT + is_admin requis)
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/admin/stats` | Totaux : users, premium, revenus, commissions, retraits en attente |
| `GET` | `/api/admin/users` | Liste des utilisateurs avec `totalViews` |
| `GET` | `/api/admin/withdrawals` | Toutes les demandes de retrait |
| `PUT` | `/api/admin/withdrawals/:id` | Approuver/rejeter `{ status: 'approved'|'rejected' }` |

---

## Logique métier clé

**Commissions de parrainage**
- Taux : 10% de l'abonnement mensuel (360 FCFA → 36 FCFA/mois par filleul actif)
- Déclenchement : à chaque paiement réussi d'un filleul, créer une commission `pending` pour le parrain
- Le webhook de paiement → marque la commission `paid` + crédite le wallet (calculé à la volée depuis les commissions)

**Wallet balance**
- Pas de colonne wallet en DB — calculé dynamiquement : `SUM(commissions paid) - SUM(withdrawals approved)`

**Génération du referral_code**
- Format `REF-XXXXXX` (6 chars alphanumériques aléatoires), vérifié unique en DB

**Sécurité**
- JWT avec expiration 7 jours, secret dans `.env`
- Middleware `authenticate` sur toutes les routes protégées
- Middleware `requireAdmin` vérifie `user.is_admin = true`
- Mots de passe hashés avec bcrypt (salt rounds: 12)
- Rate limiting sur `/api/auth/*`

---

## Ordre d'implémentation recommandé

1. **Setup** — `package.json`, connexion MySQL, variables d'env, Express app de base
2. **Auth** — register + login (tables `users`)
3. **Profil** — GET + PUT (table `profiles`)
4. **Portfolio public** — GET + enregistrement des vues
5. **Dashboard summary** — agrégation des données
6. **Analytics** — requêtes sur `portfolio_views`
7. **Parrainage** — stats, commissions, retrait
8. **Abonnement** — initiation paiement + webhook
9. **Admin** — panel avec stats et gestion retraits

---

Tu veux que je commence l'implémentation directement ? Je peux attaquer par le setup + auth + profil en premier.


**Après** — sans hésitation.

Raisons concrètes :

- Le SEO ne sert à rien si le produit n'est pas encore stable. Google n'indexe pas un site en dev local.
- Ajouter le prerendering maintenant risque de casser ce que tu es en train de construire.
- La priorité c'est : produit qui fonctionne → utilisateurs réels → SEO.

**L'ordre logique pour AfriFolio :**

1. ✅ Backend API — en cours
2. ⬜ Finir les features (projets portfolio, admin complet)
3. ⬜ Déploiement (VPS ou hébergement)
4. ⬜ SEO / Open Graph / prerendering — **à ce moment là seulement**

Ce qu'on fait maintenant c'est bien plus urgent — est-ce que le bouton save fonctionne maintenant ?