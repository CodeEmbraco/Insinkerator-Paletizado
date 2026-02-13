import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  getOpenOrdersList,
  selectOpenOrdersList,
} from "../../store/slice/ordersSlice";

import {
  getLogs,
  selectComponents,
  selectLogs,
  selectPallet,
} from "../../store/slice/palletsSlice";
import LogsItem from "./LogsTableItem";
import {
  ArrowCircleRight,
  ArrowLeft,
  ArrowRight,
  ArrowRight2,
} from "iconsax-react";
import DropdownFilter from "../../components/DropdownFilter";
function LogsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pallets, setPallets] = useState([]);
  const [count, setCount] = useState(0)

  useEffect(() => {
    fetchPallets("&workstation=MX8ST010");
  }, [currentPage]);

  const fetchPallets = async (queryParams) => {
    try {
      const response = await fetch(
        `http://10.13.225.20:8002/api/v1/paletization/logs/?page=${currentPage}&page_size=10${queryParams}`
      );
      const data = await response.json();
      setPallets(data.results.pallets);
      setCount(data.count);
      setTotalPages(Math.ceil(data.count / 10)); // Assuming 10 pallets per page
    } catch (error) {
      console.error("Error fetching pallets:", error);
    }
  };

  const handlePrevClick = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const applyFilter = (sapSuccess) => {
    // Actualizar la página actual a la primera página al aplicar el filtro
    setCurrentPage(1);
    // Hacer la solicitud a la API con los parámetros de filtro
    if(sapSuccess === "none" || sapSuccess === "all") {
      fetchPallets(`&workstation=MX8ST010`);
    } else {
      fetchPallets(`&workstation=MX8ST010&sap_success=${sapSuccess}`);
    }
  };
  const orders = [
    {
      id: "0",
      name: "102343261",
      email: "515380138",
      location: "UM2U3115U",
      orders: "363",
      lastOrder: "351",
      spent: "2023-06-14",
      refunds: "-",
      fav: true,
    },
    {
      id: "1",
      name: "102349877",
      email: "513301867..ZP",
      location: "EM3Y60HLP",
      orders: "500",
      lastOrder: "0",
      spent: "2023-06-07",
      refunds: "4",
      fav: false,
    },
    {
      id: "2",
      name: "102355400",
      email: "113341219",
      location: "---",
      orders: "44200",
      lastOrder: "7688",
      spent: "2023-06-20",
      refunds: "1",
      fav: true,
    },
  ];

  const [selectAll, setSelectAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);

  const dispatch = useDispatch();
  const openOrdersList = useSelector(selectOpenOrdersList);
  const [list, setList] = useState(useSelector(selectOpenOrdersList));

  const palletSelected = useSelector(selectPallet);

  const componentsList = useSelector(selectComponents);

  const logs = useSelector(selectLogs);

  useEffect(() => {
    setList(componentsList);
  }, []);

  useEffect(() => {
    setList(openOrdersList);
  }, [openOrdersList]);

  useEffect(() => {
    dispatch(getLogs());

    setPallets(logs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-whiterounded-sm relative w-full">
      <header className="px-5 py-4 flex justify-between sticky top-0 bg-white z-10">
        <h2 className="text-left font-semibold text-slate-800">
          Resultados:{" "}
          <span className="text-slate-400 font-medium">
            {count}
          </span>
        </h2>
        <nav
          className="flex justify-between"
          role="navigation"
          aria-label="Navigation"
        >
          <DropdownFilter applyFilter={applyFilter} />
          <div className="mr-2 ml-4">
            <button onClick={handlePrevClick} disabled={currentPage === 1}>
              {currentPage === 1 ? (
                <a className="btn bg-white border-slate-200 text-slate-300 cursor-not-allowed">
                  <ArrowLeft size={20} color="#CBD5E1" />
                  <span className="hidden sm:inline">&nbsp;Previo</span>
                </a>
              ) : (
                <a className="btn bg-white border-slate-200 hover:border-slate-300 text-black">
                  <ArrowLeft size={20} />{" "}
                  <span className="hidden sm:inline">&nbsp;Previo</span>
                </a>
              )}
            </button>
          </div>

          <div className="text-right ml-2">
            <button
              onClick={handleNextClick}
              disabled={currentPage === totalPages}
            >
              {currentPage === totalPages ? (
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
      </header>
      <div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-slate-500 bg-slate-50 border-t border-b border-slate-200">
              <tr>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <span className="sr-only">Menu</span>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">ID</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold">Lote</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-center">Producto</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-center">Órden</div>
                </th>
                {/* <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">
                    Código de mat. (Compresor)
                  </div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">
                    Serial (Compresor)
                  </div>
                </th> */}
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-center">Cantidad esperada</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-center">Cantidad montada</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-center">
                    Fecha de creación
                  </div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">SAP Status</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-center">Acciones</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-slate-200">
              {Object.keys(pallets).length > 0 && pallets.length > 0
                ? pallets.map((element, index) => {
                    const rowNumber = index + 1;
                    return (
                      <LogsItem
                        fetchPallets={fetchPallets}
                        key={element.pallet.id}
                        rowNumber={rowNumber}
                        id={element.pallet.id}
                        product={element.pallet.product}
                        order={element.pallet.order}
                        identifier={element.pallet.identifier}
                        quantity={element.pallet.quantity}
                        mounted_components_count={element.mounted_components_count}
                        mounted_components={element.mounted_components}
                        datetimeCreated={element.pallet.datetime_created}
                        sendToSAP={element.pallet.send_to_sap}
                        sapStatus={element.pallet.sap_status}
                        sapSuccess={element.pallet.sap_success}
                      />
                    );
                  })
                : ""}
            </tbody>
          </table>
          <div></div>
        </div>
      </div>
    </div>
  );
}

export default LogsTable;
