import { createSlice } from "@reduxjs/toolkit";

export const viewSlice = createSlice({
  name: "view",
  initialState: {
    highlightingEnabled: false,
    highlightedPackages: [],
    viewPkg: true,
    viewTime: false,
    viewPeople: true,
    viewViolations: true,
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
    toggleViewPkg(state) {
      state.viewPkg = !state.viewPkg;
    },
    toggleViewTime(state) {
      state.viewTime = !state.viewTime;
    },
    toggleViewPeople(state) {
      state.viewPeople = !state.viewPeople;
    },
    toggleViewViolations(state) {
      state.viewViolations = !state.viewViolations;
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
  toggleViewPkg,
  toggleViewTime,
  toggleViewPeople,
  toggleViewViolations,
  toggleRangesEnabled,
  setActiveRange,
} = viewSlice.actions;

export default viewSlice.reducer;
