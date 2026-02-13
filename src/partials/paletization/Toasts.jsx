import { toast } from 'react-hot-toast';

// Toast de éxito
export const notifyPalletScanned = (code) => toast.success('Pallet escaneado: ' + code);

export const notifyOrderSelected = (number) => toast.success(`Órden ${number} seleccionada`);

export const notifyProductScanned = (code) => toast.success('Compresor escaneado: ' + code, { style: {} });

export const notifyCondenserScanned = (code) => toast.success('Condensador escaneado: ' + code, { style: {} });

export const notifyProductMounted = (code) => toast.success('Producto montado: ' + code, { style: {} });

export const notifyProductAlreadyMounted = () => toast.error('Este producto ya se encuentra montado en otro lote');

export const notifyProductsJoined= (code) => toast.success('Unión exitosa: ' + code, { style: {} });

export const notifyGenealogyNotFound = (code) => toast.error('Genealogía no encontrada: ' + code);

export const notifyProductUnmounted = (code) => toast.success('Producto desmontado: ' + code, { style: {} , icon: 'ℹ️' });

export const notifySuccesInSAP = (lote, mensaje) => toast.success(`Lote ${lote} procesado exitosamente en SAP - Mensaje ${mensaje}`, { style: {}, duration: 10000 });

export const notifyErrorInSAP = (lote, error) => toast.error(`Error al procesar el lote ${lote} en SAP: ${error}`, { style: {}, duration: 9000 });


// Toast de error
export const notifyError = (message) => toast.error(message);

// Otros toasts personalizados
// ...

// Puedes definir tantos toasts personalizados como necesites