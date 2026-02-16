import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      const createdUser = await orchestrator.createUser({
        username: "MesmoCase",
      });

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/MesmoCase",
      );

      expect(response2.status).toBe(200);

      const reponse2Body = await response2.json();

      expect(reponse2Body).toEqual({
        id: reponse2Body.id,
        username: "MesmoCase",
        email: createdUser.email,
        password: reponse2Body.password,
        created_at: reponse2Body.created_at,
        updated_at: reponse2Body.updated_at,
      });

      expect(uuidVersion(reponse2Body.id)).toBe(4);
      expect(Date.parse(reponse2Body.created_at)).not.toBeNaN();
      expect(Date.parse(reponse2Body.updated_at)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      const createdUser = await orchestrator.createUser({
        username: "CaseDiferente",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/casediferente",
      );

      expect(response.status).toBe(200);

      const response2Body = await response.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "CaseDiferente",
        email: createdUser.email,
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
    });

    test("With nonexistant username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
      );

      expect(response.status).toBe(404);

      const reponseBody = await response.json();

      expect(reponseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username foi digitado corretamente",
        status_code: 404,
      });
    });
  });
});
