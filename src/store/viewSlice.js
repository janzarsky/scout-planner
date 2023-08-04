import { createSlice } from "@reduxjs/toolkit";

export const viewSlice = createSlice({
  name: "view",
  initialState: {
    highlightingEnabled: false,
    highlightedPackages: [],
    viewSettingsEnabled: false,
    viewPkg: true,
    viewTime: false,
    viewPeople: true,
    viewPlace: true,
    viewViolations: true,
    rangesEnabled: false,
    activeRange: undefined,
    peopleEnabled: false,
    activePerson: null,
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
          1,
        );
    },
    toggleViewSettingsEnabled(state) {
      state.viewSettingsEnabled = !state.viewSettingsEnabled;
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
    toggleViewPlace(state) {
      state.viewPlace = !state.viewPlace;
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
    togglePeopleEnabled(state) {
      state.peopleEnabled = !state.peopleEnabled;
    },
    setActivePerson(state, action) {
      state.activePerson = action.payload;
    },
  },
});

export const {
  toggleHighlighting,
  toggleHighlightedPackage,
  toggleViewSettingsEnabled,
  toggleViewPkg,
  toggleViewTime,
  toggleViewPeople,
  toggleViewPlace,
  toggleViewViolations,
  toggleRangesEnabled,
  setActiveRange,
  togglePeopleEnabled,
  setActivePerson,
} = viewSlice.actions;

export default viewSlice.reducer;
