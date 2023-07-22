import { createSlice } from "@reduxjs/toolkit";
import config from "../config.json";

var localConfig = {};

try {
  localConfig = require("../config.local.json");
} catch {}

export const configSlice = createSlice({
  name: "config",
  initialState: {
    ...config,
    ...localConfig,
  },
});

export default configSlice.reducer;
