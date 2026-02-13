import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { endpointsCodes } from "./endpointCodes";
import { notifyError } from "../../partials/paletization/Toasts";

const initialState = {
  orderSelected: {},
  metadataOrderSelected: [],
  palletAmount: 0,
};

const orderSelectedSlice = createSlice({
  initialState,
  name: "orderSelected",
  extraReducers: (builder) => {},
  reducers: {
    setOrderSelected: (state, action) => {
      state.orderSelected = action.payload;
    },
    setMetadataOrderSelected: (state, action) => {
      state.metadataOrderSelected = action.payload;
    },
    setPalletAmount: (state, action) => {
      state.palletAmount = action.payload;
    },
  },
});

export const { setOrderSelected, setMetadataOrderSelected, setPalletAmount } =
  orderSelectedSlice.actions;

export const selectOrderSelected = (state) => state.orderSelected.orderSelected;
export const metadataOrderSelected = (state) =>
  state.orderSelected.metadataOrderSelected;
export const palletAmount = (state) => state.orderSelected.palletAmount;

export const getMetadataFromOrder = (idMaterial) => (dispatch) => {
  axios
    .get(
      `http://10.13.225.20:8001/api/v1/material-metadata?id_material=${idMaterial}`
    )
    .then((response) => {
      if (response.status === 200) {
        const desiredCaractIDs = [
          151, 119, 3, 4, 119, 118, 1, 120, 181, 115, 185,
        ];
        const selecteCaract = response.data.filter((obj) =>
          desiredCaractIDs.includes(obj.ID_CARACTMATERIAL)
        );
        console.log(selecteCaract);
        dispatch(setMetadataOrderSelected(selecteCaract));
        if (selecteCaract.length > 0) {
          const palletAmount = selecteCaract.find(
            (obj) => obj.ID_CARACTMATERIAL === 185
          )?.DE_VALORCARACTMAT;
          dispatch(setPalletAmount(palletAmount));
        }
      } else {
        notifyError("No se encontró el id de material " + idMaterial);
      }
    })
    .catch((error) => {
      notifyError("No se encontró el id de material " + idMaterial);
      endpointsCodes(error, dispatch, setNotFound);
    });
};

export const getPalletSeriesFromSAP =
  (aufnr, matnr, palletNumber, box_number) => async (dispatch) => {
    console.log("Get Pallet Series From SAP ");
    const xmlData = {
      numin: "F",
      aufnr: aufnr,
      matnr: matnr,
      pallet: palletNumber,
      box_number: box_number,
    };

    console.log("Llamando series guardades con xmldata", xmlData);
    try {
      const response = await fetch(
        `http://10.13.225.20:9003/api/v1/paletization/pallets/sap/get_pallet_series/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(xmlData),
        }
      );

      if (!response.ok) {
        notifyError("Hubo un error recuperando la data de la orden")
      }

      const data = await response.json();

      console.log("OBTENIENDO PALLET SERIAL FROM SAP ");
      console.log("Response Desde la FUncion: ", data);

      const parsedData = JSON.parse(data.EJsonHeader);

      dispatch(setMetadataOrderSelected(parsedData));
      dispatch(setPalletAmount(parsedData.pallet.to));
    } catch (error) {
      console.error(error);
    }
  };

export default orderSelectedSlice.reducer;
