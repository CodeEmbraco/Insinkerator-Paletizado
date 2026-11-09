// Cantidades de la orden según el servicio de órdenes de SAP.
// qtdpl = cantidad planeada, qtdpr = cantidad ya apuntada (notificada).
// El servicio solo devuelve órdenes con cantidad pendiente: si una orden ya
// no aparece, se llegó a la cantidad esperada.

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
};

// Piezas que la orden todavía admite (planeado - apuntado). null si la orden
// no trae cantidades (p. ej. orden sincronizada desde un pallet de logs).
export const getOrderRemaining = (order) => {
  const planned = toNumber(order?.qtdpl);
  if (planned === null) return null;
  const produced = toNumber(order?.qtdpr) ?? 0;
  return Math.max(planned - produced, 0);
};

// Número de orden sin ceros a la izquierda para comparar el "order" guardado
// en un pallet con el "aufnr" del servicio de órdenes.
export const normalizeOrderNumber = (value) =>
  String(value ?? "").trim().replace(/^0+/, "");

// Busca en el listado de órdenes abiertas la orden de un pallet.
export const findOpenOrder = (openOrders, orderNumber) => {
  const wanted = normalizeOrderNumber(orderNumber);
  if (!wanted) return undefined;
  return (openOrders ?? []).find(
    (order) => normalizeOrderNumber(order?.aufnr ?? order?.id) === wanted
  );
};
