import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedProduct: null,
    selectedAccessories: null,
    qrCode: '',
    selectBarcodeProduct: null,
};

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setSelectedAccessories(state, action){
            state.selectedAccessories = action.payload;
        },

        setSelectedProduct(state, action) {
            state.selectedProduct = action.payload;
        },
        addSerial(state, action) {
            state.qrCode += `${action.payload}|`;
        },
        clearQRCode(state, action){
            state.qrCode = '';
        },
        // Esta es la acción que te interesa, setBarcodeProduct
        //setBarcodeProduct(state, action) {
       //     state.barcodeProduct = action.payload;  // Actualiza barcodeProduct en el estado
        //},

        // Esta es la acción que te interesa, setBarcodeProduct
        setSelectBarcodeProduct(state, action) {
            state.selectBarcodeProduct = action.payload;  // Actualiza barcodeProduct en el estado
        }
    }
});

export const selectSelectedProduct = (state) => state.product.selectedProduct;
export const selectSelectedAccessories = (state) => state.product.selectedAccessories;
export const selectQrCode = (state) => state.product.qrCode;
//export const selectBarcodeProduct = (state) => state.product.barcodeProduct;
export const selectBarcodeProduct = (state) => state.product?.selectBarcodeProduct;
export const { setSelectedProduct, addSerial, clearQRCode } = productSlice.actions;
export const { setSelectedAccessories, addSerialAccessories } = productSlice.actions;
export const { setSelectBarcodeProduct } = productSlice.actions;

// Aquí exportas las acciones y los selectores
//export const { setSelectedProduct, setSelectedAccessories, addSerial, clearQRCode, setBarcodeProduct } = productSlice.actions;
/*export const { 
  setSelectedProduct, 
  setSelectedAccessories, 
  addSerial, 
  clearQRCode, 
  setBarcodeProduct, 
  addSerialAccessories 
} = productSlice.actions;*/


export default productSlice.reducer;
