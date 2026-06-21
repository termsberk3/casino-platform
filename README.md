# Casino Platform

A full-stack casino game platform built for the Fullstack Developer Test.

The application includes authentication, game listing, backend-powered search, favorites, slot machine gameplay, spin history, balance updates, currency conversion, responsive UI, database migrations, seed data, API documentation, and security middleware.

## Tech Stack

### Backend

* Node.js
* NestJS
* TypeScript
* PostgreSQL
* TypeORM
* JWT authentication
* Class Validator / DTO validation
* Helmet
* CORS
* Swagger / OpenAPI documentation

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Zod form validation
* Responsive mobile-first UI

### Infrastructure

* Docker Compose for PostgreSQL
* TypeORM migrations
* JSON seed data for games

---

## Features

### Authentication

* User registration
* User login
* JWT access token authentication
* Refresh token rotation
* Logout with refresh token revocation
* Protected user profile
* Client-side login/register validation with Zod
* Server-side DTO validation remains the source of truth

### Games

* Game list served by the backend
* Game detail page
* Game search
* Provider filtering
* Partial and case-insensitive search
* Pagination
* Favorite / unfavorite games
* User favorite games page

### Slot Machine

* Authenticated users can spin
* Bet amount selection
* Transactional spin handling
* Balance update after each spin
* Spin history
* Idempotency key support
* Win/loss result display
* Animated reels
* Vintage casino-style slot machine UI

### Currency Conversion

* Convert user balance to another currency
* Public currency conversion endpoint
* Cached exchange rate lookups

### UI / UX

* Dark vintage casino color palette
* Responsive mobile-first design
* Tablet and desktop layout adjustments
* Avatar dropdown navigation
* Profile menu
* Form validation feedback
* Search debounce behavior
* Floating win/loss result animation

### Security

* Password hashing
* JWT authentication
* Refresh token hashing in database
* Rate limiting
* Helmet security headers
* CORS configuration
* Server-side validation
* Protected routes
* Environment variable validation

---

## Project Structure

```txt
casino-platform/
  apps/
    api/
      src/
        auth/
        games/
        users/
        spins/
        currency/
        database/
        common/
      data/
        game-data.json
    web/
      src/
        app/
        components/
        lib/
        providers/
        types/
  docker-compose.yml
  README.md
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js
* pnpm
* Docker
* Docker Compose

---

## Environment Variables

### Backend

Create an environment file inside:

```txt
apps/api/.env
```

Example:

```env
PORT=3001

DATABASE_URL=postgres://postgres:postgres@localhost:5432/casino_platform

JWT_ACCESS_SECRET=replace-with-a-secure-access-secret
JWT_REFRESH_SECRET=replace-with-a-secure-refresh-secret

CORS_ORIGIN=http://localhost:3000


CURRENCY_API_BASE_URL=https://api.frankfurter.dev/v2
CURRENCY_CACHE_TTL_MS=600000

SWAGGER_ENABLED=true
```

### Frontend

Create an environment file inside:

```txt
apps/web/.env.local
```

Example:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

---

## Installation

Install dependencies from the project root:

```bash
pnpm install
```

---

## Run PostgreSQL

From the project root:

```bash
docker compose up -d
```

---

## Backend Setup

Go to the API app:

```bash
cd apps/api
```

Run migrations:

```bash
pnpm migration:run
```

Seed the database:

```bash
pnpm seed
```

Start the backend:

```bash
pnpm start:dev
```

The API should be available at:

```txt
http://localhost:3001
```

Swagger documentation should be available at:

```txt
http://localhost:3001/docs
```

---

## Frontend Setup

Go to the web app:

```bash
cd apps/web
```

Start the frontend:

```bash
pnpm dev
```

The frontend should be available at:

```txt
http://localhost:3000
```

---

## Database Reset Notes

If the Docker volume is removed, the database will be empty again.

In that case, run:

```bash
docker compose up -d

