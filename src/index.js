const express = require("express");
const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

const {
  getConnection,
  upsertCountry,
  getCountries,
  getCountryByName,
  deleteCountryByName,
  getStatus,
  initializeDatabase,
} = require("./db");
const { generateSummaryImage } = require("./image");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Root route (for health check)
app.get("/", (req, res) => {
  res.status(200).json({ message: "HNG13 Stage 2 Backend API is running!" });
});

// POST /countries/refresh
app.post("/countries/refresh", async (req, res) => {
  let connection;
  try {
    const countriesResponse = await axios.get(
      "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies",
      { timeout: 30000 }
    );
    const countries = countriesResponse.data;
   
    const ratesResponse = await axios.get(
      "https://open.er-api.com/v6/latest/USD",
      { timeout: 30000 }
    );
    const exchangeRates = ratesResponse.data.rates;

    connection = await getConnection();
   
    const lastRefreshedAt = new Date()
      .toISOString()
      .replace("T", " ")
      .replace(/\.\d{3}Z$/, "");

    for (const country of countries) {
      if (!country.name || !country.population) {
        console.warn(
          `Skipping ${country.name || "unknown"}: Missing required fields`
        );
        continue;
      }

      const currency =
        country.currencies && country.currencies.length > 0
          ? country.currencies[0].code
          : null;
      let exchangeRate = null;
      let estimatedGdp = 0;

      if (currency && exchangeRates[currency]) {
        exchangeRate = exchangeRates[currency];
        const randomMultiplier = Math.random() * (2000 - 1000) + 1000;
        estimatedGdp =
          (country.population * randomMultiplier) / exchangeRate || 0;
      }

      const countryData = {
        name: country.name,
        capital: country.capital || null,
        region: country.region || null,
        population: country.population,
        currency_code: currency,
        exchange_rate: exchangeRate,
        estimated_gdp: Number(estimatedGdp),
        flag_url: country.flag || null,
        last_refreshed_at: lastRefreshedAt,
      };

      await upsertCountry(connection, countryData);
    }

    const totalCountries = countries.length;
   
    const topCountries = await getCountries(connection, {
      sort: "gdp_desc",
      limit: 5,
    });
    await generateSummaryImage(totalCountries, topCountries, lastRefreshedAt);

    res.status(200).json({
      message: "Data refreshed successfully",
      last_refreshed_at: lastRefreshedAt,
    });
  } catch (error) {
    console.error("Refresh error:", error.message, error.stack);
    res.status(503).json({
      error: "External data source unavailable",
      details: error.message || "Unknown error",
      api: error.config?.url || "unknown API",
    });
  } finally {
    if (connection) connection.release();
  }
});

// GET /countries
app.get("/countries", async (req, res) => {
  try {
    const { region, currency, sort } = req.query;
    const filters = { region, currency_code: currency, sort };
    const connection = await getConnection();
    const countries = await getCountries(connection, filters);
    res.status(200).json(countries);
  } catch (error) {
    console.error("Get countries error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /countries/:name
app.get("/countries/:name", async (req, res) => {
  try {
    const connection = await getConnection();
    const country = await getCountryByName(connection, req.params.name);
    if (!country) {
      return res.status(404).json({ error: "Country not found" });
    }
    res.status(200).json(country);
  } catch (error) {
    console.error("Get country error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /countries/:name
app.delete("/countries/:name", async (req, res) => {
  try {
    const connection = await getConnection();
    const deleted = await deleteCountryByName(connection, req.params.name);
    if (!deleted) {
      return res.status(404).json({ error: "Country not found" });
    }
    res.status(200).json({ message: "Country deleted successfully" });
  } catch (error) {
    console.error("Delete country error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /status
app.get("/status", async (req, res) => {
  try {
    const connection = await getConnection();
    const status = await getStatus(connection);
    res.status(200).json(status);
  } catch (error) {
    console.error("Status error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /countries/image
app.get("/countries/image", async (req, res) => {
  try {
    const imagePath = path.join(__dirname, "../cache/summary.png");
    await fs.access(imagePath);
    res.setHeader("Content-Type", "image/png");
    res.sendFile(imagePath);
  } catch (error) {
    res.status(404).json({ error: "Summary image not found" });
  }
});

app.get("/init-db", async (req, res) => {
  try {
    await initializeDatabase();
    res.status(200).json({ message: "Database initialized successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to initialize database", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 HNG13 Stage 2 Backend running on port ${PORT}`);
  console.log(`📡 Base URL: http://localhost:${PORT}/countries`);
  console.log(`🔧 Init DB: http://localhost:${PORT}/init-db`);
});

module.exports = app;
