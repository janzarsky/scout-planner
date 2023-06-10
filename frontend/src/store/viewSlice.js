import { createSlice } from "@reduxjs/toolkit";

export const viewSlice = createSlice({
  name: "view",
  initialState: {
    highlightingEnabled: false,
    highlightedPackages: [],
    rangesEnabled: false,
    activeRange: undefined,
  },
  reducers: {
    toggleHighlighting(state) {
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
    toggleRangesEnabled(state) {
      state.rangesEnabled = !state.rangesEnabled;
    },
    setActiveRange(state, action) {
      state.activeRange = action.payload;
    },
  },
});

export const {
  toggleHighlighting,
  toggleHighlightedPackage,
  toggleRangesEnabled,
  setActiveRange,
} = viewSlice.actions;

export default viewSlice.reducer;