cd apps/api
pnpm migration:run
pnpm seed
pnpm start:dev
```

If the Docker volume is kept, migrations and seed do not need to be re-run every time.

---

## Main API Endpoints

### Auth

```txt
POST /auth/register
POST /auth/login
GET  /auth/me
POST /auth/refresh
POST /auth/logout
```

### Games

```txt
GET    /games
GET    /games/search
GET    /games/:id
POST   /games/:id/favorite
DELETE /games/:id/favorite
```

### Users

```txt
GET /users/me/favorites
```

### Spins

```txt
POST /spins
GET  /spins/history
```

### Currency

```txt
GET /currency/convert
GET /currency/me
```

---

## Search Behavior

The homepage search is backend-powered and debounced on the frontend.

Search behavior:

```txt
0 characters  -> normal game list
1 character   -> no search request
2+ characters -> backend search request
```

Provider filtering supports partial and case-insensitive matching.

Examples:

```txt
provider=bg
provider=BGAM
provider=gaming
```

All of these can match `BGaming`.

---

## Slot Machine Rules

The slot machine uses three reels and four possible symbols:

```txt
cherry
lemon
apple
banana
```

The payout is calculated on the backend. Matching starts from the first reel and the highest matching rule is applied.

Example behavior:

```txt
Cherry Cherry Cherry -> highest cherry payout
Apple Apple Banana   -> two apples from the left
Lemon Lemon Apple    -> no payout
```

Every spin:

* validates the user
* validates balance
* uses an idempotency key
* updates balance transactionally
* stores spin history
* returns reels, winnings, multiplier, and net result

---

## Database Overview

Main tables:

```txt
users
casinos
game_types
games
countries
game_countries
user_favorite_games
spin_history
refresh_tokens
```

Relationship summary:

```txt
users -> user_favorite_games -> games
users -> spin_history -> games
games -> casinos
games -> game_types
games -> game_countries -> countries
users -> refresh_tokens
```

## Database Documentation

Database design, ERD, relationships, and SQL create statements are documented in:

[docs/database.md](./docs/database.md)

The application uses bigint-style primary keys for main entities and keeps the original game JSON id as an external id.

A visual ERD is also available here:

[Casino Platform ERD](./docs/casino-platform-erd.png)

---

## Validation

### Backend Validation

Backend requests are validated using DTOs and validation pipes.

Examples:

* email format validation
* password validation
* pagination query validation
* spin bet amount validation
* UUID idempotency key validation
* protected route validation

### Frontend Validation

Login and register forms are validated with Zod for better user experience.

Frontend validation catches common input problems before sending requests to the API.

The backend remains the source of truth for security.

---

## Security Notes

Implemented security-related features:

* Passwords are hashed before storage
* Refresh tokens are hashed before storage
* Access tokens are short-lived JWTs
* Refresh tokens are rotated
* Logout revokes refresh tokens
* Protected endpoints require bearer authentication
* Helmet is enabled
* CORS is configured
* Server-side validation is used
* Environment variables are validated on startup

---

## Testing Checklist

Manual test flow:

```txt
Register a new user
Login with the user
Try invalid login/register form values
View game list
Use live search with at least 2 characters
Use provider filter with partial lowercase/uppercase input
Open a game detail page
Try spinning while logged out
Spin while logged in
Confirm balance updates
Favorite and unfavorite a game
Open profile page
Check favorite games
Check spin history
Check balance currency conversion
Logout
Test mobile, tablet, and desktop layouts
```

Backend checks:

```bash
cd apps/api
pnpm build
pnpm test
```

Frontend checks:

```bash
cd apps/web
pnpm build
```

---

## AI Usage Disclosure

AI assistance was used during development for:

* planning the project structure
* refining database relationships
* debugging TypeScript and UI issues
* improving responsive design
* generating and reviewing README content
* explaining implementation tradeoffs

All generated suggestions were reviewed, edited, and integrated manually.

---

## Notes

This project was built as a full-stack technical test and focuses on clean architecture, backend-driven data, authentication, database relationships, responsive UI, and practical security considerations.
