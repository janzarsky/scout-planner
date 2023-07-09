import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const getSettings = createAsyncThunk(
  "settings/getSettings",
  async (client) => ({
    timeStep: 15 * 60 * 1000,
    width: 100,
    ...(await client.getSettings()),
  }),
);

export const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    settings: { timeStep: 15 * 60 * 1000, width: 100 },
    loading: "idle",
    error: null,
    loaded: false,
  },
  reducers: {
    updateSettings(state, action) {
      state.settings = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(getSettings.pending, (state) => {
      if (state.loading === "idle") {
        state.loading = "pending";
      }
    });

    builder.addCase(getSettings.fulfilled, (state, action) => {
      if (state.loading === "pending") {
        state.settings = action.payload;
        state.loading = "idle";
        state.loaded = true;
      }
    });

    builder.addCase(getSettings.rejected, (state) => {
      if (state.loading === "pending") {
        state.loading = "idle";
        state.error = "Error";
      }
    });
  },
});

export const { updateSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
