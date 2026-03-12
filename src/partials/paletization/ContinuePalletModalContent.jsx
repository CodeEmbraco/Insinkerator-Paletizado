import React from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  selectLogs,
  selectLogsLoading,
  setPallet,
  getAllComponents,
  getLogsByUrl,
} from "../../store/slice/palletsSlice";
import {
  setOrderSelected,
  getMetadataFromOrder,
} from "../../store/slice/orderSelectedSlice";
import { ArrowLeft, ArrowRight } from "iconsax-react";

function formatTimestampToDDMMYYYYHHMMSS(timestamp) {
  const date = new Date(timestamp);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function ContinuePalletModalContent({ onClose }) {
  const dispatch = useDispatch();
  const logsData = useSelector(selectLogs);
  const logsLoading = useSelector(selectLogsLoading);

  const normalizedLogs = (() => {
    if (!logsData) return null;
    // Caso principal: respuesta paginada del backend
    if (logsData.results && Array.isArray(logsData.results.pallets)) {
      return {
        pallets: logsData.results.pallets,
        total_count:
          typeof logsData.count === "number"
            ? logsData.count
            : logsData.results.pallets.length,
        next: logsData.next ?? null,
        previous: logsData.previous ?? null,
      };
    }
    // Respuesta sin results, pero con pallets
    if (Array.isArray(logsData.pallets)) {
      return {
        pallets: logsData.pallets,
        total_count:
          typeof logsData.total_count === "number"
            ? logsData.total_count
            : logsData.pallets.length,
        next: logsData.next ?? null,
        previous: logsData.previous ?? null,
      };
    }
    // Arreglo plano de pallets
    if (Array.isArray(logsData)) {
      return {
        pallets: logsData,
        total_count: logsData.length,
        next: null,
        previous: null,
      };
    }
    return null;
  })();

  const handlePrevClick = () => {
    if (!normalizedLogs || !normalizedLogs.previous) return;
    dispatch(getLogsByUrl(normalizedLogs.previous));
  };

  const handleNextClick = () => {
    if (!normalizedLogs || !normalizedLogs.next) return;
    dispatch(getLogsByUrl(normalizedLogs.next));
  };

  if (logsLoading && !normalizedLogs) {
    return (
      <div className="flex items-center justify-center py-6 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
          <span>Cargando logs de pallets...</span>
        </div>
      </div>
    );
  }

  if (!normalizedLogs) {
    return (
      <div className="text-sm text-slate-500">
        Cargando logs de pallets...
      </div>
    );
  }

  if (normalizedLogs.pallets.length === 0) {
    return (
      <div className="text-sm text-slate-500">
        No hay pallets previos para continuar.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {logsLoading && (
        <div className="flex items-center justify-center py-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
            <span>Actualizando lista de pallets...</span>
          </div>
        </div>
      )}
      <p className="text-left font-semibold text-slate-800 mb-4">
        Da click en un pallet para continuar.
      </p>
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">
              Pallet
            </th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">
              Orden
            </th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">
              Producto
            </th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">
              Cantidad
            </th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">
              Fecha creación
            </th>
            <th className="px-3 py-2 text-center font-semibold text-slate-700">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {normalizedLogs.pallets.map((row) => {
            const pallet = row.pallet;
            const mountedCount =
              typeof row.mounted_components_count === "number"
                ? row.mounted_components_count
                : pallet.quantity;
            const createdAt = pallet.datetime_created
              ? formatTimestampToDDMMYYYYHHMMSS(pallet.datetime_created)
              : "-";
            const estado = pallet.is_closed
              ? "Cerrado"
              : pallet.sap_success
              ? "Notificado SAP"
              : "Abierto";

            return (
              <tr
                key={pallet.id}
                className="hover:bg-slate-100 cursor-pointer"
                onClick={() => {
                  dispatch(setPallet(pallet));
                  // Sincronizar orden y producto seleccionados con el pallet de logs
                  if (pallet.order && pallet.product) {
                    dispatch(
                      setOrderSelected({
                        aufnr: pallet.order,
                        matnr: pallet.product,
                      })
                    );
                    //dispatch(getMetadataFromOrder(pallet.product));
                  }
                  dispatch(getAllComponents(pallet.identifier));
                  if (onClose) {
                    onClose();
                  }
                }}
              >
                <td className="px-3 py-2 text-primary underline font-semibold">{pallet.identifier}</td>
                <td className="px-3 py-2 text-slate-800">{pallet.order}</td>
                <td className="px-3 py-2 text-slate-800">{pallet.product}</td>
                <td className="px-3 py-2 text-slate-800">{mountedCount}</td>
                <td className="px-3 py-2 text-slate-800">{createdAt}</td>
                {/* Renderizar badge de acuerdo al estado*/}
                <td className="px-3 py-2 text-slate-800">
                  {estado === "Cerrado" ? (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md">Cerrado</span>
                  ) : estado === "Notificado SAP" ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md">Notificado SAP</span>
                  ) : (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">Abierto</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <div>
          Total registros: {normalizedLogs.total_count}
        </div>
        <nav
          className="flex items-center"
          role="navigation"
          aria-label="Paginación de pallets"
        >
          <div className="mr-2">
            <button
              onClick={handlePrevClick}
              disabled={!normalizedLogs.previous}
            >
              {!normalizedLogs.previous ? (
                <a className="btn bg-white border-slate-200 text-slate-300 cursor-not-allowed">
                  <ArrowLeft size={20} color="#CBD5E1" />
                  <span className="hidden sm:inline">&nbsp;Previo</span>
                </a>
              ) : (
                <a className="btn bg-white border-slate-200 hover:border-slate-300 text-black">
                  <ArrowLeft size={20} />
                  <span className="hidden sm:inline">&nbsp;Previo</span>
                </a>
              )}
            </button>
          </div>
          <div className="text-right ml-2">
            <button
              onClick={handleNextClick}
              disabled={!normalizedLogs.next}
            >
              {!normalizedLogs.next ? (
                <a className="btn bg-white border-slate-200 text-slate-300 cursor-not-allowed">
                  <span className="hidden sm:inline">Siguiente&nbsp;</span>
                  <ArrowRight size={20} color="#CBD5E1" />
                </a>
              ) : (
                <a className="btn bg-white border-slate-200 hover:border-slate-300 text-black">
                  <span className="hidden sm:inline">Siguiente&nbsp;</span>
                  <ArrowRight size={20} />
                </a>
              )}
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default ContinuePalletModalContent;

