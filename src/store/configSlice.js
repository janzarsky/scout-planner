import { createSlice } from "@reduxjs/toolkit";
import config from "../config.json";
import localConfig from "../config.local.json";

export const configSlice = createSlice({
  name: "config",
  initialState: {
    ...config,
    ...localConfig,
  },
});

export default configSlice.reducer;
