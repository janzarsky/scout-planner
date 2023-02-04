import { createSlice } from "@reduxjs/toolkit";

export const configSlice = createSlice({
  name: "config",
  initialState: {
    ...require("../config.json"),
    ...require("../config.local.json"),
  },
});

export default configSlice.reducer;
