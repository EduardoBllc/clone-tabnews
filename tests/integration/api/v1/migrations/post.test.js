import database from "infra/database";

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

beforeAll(cleanDatabase);

test("POST to /api/v1/migrations should execute pending migrations", async () => {
  const endpointUrl = "http://localhost:3000/api/v1/migrations";

  const response1 = await fetch(endpointUrl, {
    method: "POST",
  });
  expect(response1.status).toBe(201);

  const response1Body = await response1.json();

  expect(Array.isArray(response1Body)).toBe(true);
  expect(response1Body.length).toBeGreaterThan(0);

  const response2 = await fetch(endpointUrl, {
    method: "POST",
  });
  expect(response2.status).toBe(200);

  const response2Body = await response2.json();

  expect(Array.isArray(response2Body)).toBe(true);
  expect(response2Body.length).toBe(0);
});

test("Not allowed methods should return 405", async () => {
  const endpointUrl = "http://localhost:3000/api/v1/migrations";

  const notAllowedMethods = ["PATCH", "PUT", "DELETE"];

  for (const method of notAllowedMethods) {
    const response = await fetch(endpointUrl, {
      method: method,
    });
    expect(response.status).toBe(405);
  }
});
