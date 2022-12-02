import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    table: undefined,
    token: undefined,
  },
  reducers: {
    setTable: (state, action) => {
      state.table = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
  },
});

export const { setTable, setToken } = authSlice.actions;

export default authSlice.reducer;
