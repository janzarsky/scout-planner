import { createSlice } from "@reduxjs/toolkit";

var localConfig = {};

try {
  localConfig = require("../config.local.json");
} catch {}

export const configSlice = createSlice({
  name: "config",
  initialState: {
    ...require("../config.json"),
    ...localConfig,
  },
});

export default configSlice.reducer;
