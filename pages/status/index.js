import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>

      <DatabaseInfo />

      <hr />
      <UpdatedAt />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }

  return <div>Última atualização: {updatedAtText}</div>;
}

function DatabaseInfo() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let postgresVersion = "Carregando...";
  let openedConnections = "Carregando...";
  let maxConnections = "Carregando...";

  if (!isLoading && data) {
    const databaseData = data.dependencies.database;

    postgresVersion = databaseData.version;
    openedConnections = databaseData.opened_connections;
    maxConnections = databaseData.max_connections;
  }

  return (
    <div>
      <h3>Banco de dados</h3>
      <p>Versão do PostgreSQL: {postgresVersion}</p>
      <p>
        Conexões abertas/máximas: {openedConnections}/{maxConnections}
      </p>
    </div>
  );
}
