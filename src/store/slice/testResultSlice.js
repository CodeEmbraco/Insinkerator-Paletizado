import { createAction, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { endpointsCodes } from './endpointCodes';

const initialState = {
    globalStatus : '',
    testResults : []
}

const testResultsSlice = createSlice({
    initialState,
    name: 'testResults',
    extraReducers: (builder) => {
    },
    reducers: {
        setTestResults: (state, action) => {
          console.log("Setting test results")
          state.testResults = action.payload;
        },
        setGlobalStatus: (state, action) => {
            state.globalStatus = action.payload;
          }
      },
});

export const {
    setTestResults,
    setGlobalStatus
  } = testResultsSlice.actions;
  

export const selectTestResults = (state) => state.testResults.testResults;

export const selectGlobalStatus = (state) => state.testResults.globalStatus;

export default testResultsSlice.reducer;

async function call(url) {
    try {
        const res = await axios.get(url)
        return res.data
    } catch (error) {
        throw error
    }
}

function defineGlobalStatus(status1, status2) {
    if (status1 != 1) return status1
    if (status2 != 1) return status2
    return 1
}

export const getTestResults = (barcode) => async (dispatch) => {
    try {
        const data1 = await call(`http://em10vs0010.embraco.com:8001/api/v1/test-result?barcode=${barcode}`)
        const data2 = await call(`http://em10vs0010.embraco.com:8001/api/v1/test-result-daqsys?barcode=${barcode}`)

        console.log({ data1, data2 })

        dispatch(setTestResults([...data1.results, ...data2.results]))
        dispatch(setGlobalStatus(defineGlobalStatus(data1.global_status, data2.global_status)))
    } catch (error) {
        endpointsCodes(error, dispatch, setNotFound);
    }
  };
  