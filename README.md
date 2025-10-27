# 🚀 HNG13 Backend Wizards Stage 2 - Country Currency & Exchange API

**Submission by Pascal Amaliri** ([pascalamaliri@gmail.com](mailto:pascalamaliri@gmail.com))

## 🎯 Overview

A RESTful API built with Node.js and Express that fetches country data and exchange rates, stores them in a MySQL database, and provides CRUD operations with dynamic image generation for country summaries. Deployed on Leapcell, this API meets all requirements for the HNG13 Stage 2 task, including error handling, filtering, and image generation.

## 🛠️ Features

- **POST /countries/refresh**: Fetches country data from `restcountries.com` and exchange rates from `open.er-api.com`, stores in MySQL, and generates a summary image.
- **GET /countries**: Lists countries with optional filters (`region`, `currency_code`, `sort=gdp_desc`).
- **GET /countries/:name**: Retrieves a single country by name.
- **DELETE /countries/:name**: Deletes a country by name.
- **GET /status**: Returns total number of countries and last refresh timestamp.
- **GET /countries/image**: Serves a PNG summary image (`cache/summary.png`) showing total countries, top 5 GDPs, and last refresh timestamp.
- **Error Handling**: Returns appropriate HTTP status codes (400, 404, 500, 503) with descriptive JSON responses.
- **Database**: MySQL with `upsert` logic for efficient data updates.
- **Image Generation**: Uses `canvas` to create a summary image with dynamic data.

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/pascalamah/hng13-stage2-backend.git
cd hng13-stage2-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up MySQL Database

1. Create a database named `hng_stage2`.
2. Configure environment variables (see below).

### 4. Initialize Database

```bash
npm run db:init
```

### 5. Run the Server

```bash
npm start
```

### 6. Test Endpoints

```bash
curl http://localhost:3000/countries
```

## 📋 Environment Variables

Create a `.env` file in the root directory with the following:

```env
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=hng_stage2
PORT=3000
NODE_ENV=production
```

> **Note:** For Leapcell deployment, set `PORT=8080` in the platform’s environment variables.

## 📦 Dependencies

- **express**: Web framework for handling HTTP requests.
- **axios**: HTTP client for fetching external API data.
- **mysql2**: MySQL driver for database operations.
- **dotenv**: Loads environment variables from `.env`.
- **canvas**: Generates summary images with country data.

Install dependencies:

```bash
npm install
```

## 📋 API Documentation

### POST /countries/refresh

Fetches and caches country data and exchange rates, generates a summary image.

**Response (200 OK):**

```json
{
  "message": "Data refreshed successfully",
  "last_refreshed_at": "2025-10-26 19:12:00"
}
```

**Error (503 Service Unavailable):**

```json
{
  "error": "External data source unavailable",
  "details": "Could not fetch data from https://restcountries.com",
  "api": "https://restcountries.com/v2/all"
}
```

### GET /countries

Lists countries with optional filters.

**Query Parameters:**

- `region`: Filter by region (e.g., Africa)
- `currency`: Filter by currency code (e.g., NGN)
- `sort=gdp_desc`: Sort by estimated GDP in descending order

**Example:**

```bash
GET /countries?region=Africa&sort=gdp_desc
```

**Response:**

```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-26 19:12:00"
  }
]
```

### GET /countries/:name

Retrieves a single country by name.

**Example:**

```bash
GET /countries/Nigeria
```

**Response:**

```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139589,
  "currency_code": "NGN",
  "exchange_rate": 1600.23,
  "estimated_gdp": 25767448125.2,
  "flag_url": "https://flagcdn.com/ng.svg",
  "last_refreshed_at": "2025-10-26 19:12:00"
}
```

**Error (404 Not Found):**

```json
{ "error": "Country not found" }
```

### DELETE /countries/:name

Deletes a country by name.

**Example:**

```bash
DELETE /countries/Nigeria
```

**Response (200 OK):**

```json
{ "message": "Country deleted successfully" }
```

**Error (404 Not Found):**

```json
{ "error": "Country not found" }
```

### GET /status

Returns the total number of countries and last refresh timestamp.

**Response:**

```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-26 19:12:00"
}
```

### GET /summary/image

Serves a PNG image summarizing total countries, top 5 GDPs, and last refresh timestamp.

**Response**: PNG image

**Error (404 Not Found)**:

```json
{ "error": "Summary image not found" }
```

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Manual Testing (use Postman or curl)

```bash
curl --max-time 120 -X POST https://13-tage2-ackend-pascalamaliri419-2u6siwpo.leapcell.dev/countries/refresh
curl https://13-tage2-ackend-pascalamaliri419-2u6siwpo.leapcell.dev/countries?region=Africa
curl https://13-tage2-ackend-pascalamaliri419-2u6siwpo.leapcell.dev/countries/Nigeria
curl https://13-tage2-ackend-pascalamaliri419-2u6siwpo.leapcell.dev/countries/image > summary.png
```

## 🌐 Deployment

- **Platform:** Leapcell
- **Live URL:** [https://13-tage2-ackend-pascalamaliri419-2u6siwpo.leapcell.dev](https://13-tage2-ackend-pascalamaliri419-2u6siwpo.leapcell.dev)
- **Build Command:**

```bash
apt-get update && apt-get install -y libexpat1 libcairo2 libpango1.0-0 libjpeg-dev libpng-dev libgif-dev && npm install
```

- **Start Command:** `npm start`

## 📝 Submission Details

- **Name:** Pascal Amaliri
- **Email:** [pascalamaliri@gmail.com](mailto:pascalamaliri@gmail.com)
- **Stack:** Node.js/Express
- **GitHub:** [https://github.com/pascalamah/hng13-stage2-backend](https://github.com/pascalamah/hng13-stage2-backend)
- **API Base URL:** [https://13-tage2-ackend-pascalamaliri419-2u6siwpo.leapcell.dev](https://13-tage2-ackend-pascalamaliri419-2u6siwpo.leapcell.dev)

# Initialize DB (if needed)

curl https://13-tage2-ackend-pascalamaliri419-2u6siwpo.leapcell.dev/init-db

# Expected: {"message": "✅ Database initialized successfully!"}

# Populate DB

curl -X POST https://13-tage2-ackend-pascalamaliri419-2u6siwpo.leapcell.dev/countries/refresh

# Expected: {"message": "Data refreshed successfully", "last_refreshed_at": "2025-10-26 18:36:00"}

# List countries

curl https://13-tage2-ackend-pascalamaliri419-2u6siwpo.leapcell.dev/countries?region=Africa

# Expected: [{"id": 1, "name": "Nigeria", ...}]

# Single country

curl https://13-tage2-ackend-pascalamaliri419-2u6siwpo.leapcell.dev/countries/Nigeria

# Expected: {"id": 1, "name": "Nigeria", ...} or {"error": "Country not found"}

# Delete country

curl -X DELETE https://13-tage2-ackend-pascalamaliri419-2u6siwpo.leapcell.dev/countries/Nigeria

# Expected: {"message": "Country deleted successfully"} or {"error": "Country not found"}

# Status

curl https://13-tage2-ackend-pascalamaliri419-2u6siwpo.leapcell.dev/status

# Expected: {"total_countries": 250, "last_refreshed_at": "..."}

# Image

curl https://13-tage2-ackend-pascalamaliri419-2u6siwpo.leapcell.dev/countries/image > summary.png

# Expected: Downloadable PNG
