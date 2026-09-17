# Asian News Bureau — Community News Platform

Production-hardened MERN/Expo monorepo for an NGO/community news platform.

- **Mobile** (`/mobile`) — React Native + Expo end-user app
- **Admin** (`/admin-panel`) — React + Vite moderation/operations panel
- **Backend** (`/server`) — Node.js + Express + MongoDB API

## Repository structure

```text
ngo-app/
├── mobile/          # Expo / React Native client
├── admin-panel/     # React / Vite admin application
├── server/          # Express / MongoDB API
├── README.md
└── PRODUCTION_UPGRADE_STATUS.md
```

## Requirements

- Node.js 18+
- npm 9+
- MongoDB 6+ / MongoDB Atlas
- Cloudinary account for media storage
- Expo/EAS project for real push notifications

## Install

```bash
cd server && npm ci
cd ../admin-panel && npm ci
cd ../mobile && npm ci
```

## Environment

Never commit real secrets. Start from each `.env.example` and populate deployment secrets through your hosting platform.

### Server

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Access-token signing secret |
| `JWT_REFRESH_SECRET` | Refresh-token signing secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud |
| `CLOUDINARY_API_KEY` | Cloudinary key |
| `CLOUDINARY_API_SECRET` | Cloudinary secret |
| `CLIENT_URL` | Allowed admin origin(s) |
| `EXPO_ACCESS_TOKEN` | Expo push API access token when enabled |
| `DEFAULT_CREDIT_AMOUNT` | Legacy fallback only; persisted platform settings are preferred |
| `WELCOME_BONUS_CREDITS` | Legacy fallback only; persisted platform settings are preferred |

### Admin

`VITE_API_BASE_URL` — backend API URL.

### Mobile

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Backend API URL |
| `EXPO_PUBLIC_WEB_URL` | Public web/deep-link base used in story sharing |

## Development

```bash
# Backend
cd server && npm run dev

# Admin
cd admin-panel && npm run dev

# Mobile
cd mobile && npm start
```

## Production operations

Create the first administrator explicitly:

```bash
cd server
npm run admin:create
```

Run the legacy-data migration only after backing up the database and reviewing its output:

```bash
npm run migrate:legacy
```

The API exposes:

```text
GET /api/health
GET /api/ready
```

## Core application flows

### User

```text
Register/Login
    ↓
Browse/Search News
    ↓
Read / Like / Comment / Save / Share
    ↓
Submit Story + Media
    ↓
Track Submission
    ↓
Published / Needs Changes / Rejected
    ↓
Earn Credits on Approval
    ↓
Receive In-App + Push Notifications
```

### Admin

```text
Dashboard
    ↓
Submission Queue
    ↓
Claim / Review
    ↓
Approve / Request Changes / Reject
    ↓
Audit Log + Contributor Credit Ledger
    ↓
Reports / Users / Broadcast / Settings
```

## API overview

### Auth

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh-token
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password/:token
GET  /api/auth/me
```

### Users

```text
GET    /api/users/me
PATCH  /api/users/me
GET    /api/users/me/stats
PATCH  /api/users/me/push-token
DELETE /api/users/me/push-token
```

### News/social

```text
GET    /api/news
GET    /api/news/:id
POST   /api/news                 # admin direct publish
PUT    /api/news/:id/like
DELETE /api/news/:id/like
POST   /api/news/:id/save
DELETE /api/news/:id/save
GET    /api/news/:id/comments
POST   /api/news/:id/comments
DELETE /api/news/:id/comments/:commentId
POST   /api/news/:id/report
DELETE /api/news/:id               # admin archive/soft-delete
```

### Submissions

```text
POST  /api/submissions
GET   /api/submissions/mine
POST  /api/submissions/:id/resubmit
```

### Notifications / credits

```text
GET   /api/notifications/mine
GET   /api/notifications/unread-count
GET   /api/notifications/highlight
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
GET   /api/credits/history
GET   /api/users/me/saved-stories
```

### Admin

```text
GET    /api/admin/dashboard/stats
GET    /api/admin/submissions
GET    /api/admin/submissions/:id
PATCH  /api/admin/submissions/:id/claim
PATCH  /api/admin/submissions/:id/approve
PATCH  /api/admin/submissions/:id/request-changes
PATCH  /api/admin/submissions/:id/reject
GET    /api/admin/submissions/:id/revisions
GET    /api/admin/users
GET    /api/admin/users/:id
PATCH  /api/admin/users/:id/status
PATCH  /api/admin/credits/adjust
GET    /api/admin/reports
PATCH  /api/admin/reports/:id/resolve
GET    /api/admin/audit-logs
POST   /api/admin/notifications/broadcast
GET    /api/admin/settings
PATCH  /api/admin/settings
```

## Scheduled jobs

- Weekly contributor calculation — previous completed Monday-to-Monday period.
- Monthly contributor calculation — previous completed calendar month.
- Expo push receipt processing — every 15 minutes.

## Testing and release verification

The source release does not contain dependencies. After extraction:

```bash
cd server && npm ci && npm test && npm run check
cd ../admin-panel && npm ci && npm run build
cd ../mobile && npm ci && npx expo-doctor
```

Then run the critical end-to-end flows against staging:

1. Register/login/refresh/logout.
2. Register push token on a physical EAS build.
3. Submit media-backed story.
4. Admin claim/review/approve.
5. Verify exactly one credit reward, ledger entry, DB notification, and push delivery.
6. Request changes → edit/resubmit.
7. Like/unlike/save/report/comment concurrently.
8. Verify notification receipt processing and invalid-token deactivation.
9. Verify archive, audit log, reports, and settings.

See `PRODUCTION_UPGRADE_STATUS.md` for the exact remaining verification and product-extension scope.
