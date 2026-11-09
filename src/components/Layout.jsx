import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import icons from "../assets/icons/icons";
import Header from "../partials/Header";
import ModalBasic from "./ModalBasic";
import OrdersTable from "../partials/orders/OrdersTable";
import ContinuePalletModalContent from "../partials/paletization/ContinuePalletModalContent";
import { getLogs } from "../store/slice/palletsSlice";
import { getOpenOrdersList } from "../store/slice/ordersSlice";

// Evento global para abrir el listado de órdenes desde cualquier pantalla
// (p. ej. Paletización lo dispara al iniciar un pallet nuevo).
export const OPEN_ORDERS_EVENT = "open-orders-modal";
// Se difiere un tick: si lo dispara un clic (botón Nuevo), ese mismo clic
// llegaría al documento después de abrir el modal y lo cerraría.
export const requestOpenOrders = () =>
  setTimeout(() => document.dispatchEvent(new CustomEvent(OPEN_ORDERS_EVENT)), 0);

function Layout({ icon, nameRoute, nameSubRoute, children }) {
  const dispatch = useDispatch();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [basicModalOpen, setBasicModalOpen] = useState(false);
  const [continuePalletModalOpen, setContinuePalletModalOpen] =
    useState(false);

  useEffect(() => {
    const handler = () => {
      dispatch(getOpenOrdersList());
      setBasicModalOpen(true);
    };
    document.addEventListener(OPEN_ORDERS_EVENT, handler);
    return () => document.removeEventListener(OPEN_ORDERS_EVENT, handler);
  }, []);

  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelectedItems = (selectedItems) => {
    setSelectedItems([...selectedItems]);
  };

  const handleOpenContinuePalletModal = () => {
    dispatch(getLogs());
    // Listado fresco de órdenes: el modal solo ofrece pallets de órdenes abiertas
    dispatch(getOpenOrdersList());
    setContinuePalletModalOpen(true);
  };

  return (
    <div>
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        icon={icon}
        nameRoute={nameRoute}
        nameSubRoute={nameSubRoute}
        basicModalOpen={basicModalOpen}
        setBasicModalOpen={setBasicModalOpen}
        onOpenContinuePallet={handleOpenContinuePalletModal}
      />
      <main className="h-screen bg-white">
        <ModalBasic
          id="basic-modal"
          modalOpen={basicModalOpen}
          setModalOpen={setBasicModalOpen}
          title="Órdenes"
        >
          {/* Modal content */}
          <div className="px-5 pt-4 pb-1">
            <div className="text-sm">
              <OrdersTable selectedItems={handleSelectedItems} />
            </div>
          </div>
          {/* Modal footer */}
          <div className="px-5 py-4">
            <div className="flex flex-wrap justify-end space-x-2">
              <button
                className="btn-sm border-slate-200 hover:border-slate-300 text-slate-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setBasicModalOpen(false);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </ModalBasic>

        <ModalBasic
          id="continue-pallet-modal"
          modalOpen={continuePalletModalOpen}
          setModalOpen={setContinuePalletModalOpen}
          title="Continuar pallet"
        >
          <div className="px-5 pt-4 pb-1 text-sm">
            <ContinuePalletModalContent
              onClose={() => setContinuePalletModalOpen(false)}
            />
          </div>
        </ModalBasic>

        {children}
      </main>
    </div>
  );
}

export default Layout;