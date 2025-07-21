test("GET to /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);
});

test('/api/v1/status "updated_at" value should be an ISO 8601 date string', async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  const responseBody = await response.json();

  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
  expect(responseBody.updated_at).toEqual(parsedUpdatedAt);
});

test('/api/v1/status should include valid PostgreSQL version string in "dependencies.database.version"', async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  const responseBody = await response.json();
  expect(responseBody.dependencies?.database?.version).toEqual("16.0");
});

test('/api/v1/status "dependencies.database.max_connections" should be 100', async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  const body = await response.json();
  expect(body.dependencies.database.max_connections).toEqual(100);
});

test('/api/v1/status "dependencies.database.opened_connections" should be 1', async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  const body = await response.json();
  expect(body.dependencies.database.opened_connections).toEqual(1);
});
