import { useState } from "react";
import { useDispatch } from "react-redux";
import icons from "../assets/icons/icons";
import Header from "../partials/Header";
import ModalBasic from "./ModalBasic";
import OrdersTable from "../partials/orders/OrdersTable";
import ContinuePalletModalContent from "../partials/paletization/ContinuePalletModalContent";
import { getLogs } from "../store/slice/palletsSlice";

function Layout({ icon, nameRoute, nameSubRoute, children }) {
  const dispatch = useDispatch();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [basicModalOpen, setBasicModalOpen] = useState(false);
  const [continuePalletModalOpen, setContinuePalletModalOpen] =
    useState(false);

  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelectedItems = (selectedItems) => {
    setSelectedItems([...selectedItems]);
  };

  const handleOpenContinuePalletModal = () => {
    dispatch(getLogs());
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