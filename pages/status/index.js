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

  let databaseInfo = <p>Carregando...</p>;

  if (!isLoading && data) {
    const databaseData = data.dependencies.database;
    databaseInfo = (
      <>
        <p>Versão do PostgreSQL: {databaseData.version}</p>
        <p>
          Conexões abertas/máximas: {databaseData.opened_connections}/
          {databaseData.max_connections}
        </p>
      </>
    );
  }

  return (
    <div>
      <h3>Banco de dados</h3>
      {databaseInfo}
    </div>
  );
}
