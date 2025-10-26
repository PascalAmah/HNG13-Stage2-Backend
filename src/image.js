const { createCanvas } = require("canvas");
const fs = require("fs").promises;
const path = require("path");

async function generateSummaryImage(
  totalCountries,
  topCountries,
  lastRefreshedAt
) {
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = "#000000";
  ctx.font = "bold 24px Arial";
  ctx.fillText(`World Countries Summary (${totalCountries} countries)`, 50, 50);

  // Last refreshed
  ctx.font = "16px Arial";
  ctx.fillText(`Last Refreshed: ${lastRefreshedAt}`, 50, 80);

  // Top countries
  ctx.font = "bold 20px Arial";
  ctx.fillText("Top 5 Countries by Estimated GDP", 50, 120);

  ctx.font = "16px Arial";
  topCountries.forEach((country, index) => {
    const y = 160 + index * 40;
    const gdp = country.estimated_gdp
      ? Number(country.estimated_gdp).toFixed(2)
      : "0.00";
    ctx.fillText(`${index + 1}. ${country.name}: $${gdp}`, 50, y);
  });

  // Use writable directory on Leapcell
  const imagePath = path.join("/tmp", "summary.png");

  // Save image safely
  const buffer = canvas.toBuffer("image/png");
  await fs.writeFile(imagePath, buffer);

  console.log(`✅ Summary image saved at: ${imagePath}`);
  return imagePath;
}

module.exports = { generateSummaryImage };
