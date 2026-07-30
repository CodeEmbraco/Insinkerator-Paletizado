import { createAction, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { endpointsCodes } from './endpointCodes';

import { selectEventsLog, addEvent } from './eventsLogSlice';
import { notifyError } from '../../partials/paletization/Toasts';
import { isMonthEndLocked, getMonthEndSnapshot } from '../../utils/monthEndLock';


const initialState = {
    openOrdersList: [],
    loading: false,
  };

export const revertAll = createAction('REVERT_ALL');
export const revertSearch = createAction('REVERT_SEARCH');
const openOrdersSlice = createSlice({
    initialState,
    name: 'openOrders',
    extraReducers: (builder) => {
      builder.addCase(revertAll, () => initialState);
      builder.addCase(revertSearch, (state, action) => {
        state.search = [];
      });
    },
    reducers: {
      setOpenOrdersList: (state, action) => {
        state.openOrdersList = action.payload;
      },
      setLoading: (state, action) => {
        state.loading = action.payload;
      },
      setNotFound: (state, action) => {
        state.notFound = action.payload;
      },
    },
  });

  export const {
    setOpenOrdersList,
    setLoading,
    setNotFound
  } = openOrdersSlice.actions;

export const selectOpenOrdersList = (state) => state.openOrders.openOrdersList;
export const selectLoading = (state) => state.openOrders.loading;

export default openOrdersSlice.reducer;

export const getOpenOrdersList = () => (dispatch) => {
    // Cierre de mes activo: no consultar SAP, usar el snapshot congelado.
    if (isMonthEndLocked()) {
      dispatch(setOpenOrdersList(getMonthEndSnapshot()));
      return;
    }
    dispatch(setLoading(true));
    axios
      // _t evita que el navegador sirva una respuesta cacheada: sin esto, al
      // reactivar el cierre de mes se seguía viendo el listado congelado
      // hasta recargar la página.
      .get('http://10.13.225.20:8001/api/v1/orders', { params: { _t: Date.now() } })
      .then((response) => {
        dispatch(setLoading(false));
        if (response.status === 200) {
          const filtered_orders = response.data.filter(elemento => elemento.arbpl === "MX8ST040");
          console.log(filtered_orders);
          dispatch(setOpenOrdersList(filtered_orders));
        } else {
          notifyError("Ocurrió un error al obtener los órdenes desde SAP.")
        }
      })
      .catch((error) => {
        dispatch(setLoading(false));
        notifyError("Ocurrió un error al obtener los órdenes desde SAP.")
        endpointsCodes(error, dispatch, setNotFound)});
  };
  