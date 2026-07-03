# Security Model

## Edge Security
Enforced by `src/middleware.ts`:
- **CSP**: Restricts script execution to trusted domains.
- **HSTS**: Forces HTTPS strictly.
- **X-Frame-Options**: Prevents clickjacking.

## Rate Limiting
API routes are guarded by basic rate-limiting constructs in middleware.

## Authentication
JWT-based session management using NextAuth.js. Passwords hashed using bcrypt.