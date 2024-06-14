import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSliceHook } from "./sliceHelper";

export const getRanges = createAsyncThunk(
  "ranges/getRanges",
  async (client) => await client.getRanges(),
);

export const rangesSlice = createSlice({
  name: "ranges",
  initialState: { ranges: [], loading: "idle", error: null, loaded: false },
  reducers: {
    addRange(state, action) {
      state.ranges.push(action.payload);
    },
    updateRange(state, action) {
      state.ranges = [
        ...state.ranges.filter((r) => r._id !== action.payload._id),
        action.payload,
      ];
    },
    deleteRange(state, action) {
      state.ranges = state.ranges.filter((r) => r._id !== action.payload);
    },
  },
  extraReducers(builder) {
    builder.addCase(getRanges.pending, (state) => {
      if (state.loading === "idle") {
        state.loading = "pending";
      }
    });

    builder.addCase(getRanges.fulfilled, (state, action) => {
      if (state.loading === "pending") {
        state.ranges = action.payload;
        state.loading = "idle";
        state.loaded = true;
      }
    });

    builder.addCase(getRanges.rejected, (state) => {
      if (state.loading === "pending") {
        state.loading = "idle";
        state.error = "Error";
      }
    });
  },
});

export const useGetRangesSlice = createSliceHook("ranges", getRanges);

export const { addRange, updateRange, deleteRange } = rangesSlice.actions;

export default rangesSlice.reducer;
