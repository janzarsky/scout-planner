import { createSlice } from "@reduxjs/toolkit";
import config from "../config.json";
import localConfig from "../config.local.json";

export const configSlice = createSlice({
  name: "config",
  initialState: {
    ...config,
    ...localConfig,
  },
  reducers: {
    overrideConfig(state, action) {
      return { ...state, ...action.payload };
    },
  },
});

export const { overrideConfig } = configSlice.actions;

export default configSlice.reducer;
