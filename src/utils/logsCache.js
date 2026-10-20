// Caché en memoria de las páginas de la bitácora de logs.
// El endpoint de logs es lento (el backend recorre todos los lotes y sus
// series), así que se muestra la última respuesta conocida al instante y se
// refresca en segundo plano (stale-while-revalidate).

export const LOGS_PAGE_SIZE = 10;
export const DEFAULT_LOGS_QUERY = "&workstation=MX8ST040";

const cache = new Map();
const inFlight = new Map();

const keyFor = (page, queryParams) => `${page}|${queryParams}`;

export const getCachedLogsPage = (page, queryParams) =>
  cache.get(keyFor(page, queryParams));

// Descarga una página de logs y la guarda en caché. Las peticiones
// simultáneas a la misma página comparten la misma promesa.
export const fetchLogsPage = (page, queryParams) => {
  const key = keyFor(page, queryParams);
  if (inFlight.has(key)) return inFlight.get(key);

  const request = fetch(
    `http://10.13.225.20:8002/api/v1/paletization/logs/?page=${page}&page_size=${LOGS_PAGE_SIZE}${queryParams}`
  )
    .then((response) => response.json())
    .then((data) => {
      const entry = {
        pallets: data.results.pallets,
        count: data.count,
      };
      cache.set(key, entry);
      return entry;
    })
    .finally(() => inFlight.delete(key));

  inFlight.set(key, request);
  return request;
};

// Precarga silenciosa de la primera página (sin filtro) para que la bitácora
// abra al instante tras procesar o reprocesar un lote.
export const prefetchLogs = () => {
  fetchLogsPage(1, DEFAULT_LOGS_QUERY).catch((error) =>
    console.log("Error al precargar logs:", error)
  );
};
