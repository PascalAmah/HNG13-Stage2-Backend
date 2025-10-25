const request = require("supertest");
const app = require("../src/index");
const { getConnection, initializeDatabase } = require("../src/db");

describe("Country Currency & Exchange API", () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  it("GET / should return health check", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "HNG13 Stage 2 Backend API is running!",
    });
  });

  it("POST /countries/refresh should fetch and cache data", async () => {
    const res = await request(app).post("/countries/refresh");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Data refreshed successfully");
    expect(res.body.last_refreshed_at).toMatch(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
    );
  });

  it("GET /countries should return countries", async () => {
    const res = await request(app).get("/countries?region=Africa");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty("name");
      expect(res.body[0]).toHaveProperty("currency_code");
    }
  });

  it("GET /countries/:name should return 404 for non-existent country", async () => {
    const res = await request(app).get("/countries/NonExistentCountry");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Country not found" });
  });

  it("GET /status should return status", async () => {
    const res = await request(app).get("/status");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("total_countries");
    expect(res.body).toHaveProperty("last_refreshed_at");
  });

  it("GET /countries/image should return 404 if no image", async () => {
    const res = await request(app).get("/countries/image");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Summary image not found" });
  });
});
