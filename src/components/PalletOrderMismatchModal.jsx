import { useEffect } from "react";

// Rechazo a pantalla completa: el pallet escaneado ya existe en BD ligado a
// otra orden de producción. Mismo estilo que los modales de discrepancia.
// onChangeOrder (opcional): ofrece reasignar el pallet a la orden seleccionada
// (la pantalla pide contraseña de administrador antes de hacerlo).
function PalletOrderMismatchModal({ open, onClose, pallet, palletOrder, selectedOrder, onChangeOrder }) {
  useEffect(() => {
    if (!open) return;
    const keyHandler = (e) => {
      if (e.key === "Enter" || e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: "rgba(185, 28, 28, 0.97)" }}
      role="alertdialog"
      aria-modal="true"
    >
      <div className="text-center text-white px-8 w-full max-w-5xl">
        <div className="flex justify-center mb-6">
          <svg
            width="160"
            height="160"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h1
          className="font-black uppercase tracking-wider mb-4"
          style={{ fontSize: "72px", lineHeight: 1, color: "white" }}
        >
          Pallet de otra orden
        </h1>

        <p
          className="font-semibold mb-4"
          style={{ fontSize: "28px", color: "white" }}
        >
          El pallet <span className="font-mono">{pallet || "—"}</span> ya fue iniciado con otra orden de producción.
          <br />
          No es posible continuar.
        </p>
        <p
          className="font-bold mb-8 mx-auto max-w-4xl"
          style={{ fontSize: "22px", color: "#fde68a" }}
        >
          Usa otro pallet, selecciona la orden a la que pertenece, o reasígnalo con autorización.
        </p>

        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="border-4 border-white rounded-lg p-6 bg-red-800">
            <p
              className="uppercase font-bold mb-3"
              style={{ fontSize: "18px", color: "#fecaca" }}
            >
              Orden del pallet
            </p>
            <p
              className="font-mono font-black break-all"
              style={{ fontSize: "48px", color: "white" }}
            >
              {palletOrder || "—"}
            </p>
          </div>

          <div className="border-4 border-yellow-300 rounded-lg p-6 bg-red-900">
            <p
              className="uppercase font-bold mb-3"
              style={{ fontSize: "18px", color: "#fde68a" }}
            >
              Orden seleccionada
            </p>
            <p
              className="font-mono font-black break-all"
              style={{ fontSize: "48px", color: "white" }}
            >
              {selectedOrder || "—"}
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-6 flex-wrap">
          <button
            onClick={onClose}
            className="px-12 py-5 bg-white text-red-700 font-black uppercase rounded-lg hover:bg-red-50 shadow-2xl"
            style={{ fontSize: "32px", letterSpacing: "2px" }}
            autoFocus
          >
            Entendido
          </button>
          {onChangeOrder && (
            <button
              onClick={onChangeOrder}
              className="px-10 py-5 border-4 border-yellow-300 text-yellow-200 font-black uppercase rounded-lg hover:bg-red-800 shadow-2xl"
              style={{ fontSize: "22px", letterSpacing: "1px" }}
            >
              Cambiar a la orden {selectedOrder}
              <span className="block text-sm font-semibold normal-case tracking-normal mt-1">requiere contraseña de administrador</span>
            </button>
          )}
        </div>

        <p
          className="mt-6 opacity-80"
          style={{ fontSize: "14px", color: "white" }}
        >
          Presiona Enter o Esc para cerrar
        </p>
      </div>
    </div>
  );
}

export default PalletOrderMismatchModal;
