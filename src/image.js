const { createCanvas } = require("canvas");
const fs = require("fs").promises;
const path = require("path");

async function generateSummaryImage(totalCountries, topCountries, lastRefreshedAt) {
  const width = 600;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = "#333";
  ctx.font = "bold 24px Arial";
  ctx.fillText("Country Data Summary", 20, 40);

  // Total Countries
  ctx.font = "18px Arial";
  ctx.fillText(`Total Countries: ${totalCountries}`, 20, 80);

  // Top 5 by GDP
  ctx.fillText("Top 5 Countries by Estimated GDP:", 20, 120);
  topCountries.forEach((country, index) => {
    ctx.fillText(
      `${index + 1}. ${country.name}: $${country.estimated_gdp.toFixed(2)}`,
      20,
      160 + index * 30
    );
  });

  // Timestamp
  ctx.fillText(`Last Refreshed: ${lastRefreshedAt}`, 20, 340);

  // Save image
  const buffer = canvas.toBuffer("image/png");
  await fs.mkdir(path.join(__dirname, "../cache"), { recursive: true });
  await fs.writeFile(path.join(__dirname, "../cache/summary.png"), buffer);
}

module.exports = { generateSummaryImage };
