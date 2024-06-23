import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { level } from "../helpers/Level";
import { createSliceHook } from "./sliceHelper";

const getPublicLevel = createAsyncThunk(
  "publicLevel/getPublicLevel",
  async (client) => await client.getPublicLevel(),
);

const publicLevelSlice = createSlice({
  name: "publicLevel",
  initialState: {
    publicLevel: level.NONE,
    loading: "idle",
    error: null,
    loaded: false,
  },
  reducers: {
    setPublicLevel(state, action) {
      state.publicLevel = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(getPublicLevel.pending, (state) => {
      if (state.loading === "idle") {
        state.loading = "pending";
      }
    });

    builder.addCase(getPublicLevel.fulfilled, (state, action) => {
      if (state.loading === "pending") {
        state.publicLevel = action.payload;
        state.loading = "idle";
        state.loaded = true;
      }
    });

    builder.addCase(getPublicLevel.rejected, (state) => {
      if (state.loading === "pending") {
        state.loading = "idle";
        state.error = "Error";
      }
    });
  },
});

export const useGetPublicLevelSlice = createSliceHook(
  "publicLevel",
  getPublicLevel,
);

export const { setPublicLevel } = publicLevelSlice.actions;

export default publicLevelSlice.reducer;
