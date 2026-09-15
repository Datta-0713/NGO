# NEXY Foundation — Community News Platform

A production-grade MERN monorepo for an NGO community news platform. Two clients share one backend:

- **Mobile app** (`/mobile`) — React Native (Expo) for end users
- **Admin panel** (`/admin-panel`) — React + Vite for NGO staff
- **Backend** (`/server`) — Node.js + Express + MongoDB

---

## Repository Structure

```
ngo-app/
├── mobile/          # React Native (Expo) — end-user mobile app
├── admin-panel/     # React + Vite — NGO admin web panel
├── server/          # Node.js + Express + MongoDB API
└── README.md        # This file
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18.x |
| npm | ≥ 9.x |
| MongoDB | ≥ 6.x (local) or MongoDB Atlas |
| Expo CLI | `npm install -g expo-cli` |

---

## Quick Start

### 1. Clone & install all dependencies

```bash
# Backend
cd server && npm install

# Admin panel
cd ../admin-panel && npm install

# Mobile app
cd ../mobile && npm install
```

### 2. Configure environment variables

```bash
# Server
cp server/.env.example server/.env
# Fill in MONGO_URI, JWT secrets, and Cloudinary credentials

# Admin panel
cp admin-panel/.env.example admin-panel/.env

# Mobile
cp mobile/.env.example mobile/.env
```

### 3. Start all services

```bash
# Terminal 1 — Backend API (port 5000)
cd server && npm run dev

# Terminal 2 — Admin panel (port 5173)
cd admin-panel && npm run dev

# Terminal 3 — Mobile app (Expo dev server)
cd mobile && npm start
```

---

## Environment Variables

### server/.env

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens (15 min) |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (7 days) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | Admin panel URL (for CORS) |
| `DEFAULT_CREDIT_AMOUNT` | Credits awarded per approved submission (default: 10) |
| `WELCOME_BONUS_CREDITS` | Credits awarded on signup (default: 5) |

### admin-panel/.env

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API URL (default: http://localhost:5000/api) |

### mobile/.env

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Backend API URL (default: http://localhost:5000/api) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo + TypeScript |
| Admin panel | React + Vite + TypeScript |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT (access + refresh tokens) |
| Media storage | Cloudinary via Multer |
| State management | Redux Toolkit (both clients) |
| Scheduled jobs | node-cron |
| Validation | express-validator |
| Charts | Recharts (admin panel) |

---

## User Roles

| Role | Access |
|---|---|
| `user` | Mobile app — browse, search, submit news, earn credits |
| `admin` | Admin panel — publish news, approve/reject submissions, manage users & credits |

---

## Key Features

- 📰 **News feed** — Published NGO news + approved community stories
- ✍️ **Submit news** — Photo/video upload, description, location, category
- 🔍 **Search** — Full-text search with topic chips and recent searches
- 📊 **Admin dashboard** — Real-time stats, submission queue, chart
- ✅ **Review workflow** — Pending → Under Review → Published/Rejected
- 💰 **Credits system** — Auto-awarded on approval, manual adjustment, ledger
- 🏆 **Top contributor** — Weekly/monthly cron job, one-time banner in app
- 🔔 **Notifications** — In-app notification feed per user

---

## API Overview

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh-token
GET    /api/users/me
PATCH  /api/users/me

GET    /api/news                          # public feed
GET    /api/news/:id                      # public single article
POST   /api/news                          # admin direct publish
PATCH  /api/news/:id/like                 # toggle like

POST   /api/submissions                   # user submit news
GET    /api/submissions/mine              # user's own submissions

GET    /api/admin/dashboard/stats
GET    /api/admin/submissions             # admin queue
GET    /api/admin/submissions/:id
PATCH  /api/admin/submissions/:id/approve
PATCH  /api/admin/submissions/:id/reject
GET    /api/admin/users
GET    /api/admin/users/:id
PATCH  /api/admin/credits/adjust
POST   /api/admin/notifications/broadcast

GET    /api/notifications/mine
GET    /api/notifications/unread-count
GET    /api/notifications/highlight
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all

GET    /api/credits/history
```

---

## Cron Jobs

| Job | Schedule | Description |
|---|---|---|
| Weekly Top Contributor | Every Monday 00:00 | Tallies published stories for the week |
| Monthly Top Contributor | 1st of each month 00:00 | Tallies published stories for the month |

Results are stored in `ContributorHighlight`. The next time a user opens the app, if an unshown highlight exists, a one-time banner is displayed and marked `shownToUsers: true`.

---

## Deployment

| Service | Platform |
|---|---|
| MongoDB | MongoDB Atlas |
| Backend API | Render / Railway |
| Admin panel | Vercel |
| Mobile | Expo EAS Build |

---

## License

Private — NEXY Foundation internal use.
