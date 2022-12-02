import { createSlice } from "@reduxjs/toolkit";

export const viewSlice = createSlice({
  name: "view",
  initialState: { highlightingEnabled: false, highlightedPackages: [] },
  reducers: {
    toggleHighlighting(state, action) {
      state.highlightingEnabled = !state.highlightingEnabled;
    },
    toggleHighlightedPackage(state, action) {
      if (state.highlightedPackages.indexOf(action.payload) === -1)
        state.highlightedPackages.push(action.payload);
      else
        state.highlightedPackages.splice(
          state.highlightedPackages.indexOf(action.payload),
          1
        );
    },
  },
});

export const { toggleHighlighting, toggleHighlightedPackage } =
  viewSlice.actions;

export default viewSlice.reducer;
