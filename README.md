# Dazzle Draft Den - Backend

NestJS backend for the Dazzle Draft Den e-commerce application.

## Setup

```bash
cd backend
npm install
```

## Environment

Copy `.env.example` to `.env` and adjust:

- `PORT` - Server port (default: 3001)
- `JWT_SECRET` - Secret for JWT tokens
- `CORS_ORIGIN` - Frontend URL (default: http://localhost:5173)
- `DATABASE_PATH` - SQLite database path (default: ./data/dazzle.db)
- `DATABASE_URL` - (Optional) Remote DB for sync. Supports **PostgreSQL** (e.g. Render Postgres, Neon) or **MongoDB Atlas**. When set, the backend keeps a local SQLite copy and auto-syncs so data persists when the server sleeps (e.g. on Render free tier).
- `DATABASE_SSL` - Set to `false` to disable SSL for PostgreSQL `DATABASE_URL` (e.g. local Postgres). Ignored for MongoDB.

### Local syncs FROM Live DB

When `DATABASE_URL` is set, **Live (MongoDB/Postgres) is the source of truth**. Local SQLite syncs from it:

- **PostgreSQL**: `postgresql://user:pass@host:5432/dbname`
- **MongoDB Atlas**: `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority`

- **Startup**: Data is pulled from the remote (live) DB into the local SQLite file.
- **Every 5 minutes**: Local is updated again from the live DB (no automatic push from local to live).
- **Optional**: Admin can trigger "Sync to cloud now" (POST /sync/push) to push local data to live.

## Run

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API

- **Auth**: `POST /auth/login`, `GET /auth/me` (Bearer token)
- **Products**: `GET /products`, `GET /products/:id`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`
- **Orders**: `GET /orders`, `POST /orders`, `PATCH /orders/:id/status`
- **Customers**: `GET /customers`
- **Analytics**: `GET /analytics/dashboard`, `GET /analytics/sales-by-month`, etc.
- **Sync** (admin): `POST /sync/push` – push local DB to remote now (Bearer token required).

## Production checklist

- [ ] Set `JWT_SECRET` to a strong random value (do not use default).
- [ ] Set `CORS_ORIGIN` to your frontend URL(s). Multiple origins: comma-separated (e.g. `https://yourapp.com,https://admin.yourapp.com`).
- [ ] Set `DATABASE_URL` to MongoDB Atlas or Postgres so data persists when the server sleeps (e.g. on Render).
- [ ] Ensure frontend builds with `VITE_API_URL` set to your backend URL (e.g. `https://your-backend.onrender.com`).
- [ ] Default admin: change password after first login (admin@engine.com / admin123).

## Default Admin

- Email: admin@engine.com
- Password: admin123
