// Cierre de mes: SAP deja de servir órdenes temporalmente el último día del
// mes. Mientras está activo, se usa el último listado de órdenes obtenido
// (guardado aquí) en vez de consultar el endpoint en vivo.
const LOCK_KEY = "monthEndLocked";
const SNAPSHOT_KEY = "monthEndOrdersSnapshot";

export const isMonthEndLocked = () => localStorage.getItem(LOCK_KEY) === "true";

export const activateMonthEndLock = (orders) => {
  localStorage.setItem(LOCK_KEY, "true");
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(orders ?? []));
};

export const deactivateMonthEndLock = () => {
  localStorage.removeItem(LOCK_KEY);
  localStorage.removeItem(SNAPSHOT_KEY);
};

export const getMonthEndSnapshot = () => {
  try {
    return JSON.parse(localStorage.getItem(SNAPSHOT_KEY)) ?? [];
  } catch {
    return [];
  }
};
