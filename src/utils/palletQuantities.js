// Cantidad de piezas por pallet según el producto.
// La clave es el código de producto = últimos 6 caracteres del `matnr`
// (ej. matnr "...5180758B" -> "80758B"). Estos 6 caracteres distinguen
// productos que comparten prefijo (p. ej. 80758A vs 80758B).
//
// Para agregar un producto nuevo: añade su código de 6 caracteres y su cantidad.

export const DEFAULT_PALLET_QUANTITY = 280;

export const PALLET_QUANTITY_BY_PRODUCT = {
  "80758A": 280,
  "79611H": 252,
  "80758B": 280,
};

// Devuelve la cantidad por pallet para un matnr dado.
// Si el producto no está en la tabla, regresa el valor por defecto.
export const getPalletQuantityForProduct = (matnr) => {
  if (!matnr) return DEFAULT_PALLET_QUANTITY;
  const productCode = matnr.slice(-6);
  return PALLET_QUANTITY_BY_PRODUCT[productCode] ?? DEFAULT_PALLET_QUANTITY;
};
