import { useState } from 'react';
import icons from '../assets/icons/icons';
import Header from '../partials/Header';
import ModalBasic from './ModalBasic';
import OrdersTable from '../partials/orders/OrdersTable';

function Layout({ icon, nameRoute, nameSubRoute, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [basicModalOpen, setBasicModalOpen] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelectedItems = (selectedItems) => {
    setSelectedItems([...selectedItems]);
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
        />
        <main className='h-screen bg-white'>
        <ModalBasic id="basic-modal" modalOpen={basicModalOpen} setModalOpen={setBasicModalOpen} title="Órdenes">
                        {/* Modal content */}
                        <div className="px-5 pt-4 pb-1">
                          <div className="text-sm">
                            <OrdersTable selectedItems={handleSelectedItems} />
                          </div>
                        </div>
                        {/* Modal footer */}
                        <div className="px-5 py-4">
                          <div className="flex flex-wrap justify-end space-x-2">
                            <button className="btn-sm border-slate-200 hover:border-slate-300 text-slate-600" onClick={(e) => { e.stopPropagation(); setBasicModalOpen(false); }}>Cancelar</button>
                          </div>
                        </div>
                      </ModalBasic>
          {/* <div className='lg:px-8 mt-5'>{children}</div> */}
          {children}
        </main>
    </div>
  );
}

export default Layout;