import { createRouter } from "next-connect";
import database from "infra/database.js";
import controller from "infra/controller.js";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const updatedAt = new Date().toISOString();

  const databaseVersionQuery = await database.query("SHOW server_version;");
  const databaseVersion = databaseVersionQuery.rows[0].server_version;

  const databaseMaximumConnectionsQuery = await database.query(
    "SHOW max_connections;",
  );
  const databaseMaximumConnections =
    databaseMaximumConnectionsQuery.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseActualConnectionsQuery = await database.query({
    text: `
        SELECT count(*)::int AS qtd_conexoes
        FROM pg_stat_activity
        WHERE datname = $1;  
      `,
    values: [databaseName],
  });

  const databaseOpenedConnections =
    databaseActualConnectionsQuery.rows[0].qtd_conexoes;

  return response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersion,
        max_connections: parseInt(databaseMaximumConnections),
        opened_connections: databaseOpenedConnections,
      },
    },
  });
}
