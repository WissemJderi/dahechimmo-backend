# Dahech Immo API

Backend for my uncle's real estate website. Handles property listings with full CRUD operations, image uploads to Cloudinary, and a JSON Web Token secured admin area.

## Tech Stack

- NodeJS + Express (TypeScript)
- MongoDB + Mongoose
- Cloudinary + Multer for image uploads
- Zod for schema validation
- Vitest + Supertest for tests
- Swagger UI for API docs

## Setup

1. Clone the repository
2. Remove the `.git` folder if you forked it: `rm -rf .git`
3. Install dependencies: `npm install --legacy-peer-deps`
   - The `--legacy-peer-deps` flag is required until `multer-storage-cloudinary` supports `cloudinary@2`.
4. Create a `.env` file with the same variables as the deployed environment, then adjust them to your own values.

Required variables: `MONGODB_URI`, `PORT`, and the Cloudinary credentials (`CLOUDINARY_NAME`, `API_KEY`, `API_SECRET`), plus the admin login (`ADMIN`, `JWT_SECRET`, `PASSWORD`).

Note: `PASSWORD` is not the plain password — it is the **bcrypt hash** of the admin password. Generate one with:

```
npm run hash -- <your-password>
```

The test credentials in `vitest.config.mts` are dummy values for CI only; they are never used outside the test suite.

5. Run the development server: `npm run dev`

## Scripts

| Command        | Description                              |
| -------------- | ---------------------------------------- |
| `npm run dev`  | Start the dev server with auto-restart    |
| `npm run build`| Compile TypeScript to `build/`            |
| `npm start`    | Run the compiled server                   |
| `npm run lint` | ESLint over the codebase                  |
| `npm test`     | Run the vitest suite                      |
| `npm run check`| Lint + build + test in one go             |
| `npm run hash` | Generate a bcrypt hash for `PASSWORD`     |

## API

Interactive docs are served at `/api-docs` (Swagger UI).

Base URL: `http://localhost:3001`

### Health / liveness

- `GET /health` — `200 {"status":"ok"}` when MongoDB is connected, `503` otherwise
- `GET /ping` — liveness check, returns `pong`

### Properties

- `GET /api/properties?page=1&limit=16` — paginated list, newest first. Total count comes back in the `X-Total-Count` response header.
- `GET /api/properties/search?location=&type=&page=&limit=` — filter by exact `location` and/or `type` (the same enum values used on create).
- `GET /api/properties/:id` — a single property, or `404`.
- `POST /api/properties` — **admin**. Send a `multipart/form-data` body with up to 5 `images` files plus the text fields. Fields: `title`, `ref`, `description`, `price`, `propertyType`, `location`, `area`, `status` (`sale`/`rent`), and optional `bedrooms`, `bathrooms`, `floor`, `parking`.
- `PUT /api/properties/:id` — **admin**. Multipart body like POST; pass existing images as a JSON stringified array in the `existingImages` field.
- `DELETE /api/properties/:id` — **admin**. Deletes the property and its Cloudinary images.

Validation errors return `400`, a property reference that already exists returns `409`, files over 5 MB return `413`.

### Auth

- `POST /api/auth/login` — send `{"username", "password"}`. Returns a JWT valid for 7 days. Rate limited (10 attempts per 5 minutes per IP → `429`).
- `GET /api/auth/properties` — **admin**. Lists all properties (used by the admin dashboard).

All admin endpoints expect `Authorization: Bearer <token>`.

## Testing

```
npm test
```

The suite covers the health endpoint, JSON 404 handling, the error handler (multer errors, unexpected errors), the properties router (auth before upload, image requirements, malformed `existingImages`, pagination params), login + rate limiting, and the database layer against an in-memory MongoDB (no real database needed).

Built by **Wissem Jderi**
