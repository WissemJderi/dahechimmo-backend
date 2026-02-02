# Dahech Immo API

Backend for my uncle's real estate website. Handles property listings with full CRUD operations.

## Tech Stack

- NodeJS
- Express
- TypeScript
- Mongoose

## Setup

1. Clone the repository
2. Remove the .git folder : `rm -rf .git`
3. Install dependencies: `npm install`
4. Create `.env` file with:

```
   MONGODB_URI=your_mongodb_connection_string
   PORT=3001
```

5. Run development server: `npm run dev`

## API Endpoints

Base URL: `http://localhost:3001`

### Get all properties

```
GET /api/properties
```

Returns array of all properties. Pretty straightforward.

### Get one property

```
GET /api/properties/:id
```

Pass the property ID in the URL. Returns that property or 404 if it doesn't exist.

### Add new property

```
POST /api/properties
```

Send property data as JSON. Required fields: title, price, location, type.

Example body:

```json
{
  "title": "Villa in La Marsa",
  "description": "Nice place near the beach",
  "price": 450000,
  "location": "La Marsa, Tunis",
  "type": "sale",
  "bedrooms": 4,
  "bathrooms": 3,
  "area": 200,
  "images": [],
  "status": "available"
}
```

### Update property

```
PUT /api/properties/:id
```

Send whatever fields you want to update. Doesn't have to be all of them.

### Delete property

```
DELETE /api/properties/:id
```

Removes the property. Can't undo this.

Built by **Wissem Jderi**
