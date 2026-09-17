# Asian News Bureau API

Node.js/Express/MongoDB backend for the Asian News Bureau community-news platform.

## Prerequisites

- Node.js 18+
- MongoDB 6+; production transactions require MongoDB Atlas or a replica set
- Cloudinary account
- Expo/EAS project for push notifications

## Installation

```bash
npm ci
cp .env.example .env
# populate secrets in .env for local development only
```

Never commit a real `.env` file. Production secrets belong in the deployment platform's secret store.

## Commands

```bash
npm run dev          # development server
npm start            # production server
npm test             # Jest tests
npm run check        # JavaScript syntax check
npm run admin:create # explicitly create the first admin
npm run migrate:legacy # migrate legacy embedded social arrays after backup
```

## Core environment variables

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development` / `production` |
| `PORT` | API port |
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Access-token signing secret |
| `JWT_REFRESH_SECRET` | Refresh-token signing secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | Allowed admin origin(s) for CORS |
| `EXPO_ACCESS_TOKEN` | Expo push API access token when enabled |
| `DEFAULT_CREDIT_AMOUNT` | Fallback approval credit setting |
| `WELCOME_BONUS_CREDITS` | Fallback registration credit setting |

Credit defaults can also be persisted and audited from the admin Settings page.

## Authentication

Access tokens are short-lived. Refresh tokens are backed by hashed server-side `Session` records and are rotated on refresh. Logout revokes the active session. Password reset and account deactivation revoke active sessions as well.

## API summary

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
GET    /api/users/me/saved-stories
```

### News and social

```text
GET    /api/news
GET    /api/news/:id
POST   /api/news                       # admin direct publish
PUT    /api/news/:id/like
DELETE /api/news/:id/like
PATCH  /api/news/:id/like              # legacy-compatible toggle route
POST   /api/news/:id/save
DELETE /api/news/:id/save
GET    /api/news/:id/comments
POST   /api/news/:id/comments
DELETE /api/news/:id/comments/:commentId
POST   /api/news/:id/report
DELETE /api/news/:id                   # admin archive/soft-delete
```

### Submissions

```text
POST /api/submissions
GET  /api/submissions/mine
GET  /api/submissions/:id
POST /api/submissions/:id/resubmit
```

### Admin

```text
GET   /api/admin/dashboard/stats
GET   /api/admin/submissions
GET   /api/admin/submissions/:id
GET   /api/admin/submissions/:id/history
PATCH /api/admin/submissions/:id/claim
PATCH /api/admin/submissions/:id/approve
PATCH /api/admin/submissions/:id/request-changes
PATCH /api/admin/submissions/:id/reject
GET   /api/admin/users
GET   /api/admin/users/:id
PATCH /api/admin/users/:id/status
PATCH /api/admin/credits/adjust
POST  /api/admin/users/:userId/credits
GET   /api/admin/reports
PATCH /api/admin/reports/:id
GET   /api/admin/audit-logs
POST  /api/admin/notifications/broadcast
GET   /api/admin/settings
PATCH /api/admin/settings
```

### Notifications and credits

```text
GET   /api/notifications/mine
GET   /api/notifications/unread-count
GET   /api/notifications/highlight
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
GET   /api/credits/history
```

## Notification delivery

The backend first creates a durable in-app `Notification` record, then attempts Expo push delivery. Successful Expo tickets are stored in `PushDelivery`. A scheduled receipt worker processes Expo receipts and disables `PushToken` records when Expo reports `DeviceNotRegistered`.

A successful Expo ticket means Expo accepted the message for processing; physical-device delivery still depends on valid EAS/APNs/FCM configuration and device permission state.

## Scheduled jobs

- Previous completed weekly contributor period — every Monday.
- Previous completed calendar month contributor period — first day of each month.
- Expo push receipt processing — every 15 minutes.

## Operations

Readiness endpoints:

```text
GET /api/health
GET /api/ready
```

Run production on MongoDB Atlas (or another replica-set deployment) because the moderation and credit flows use MongoDB transactions.

See the repository-level `PRODUCTION_UPGRADE_STATUS.md` for the exact verification that remains before deployment certification.
