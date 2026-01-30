import database from "infra/database.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await database.query("drop schema public cascade; create schema public;");
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Running pending migrations", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations");
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);
      expect(responseBody.length).toBeGreaterThan(0);

      const queryMigrations = await database.query(
        "select count(*) from pgmigrations",
      );
      const qtdMigrations = parseInt(queryMigrations.rows[0].count, 10);
      // Não deve haver migrações executadas, já que o GET roda um dry run
      expect(qtdMigrations).toBe(0);
    });
  });
});
