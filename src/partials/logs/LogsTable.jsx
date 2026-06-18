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
  const [isLoading, setIsLoading] = useState(false);
  // Mantener el filtro activo para que se conserve al cambiar de página
  const [filterQuery, setFilterQuery] = useState("&workstation=MX8ST040");

  useEffect(() => {
    fetchPallets(filterQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterQuery]);

  const fetchPallets = async (queryParams) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const goToPage = (page) => {
    if (isLoading) return;
    const target = Math.min(Math.max(page, 1), totalPages);
    if (target !== currentPage) {
      setCurrentPage(target);
    }
  };

  const handlePrevClick = () => goToPage(currentPage - 1);
  const handleNextClick = () => goToPage(currentPage + 1);

  // Calcula los números de página visibles con elipsis para saltar rápido
  const getPageNumbers = () => {
    const maxButtons = 5;
    if (totalPages <= maxButtons + 2) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    if (currentPage <= 3) {
      start = 2;
      end = 4;
    }
    if (currentPage >= totalPages - 2) {
      start = totalPages - 3;
      end = totalPages - 1;
    }
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const applyFilter = (sapSuccess) => {
    // Volver a la primera página al aplicar el filtro
    setCurrentPage(1);
    // Actualizar el filtro activo; el useEffect dispara el fetch
    if (sapSuccess === "none" || sapSuccess === "all") {
      setFilterQuery("&workstation=MX8ST040");
    } else {
      setFilterQuery(`&workstation=MX8ST040&sap_success=${sapSuccess}`);
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
          className="flex items-center"
          role="navigation"
          aria-label="Navegación de páginas"
        >
          <DropdownFilter applyFilter={applyFilter} />

          <span className="hidden md:inline text-sm text-slate-500 mx-4 whitespace-nowrap">
            Página <span className="font-semibold text-slate-700">{currentPage}</span> de{" "}
            <span className="font-semibold text-slate-700">{totalPages}</span>
          </span>

          {/* Primera página */}
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1 || isLoading}
            aria-label="Primera página"
            className={`btn border-slate-200 mr-1 ${
              currentPage === 1 || isLoading
                ? "bg-white text-slate-300 cursor-not-allowed"
                : "bg-white hover:border-slate-300 text-black"
            }`}
          >
            «
          </button>

          {/* Página anterior */}
          <button
            onClick={handlePrevClick}
            disabled={currentPage === 1 || isLoading}
            aria-label="Página anterior"
            className={`btn border-slate-200 mr-1 ${
              currentPage === 1 || isLoading
                ? "bg-white text-slate-300 cursor-not-allowed"
                : "bg-white hover:border-slate-300 text-black"
            }`}
          >
            <ArrowLeft size={20} />
          </button>

          {/* Números de página */}
          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-slate-400 select-none"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => goToPage(page)}
                disabled={isLoading}
                aria-current={page === currentPage ? "page" : undefined}
                className={`btn border-slate-200 mr-1 ${
                  page === currentPage
                    ? "bg-primary text-white border-primary"
                    : "bg-white hover:border-slate-300 text-black"
                } ${isLoading ? "cursor-not-allowed" : ""}`}
              >
                {page}
              </button>
            )
          )}

          {/* Página siguiente */}
          <button
            onClick={handleNextClick}
            disabled={currentPage === totalPages || isLoading}
            aria-label="Página siguiente"
            className={`btn border-slate-200 mr-1 ${
              currentPage === totalPages || isLoading
                ? "bg-white text-slate-300 cursor-not-allowed"
                : "bg-white hover:border-slate-300 text-black"
            }`}
          >
            <ArrowRight size={20} />
          </button>

          {/* Última página */}
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages || isLoading}
            aria-label="Última página"
            className={`btn border-slate-200 ${
              currentPage === totalPages || isLoading
                ? "bg-white text-slate-300 cursor-not-allowed"
                : "bg-white hover:border-slate-300 text-black"
            }`}
          >
            »
          </button>
        </nav>
      </header>
      <div className="relative">
        {/* Loader overlay para cambios de página */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
              <span>Cargando logs...</span>
            </div>
          </div>
        )}
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
                        sapAttempted={element.pallet.sap_attempted}
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
