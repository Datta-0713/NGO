# NEXY Foundation Community News API

This is the backend service for the NEXY Foundation Community News App. It provides a REST API to serve both a React Native mobile app and a React web admin panel.

## Prerequisites

- Node.js (v18+)
- MongoDB (running locally or MongoDB Atlas)
- Cloudinary Account (for media uploads)

## Installation

1. Clone the repository and navigate to the `server` directory.
2. Run `npm install` to install dependencies.
3. Copy `.env.example` to `.env` and fill in your credentials.

## Environment Variables

| Variable | Description |
| --- | --- |
| `NODE_ENV` | Environment mode (`development` or `production`) |
| `PORT` | Port for the server to listen on |
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Secret key for JWT access tokens |
| `JWT_REFRESH_SECRET` | Secret key for JWT refresh tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## Running the Server

- **Development Mode**: `npm run dev` (uses nodemon)
- **Production Mode**: `npm start`

## API Endpoints Summary

### Auth (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Log in a user
- `POST /refresh-token` - Refresh access token
- `POST /logout` - Log out
- `GET /me` - Get current authenticated user

### Users (`/api/users`)
- `GET /me` - Get user profile
- `PATCH /me` - Update user profile
- `GET /me/stats` - Get user contribution stats

### News (`/api/news`)
- `GET /` - Get public news feed
- `GET /:id` - Get a specific news post
- `POST /` - (Admin) Create a news post directly
- `PATCH /:id/like` - Toggle like on a news post
- `DELETE /:id` - (Admin) Delete a news post

### Submissions (`/api/submissions`)
- `POST /` - Submit a news post for review
- `GET /mine` - Get user's own submissions

### Admin (`/api/admin`)
- `GET /dashboard/stats` - Get admin dashboard statistics
- `GET /submissions` - Get pending submissions queue
- `GET /submissions/:id` - Get specific submission details
- `PATCH /submissions/:id/approve` - Approve a submission
- `PATCH /submissions/:id/reject` - Reject a submission
- `GET /users` - Get all users
- `GET /users/:id` - Get a specific user
- `PATCH /credits/adjust` - Adjust user credits manually
- `POST /notifications/broadcast` - Broadcast a notification to all users

### Notifications (`/api/notifications`)
- `GET /mine` - Get user's notifications
- `GET /unread-count` - Get unread notification count
- `GET /highlight` - Get unshown contributor highlight
- `PATCH /:id/read` - Mark a notification as read
- `PATCH /read-all` - Mark all notifications as read

### Credits (`/api/credits`)
- `GET /history` - Get user's credit history
