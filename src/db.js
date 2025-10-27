const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function getConnection() {
  return await pool.getConnection();
}

async function initializeDatabase() {
  const connection = await getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS countries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        capital VARCHAR(255),
        region VARCHAR(255),
        population BIGINT NOT NULL,
        currency_code VARCHAR(10),
        exchange_rate DECIMAL(15,4),
        estimated_gdp DECIMAL(20,2),
        flag_url VARCHAR(255),
        last_refreshed_at DATETIME NOT NULL,
        UNIQUE(name)
      )
    `);
    console.log("Database initialized");
  } finally {
    connection.release();
  }
}

async function upsertCountry(connection, countryData) {
  const {
    name,
    capital,
    region,
    population,
    currency_code,
    exchange_rate,
    estimated_gdp,
    flag_url,
    last_refreshed_at,
  } = countryData;
  if (!name || !population) {
    throw new Error("Validation failed: name and population are required");
  }

  await connection.query(
    `
    INSERT INTO countries (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, last_refreshed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      capital = VALUES(capital),
      region = VALUES(region),
      population = VALUES(population),
      currency_code = VALUES(currency_code),
      exchange_rate = VALUES(exchange_rate),
      estimated_gdp = VALUES(estimated_gdp),
      flag_url = VALUES(flag_url),
      last_refreshed_at = VALUES(last_refreshed_at)
    `,
    [
      name,
      capital,
      region,
      population,
      currency_code,
      exchange_rate,
      Number(estimated_gdp),
      flag_url,
      last_refreshed_at,
    ]
  );
  console.log(`Upserted country: ${name} with GDP ${estimated_gdp}`);
}

async function getCountries(
  connection,
  { region, currency_code, sort, limit } = {}
) {
  let query = "SELECT * FROM countries";
  const params = [];
  const conditions = [];

  if (region) {
    conditions.push("region = ?");
    params.push(region);
  }
  if (currency_code) {
    conditions.push("currency_code = ?");
    params.push(currency_code);
  }
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  if (sort === "gdp_desc") {
    query += " ORDER BY CAST(estimated_gdp AS DECIMAL(20,2)) DESC"; // Cast to numeric for correct sorting
  }
  if (limit) {
    query += " LIMIT ?";
    params.push(parseInt(limit));
  }

  const [rows] = await connection.query(query, params);
  console.log(`getCountries returned ${rows.length} rows`);
  return rows.map((row) => ({
    ...row,
    estimated_gdp: row.estimated_gdp ? Number(row.estimated_gdp) : 0, // Ensure number
  }));
}

async function getCountryByName(connection, name) {
  const [rows] = await connection.query(
    "SELECT * FROM countries WHERE LOWER(name) = LOWER(?)",
    [name]
  );
  return rows[0] || null;
}

async function deleteCountryByName(connection, name) {
  const [result] = await connection.query(
    "DELETE FROM countries WHERE LOWER(name) = LOWER(?)",
    [name]
  );
  return result.affectedRows > 0;
}

async function getStatus(connection) {
  const [[{ total }]] = await connection.query(
    "SELECT COUNT(*) as total FROM countries"
  );
  const [[{ last_refreshed_at }]] = await connection.query(
    "SELECT MAX(last_refreshed_at) as last_refreshed_at FROM countries"
  );
  return {
    total_countries: total,
    last_refreshed_at: last_refreshed_at || null,
  };
}

module.exports = {
  getConnection,
  initializeDatabase,
  upsertCountry,
  getCountries,
  getCountryByName,
  deleteCountryByName,
  getStatus,
};
