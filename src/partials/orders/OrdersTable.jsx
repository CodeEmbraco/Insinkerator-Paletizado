import React, { useState, useEffect } from 'react';
import Order from './OrdersTableItem';
import { useSelector, useDispatch } from 'react-redux';

import {   getOpenOrdersList, selectOpenOrdersList } from '../../store/slice/ordersSlice';

function OrdersTable({
  selectedItems
}) {

  const orders = [
    {
      id: '0',
      name: '102343261',
      email: '515380138',
      location: 'UM2U3115U',
      orders: '363',
      lastOrder: '351',
      spent: '2023-06-14',
      refunds: '-',
      fav: true
    },
    {
      id: '1',
      name: '102349877',
      email: '513301867..ZP',
      location: 'EM3Y60HLP',
      orders: '500',
      lastOrder: '0',
      spent: '2023-06-07',
      refunds: '4',
      fav: false
    },
    {
      id: '2',
      name: '102355400',
      email: '113341219',
      location: '---',
      orders: '44200',
      lastOrder: '7688',
      spent: '2023-06-20',
      refunds: '1',
      fav: true
    },
  ];

  const [selectAll, setSelectAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);

  const dispatch = useDispatch();
  const openOrdersList = useSelector(selectOpenOrdersList);
  const [list, setList] = useState(useSelector(selectOpenOrdersList));

  useEffect(() => {
    dispatch(getOpenOrdersList());
  }, []);
  

  useEffect(() => {
    setList(openOrdersList);
  }, [openOrdersList]);

  // useEffect(() => {
  //   console.log("first render")
  //   setList(orders);
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setIsCheck(list.map(li => li.id));
    if (selectAll) {
      setIsCheck([]);
    }
  };

  const handleClick = e => {
    const { id, checked } = e.target;
    setSelectAll(false);
    setIsCheck([...isCheck, id]);
    if (!checked) {
      setIsCheck(isCheck.filter(item => item !== id));
    }
  };

  useEffect(() => {
    selectedItems(isCheck);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheck]);

  return (
    <div className="bg-white shadow-lg rounded-sm border border-slate-200 relative">
      <header className="px-5 py-4">
        <h2 className="text-left font-semibold text-slate-800">Todas las órdenes: <span className="text-slate-400 font-medium">{openOrdersList.length}</span></h2>
        <p className="text-left font-medium text-gray">Da click en un número de órden para empezar a trabajarla</p>
      </header>
      <div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-slate-500 bg-slate-50 border-t border-b border-slate-200">
              <tr>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Número de Órden</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Centro</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Modelo</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold">Planeado</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Apuntado</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Fecha orden</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-slate-200">
              {
                list.map(order => {
                  return (
                    <Order
                      key={order.id}
                      id={order.aufnr}
                      aufnr={order.aufnr}
                      arbpl={order.arbpl}
                      matnr={order.matnr}
                      qtdpl={order.qtdpl}
                      qtdpr={order.qtdpr}
                      gstrp={order.gstrp}
                      components={order.components}
                    />
                  )
                })
              }
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}

export default OrdersTable;
