import { createSlice } from "@reduxjs/toolkit";

export const errorsSlice = createSlice({
  name: "errors",
  initialState: [],
  reducers: {
    addError(state, action) {
      state.push(action.payload);
    },
    removeError(state) {
      return state.slice(1);
    },
  },
});

export const { addError, removeError } = errorsSlice.actions;

export default errorsSlice.reducer;
