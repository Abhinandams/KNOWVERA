# Knowvera deployment on DigitalOcean

## 1) Production readiness checklist

- Use managed PostgreSQL (recommended).
- Rotate all secrets before first deployment.
- Set CORS origins via environment (`CORS_ALLOWED_ORIGINS`).
- Keep `.env` out of git. Commit only `.env.example` files.
- Use HTTPS custom domains for frontend and backend.

## 2) App Platform (recommended)

Create one App with 2 components from this repo:

- **Service**: `backend`
  - Environment: Java
  - Build command: `./mvnw -DskipTests package`
  - Run command: `java -jar target/*.jar`
  - HTTP port: `${SERVER_PORT}` (App Platform provides `PORT`; map/set `SERVER_PORT` to that value)

- **Static Site**: `frontend`
  - Build command: `npm ci && npm run build`
  - Output directory: `dist`

Create a **Managed PostgreSQL** database and attach values to backend env vars.

## 3) Backend environment variables

Set these in DigitalOcean App Platform for the backend component:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION_MS`
- `SERVER_PORT`
- `CORS_ALLOWED_ORIGINS` (comma-separated, e.g. `https://app.example.com`)
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_SMTP_AUTH`
- `MAIL_SMTP_STARTTLS`
- `MAIL_FROM`
- `VERIFY_BASE_URL` (public backend URL)
- Optional: `EMAIL_PROBE_MODE`, `EMAIL_PROBE_TIMEOUT_MS`, `EMAIL_PROBE_HELO`, `EMAIL_PROBE_FROM`

## 4) Frontend environment variable

Set in frontend component:

- `VITE_API_BASE_URL` = your backend public URL (for example `https://api.example.com`)

## 5) Database migration

Apply SQL from:

- `backend/sql/manual/001_create_email_verification_token.sql`

Run it once against production database before traffic.

## 6) Domains and TLS

- Add custom domain for frontend (e.g. `app.example.com`).
- Add custom domain for backend (e.g. `api.example.com`).
- Enable/verify DigitalOcean managed TLS certificates.

## 7) Smoke tests after deploy

- Login works from frontend.
- Protected APIs return 401 without token and 200 with valid token.
- File upload/serve works (`/uploads/**`).
- Email flow works (verification and notification).

## 8) Optional hardening

- Restrict Swagger in production.
- Add health endpoint + uptime alerting.
- Add backup/retention policy for database.
- Add CI pipeline for build + tests before deploy.
