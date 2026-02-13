import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  getOpenOrdersList,
  selectOpenOrdersList,
} from "../../store/slice/ordersSlice";

import { selectComponents, selectComponentsInOrderList, selectPallet } from "../../store/slice/palletsSlice";

import ComponentsItem from "./ComponentsItem";
import { selectOrderSelected } from "../../store/slice/orderSelectedSlice";

function ComponentsTable() {
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
  const [list, setList] = useState(useSelector(selectOpenOrdersList));

  const componentsList = useSelector(selectComponentsInOrderList);

  const orderSelected = useSelector(selectOrderSelected);

  useEffect(() => {
    setList(componentsList);
  }, []);


  // useEffect(() => {
  //   console.log("first render")
  //   setList(orders);
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setIsCheck(list.map((li) => li.id));
    if (selectAll) {
      setIsCheck([]);
    }
  };

  const handleClick = (e) => {
    const { id, checked } = e.target;
    setSelectAll(false);
    setIsCheck([...isCheck, id]);
    if (!checked) {
      setIsCheck(isCheck.filter((item) => item !== id));
    }
  };

  return (
    <div className="bg-whiterounded-sm relative w-full">
      <header className="px-5 py-4">
        <h2 className="text-left font-semibold text-slate-800">
          Componentes realizados:{" "}
          <span className="text-slate-400 font-medium">
            {Array.isArray(componentsList) ? componentsList.length : "0"}
          </span>
          <p className="text-left font-medium text-gray">
          {orderSelected.aufnr
            ? `Órden: ${orderSelected.aufnr}`
            : "No se ha seleccionado una órden"}
        </p>
        </h2>
      </header>
      <div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-slate-500 bg-slate-50 border-t border-b border-slate-200">
              <tr>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">ID</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold">Código de mat. (UC)</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Serial (UC)</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">
                    Código de mat. (Compresor)
                  </div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">
                    Serial (Compresor)
                  </div>
                </th>
                {/* <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-center">Acciones</div>
                </th> */}
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-slate-200">
              {Array.isArray(componentsList) && componentsList.length > 0
                ? componentsList.map((component, index) => {
                  const rowNumber = index + 1;
                    return (
                      <ComponentsItem
                        key={component.id}
                        rowNumber={rowNumber}
                        id={component.id}
                        compMaterialCode={component.compressor_material_code}
                        compUnitSerial={component.compressor_unit_serial}
                        condMaterialCode={component.condenser_material_code}
                        condUnitSerial={component.condenser_unit_serial}  
                      />
                    );
                  })
                : ""}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ComponentsTable;
