import { createAction, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { endpointsCodes } from "./endpointCodes";

const initialState = {
  eventsLog: [],
  genealogyLog: [],
  paletizationLog: []
};

const eventsLogSlice = createSlice({
  initialState,
  name: "eventsLog",
  extraReducers: (builder) => {},
  reducers: {
    setEventsLog: (state, action) => {
      state.eventsLog = action.payload;
    },
    addEvent: (state, action) => {
      state.eventsLog = state.eventsLog.concat(action.payload);
    },
    setGenealogyLog: (state, action) => {
      state.eventsLog.genealogyLog = action.payload;
    },
    addEventToGenealogyLog: (state, action) => {
      state.genealogyLog = state.genealogyLog.concat(action.payload);
    },
    setPaletizationLog: (state, action) => {
      state.eventsLog.paletizationLog = action.payload;
    },
    addEventToPaletizationLog: (state, action) => {
      state.paletizationLog = state.paletizationLog.concat(action.payload);
    }
  },
});

export const {
  setEventsLog,
  addEvent,
  setGenealogyLog,
  addEventToGenealogyLog,
  setPaletizationLog,
  addEventToPaletizationLog
} = eventsLogSlice.actions;

export const selectEventsLog = (state) => state.eventsLog.eventsLog;

export const selectGenealogyLog = (state) => state.eventsLog.genealogyLog;

export const selectPaletizationLog = (state) => state.eventsLog.paletizationLog;

export default eventsLogSlice.reducer;
